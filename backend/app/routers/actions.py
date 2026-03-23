import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import OpenClawActionRequest, OpenClawActionResponse
from app.services.openclaw_service import OpenClawService, get_openclaw_service
from app.services.settings_service import get_settings_service
from app.services.git_service import get_git_service
from app.services.vscode_service import get_vscode_service
from app.services.macos_service import get_macos_service
from app.services.ws_manager import get_ws_manager

logger = logging.getLogger(__name__)
router = APIRouter()

HISTORY_FILE = Path(__file__).parent.parent.parent / "data" / "actions_history.json"

# Map step service names to their singleton getters (services with run_action)
_SERVICE_MAP = {
    "git": get_git_service,
    "vscode": get_vscode_service,
    "macos": get_macos_service,
}


@router.post("/actions/openclaw", response_model=OpenClawActionResponse)
async def openclaw_action(
    request: OpenClawActionRequest,
    openclaw_service: OpenClawService = Depends(get_openclaw_service),
) -> OpenClawActionResponse:
    """Trigger a predefined OpenClaw action (stub)."""
    return openclaw_service.run_action(
        action=request.action,
        params=request.params,
    )


@router.post("/actions/run")
async def run_quick_action(body: Dict[str, Any]) -> Dict[str, Any]:
    """Find a quick action by id from settings, execute its steps, and log history.

    Body: {"action_id": "..."}
    """
    action_id = body.get("action_id", "")
    if not action_id:
        raise HTTPException(400, "action_id is required")

    # Look up the action definition
    settings = get_settings_service().load()
    actions = settings.get("quick_actions", [])
    action_def = next((a for a in actions if a.get("id") == action_id), None)
    if not action_def:
        raise HTTPException(404, f"Action '{action_id}' not found")

    action_name = action_def.get("name", action_id)
    steps = action_def.get("steps", [])
    started_at = datetime.now(timezone.utc).isoformat()
    step_results: List[Dict[str, Any]] = []
    overall_status = "success"
    error_msg = None

    try:
        for i, step in enumerate(steps):
            service_name = step.get("service", step.get("type", ""))
            step_action = step.get("action", step.get("command", ""))
            step_params = dict(step.get("params", {}))

            # For git steps, the command may be stored in params or action
            if service_name == "git" and not step_action:
                step_action = step_params.pop("command", "status")

            svc_getter = _SERVICE_MAP.get(service_name)
            if not svc_getter:
                step_results.append(
                    {
                        "step": i + 1,
                        "service": service_name,
                        "status": "skipped",
                        "detail": f"Unknown service '{service_name}'",
                    }
                )
                continue

            svc = svc_getter()
            result = await svc.run_action(step_action, step_params)
            step_status = result.get("status", "ok")
            step_results.append(
                {
                    "step": i + 1,
                    "service": service_name,
                    "action": step_action,
                    "status": step_status,
                    "detail": result.get("detail", ""),
                }
            )

            if step_status == "error":
                overall_status = "failed"
                error_msg = result.get("detail", f"Step {i + 1} failed")
                break

    except Exception as exc:
        overall_status = "failed"
        error_msg = str(exc)
        logger.warning("Quick action '%s' failed at step: %s", action_name, exc)
    finally:
        finished_at = datetime.now(timezone.utc).isoformat()
        _append_history(
            {
                "action_name": action_name,
                "action_id": action_id,
                "started_at": started_at,
                "finished_at": finished_at,
                "status": overall_status,
                "steps": step_results,
                "error": error_msg,
            }
        )

    # Broadcast completion via WebSocket
    try:
        ws = get_ws_manager()
        severity = "info" if overall_status == "success" else "error"
        await ws.broadcast(
            {
                "type": "status_alert",
                "component": "actions",
                "message": f"Action '{action_name}' {overall_status}",
                "severity": severity,
            }
        )
    except Exception:
        pass

    return {
        "status": overall_status,
        "action_name": action_name,
        "steps": step_results,
        "error": error_msg,
    }


@router.get("/actions/history")
async def get_action_history(limit: int = 20) -> Dict[str, Any]:
    """Return the last N quick action run records."""
    history = _load_history()
    return {"history": history[-limit:]}


@router.post("/actions/history")
async def log_action_run(record: Dict[str, Any]) -> Dict[str, Any]:
    """Log a quick action run result (client-side fallback)."""
    _append_history(record)
    return {"success": True}


def _append_history(record: Dict[str, Any]) -> None:
    """Append a single record to history and persist."""
    history = _load_history()
    record.setdefault("started_at", datetime.now(timezone.utc).isoformat())
    history.append(record)
    if len(history) > 100:
        history = history[-100:]
    _save_history(history)


def _load_history() -> List[Dict[str, Any]]:
    """Load action history from disk."""
    if not HISTORY_FILE.exists():
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.warning("Failed to load action history: %s", exc)
        return []


def _save_history(history: List[Dict[str, Any]]) -> None:
    """Persist action history to disk."""
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.warning("Failed to save action history: %s", exc)
