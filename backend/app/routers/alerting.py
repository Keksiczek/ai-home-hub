"""Alerting router – Slack webhook relay and Grafana annotation proxy."""

import logging
import os
import time
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["alerting"])


# ── Request models ───────────────────────────────────────────


class GrafanaAlert(BaseModel):
    status: str = ""
    labels: Dict[str, str] = {}
    annotations: Dict[str, str] = {}
    generatorURL: str = ""
    fingerprint: str = ""
    startsAt: str = ""
    endsAt: str = ""
    values: Optional[Dict[str, Any]] = None


class SlackAlertPayload(BaseModel):
    alerts: List[GrafanaAlert] = []
    status: str = "firing"
    groupLabels: Dict[str, str] = {}
    commonLabels: Dict[str, str] = {}
    commonAnnotations: Dict[str, str] = {}
    externalURL: str = ""
    version: str = "1"
    groupKey: str = ""
    title: Optional[str] = None
    message: Optional[str] = None


class AnnotationPayload(BaseModel):
    time: Optional[int] = None  # unix ms; defaults to now
    timeEnd: Optional[int] = None
    tags: List[str] = []
    title: str
    text: str = ""
    dashboardUID: Optional[str] = None
    panelId: Optional[int] = None


# ── Helpers ──────────────────────────────────────────────────


def _slack_webhook_url() -> str:
    url = os.environ.get("SLACK_WEBHOOK_URL", "")
    return url


def _build_slack_message(payload: SlackAlertPayload) -> Dict[str, Any]:
    """Format Grafana alert payload into a Slack message dict."""
    if payload.title or payload.message:
        # Simple direct message
        return {
            "text": f"{payload.title or ''}\n{payload.message or ''}".strip(),
            "username": "AI Home Hub",
            "icon_emoji": ":robot_face:",
        }

    status_emoji = "🔴" if payload.status == "firing" else "✅"
    lines = [f"{status_emoji} *AI Home Hub Alert – {payload.status.upper()}*"]

    for alert in payload.alerts:
        summary = alert.annotations.get(
            "summary", alert.labels.get("alertname", "Alert")
        )
        description = alert.annotations.get("description", "")
        instance = alert.labels.get("instance", "unknown")
        severity = alert.labels.get("severity", "info")

        lines.append(f"\n🔔 *{summary}*")
        if description:
            lines.append(f"  {description}")
        lines.append(f"  📊 Instance: `{instance}` | Severity: `{severity}`")
        if alert.generatorURL:
            lines.append(f"  🔗 <{alert.generatorURL}|View in Grafana>")

    return {
        "text": "\n".join(lines),
        "username": "AI Home Hub",
        "icon_emoji": ":robot_face:",
        "channel": "#ai-home-hub",
    }


# ── Endpoints ────────────────────────────────────────────────


@router.post("/slack")
async def relay_slack_alert(payload: SlackAlertPayload) -> Dict[str, Any]:
    """Relay a Grafana alert payload to the configured Slack webhook.

    Grafana contact point should point to:
    http://app:8000/api/alerts/slack
    """
    webhook_url = _slack_webhook_url()
    if not webhook_url:
        logger.warning("SLACK_WEBHOOK_URL not configured – alert not forwarded")
        return {
            "status": "skipped",
            "reason": "SLACK_WEBHOOK_URL not set",
            "alerts_count": len(payload.alerts),
        }

    message = _build_slack_message(payload)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(webhook_url, json=message)
            resp.raise_for_status()
        logger.info(
            "Slack alert forwarded: status=%s alerts=%d",
            payload.status,
            len(payload.alerts),
        )
        return {
            "status": "sent",
            "slack_status_code": resp.status_code,
            "alerts_count": len(payload.alerts),
        }
    except httpx.HTTPStatusError as exc:
        logger.error("Slack webhook returned error: %s", exc)
        raise HTTPException(status_code=502, detail=f"Slack webhook error: {exc}")
    except Exception as exc:
        logger.error("Failed to send Slack alert: %s", exc)
        raise HTTPException(status_code=500, detail=f"Alert relay failed: {exc}")


@router.post("/test")
async def test_slack_alert() -> Dict[str, Any]:
    """Send a test alert to Slack to verify webhook configuration."""
    test_payload = SlackAlertPayload(
        status="firing",
        title="🧪 AI Home Hub – Test Alert",
        message="Toto je testovací alert. Slack integrace funguje správně.",
    )
    return await relay_slack_alert(test_payload)


# ── Grafana annotation proxy ──────────────────────────────────


@router.post("/annotation")
async def create_grafana_annotation(payload: AnnotationPayload) -> Dict[str, Any]:
    """Create a Grafana annotation from the app (e.g., on cycle failure).

    Forwards to Grafana's annotation API.
    Requires GRAFANA_URL and optionally GRAFANA_API_KEY env vars.
    """
    grafana_url = os.environ.get("GRAFANA_URL", "http://grafana:3000").rstrip("/")
    grafana_key = os.environ.get("GRAFANA_API_KEY", "")
    grafana_user = os.environ.get("GRAFANA_USER", "admin")
    grafana_password = os.environ.get("GRAFANA_PASSWORD", "hub123")

    annotation_body: Dict[str, Any] = {
        "time": payload.time or int(time.time() * 1000),
        "tags": payload.tags,
        "title": payload.title,
        "text": payload.text,
    }
    if payload.timeEnd:
        annotation_body["timeEnd"] = payload.timeEnd
    if payload.dashboardUID:
        annotation_body["dashboardUID"] = payload.dashboardUID
    if payload.panelId is not None:
        annotation_body["panelId"] = payload.panelId

    headers: Dict[str, str] = {"Content-Type": "application/json"}
    auth = None
    if grafana_key:
        headers["Authorization"] = f"Bearer {grafana_key}"
    else:
        auth = (grafana_user, grafana_password)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                f"{grafana_url}/api/annotations",
                json=annotation_body,
                headers=headers,
                auth=auth,
            )
            resp.raise_for_status()
        result = resp.json()
        logger.info(
            "Grafana annotation created: id=%s title=%s",
            result.get("id"),
            payload.title,
        )
        return {
            "status": "created",
            "annotation_id": result.get("id"),
            "title": payload.title,
        }
    except Exception as exc:
        logger.warning("Failed to create Grafana annotation: %s", exc)
        # Non-fatal – return warning instead of 500
        return {"status": "error", "detail": str(exc)}
