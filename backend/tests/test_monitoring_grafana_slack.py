"""Tests for Monitoring & Power UX features (Prompt 6).

Covers:
- Slack webhook relay endpoint formatting
- Grafana dashboard JSON validity
- Force resident cycle endpoint
- History CSV download
- Graceful shutdown endpoint
"""
import csv
import io
import json
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim (matches conftest.py pattern) ──────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


# ── Shared fixture ────────────────────────────────────────────

@pytest.fixture
def client():
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


# ═══════════════════════════════════════════════════════════════
# 1. Slack webhook endpoint formats correctly
# ═══════════════════════════════════════════════════════════════

class TestSlackWebhookEndpointFormatsCorrectly:
    """POST /api/alerts/slack – skips send when no webhook URL, returns correct shape."""

    def test_slack_alert_skipped_when_no_webhook_url(self, client: TestClient):
        """When SLACK_WEBHOOK_URL is not set, endpoint returns status=skipped."""
        with patch.dict("os.environ", {"SLACK_WEBHOOK_URL": ""}, clear=False):
            payload = {
                "status": "firing",
                "alerts": [
                    {
                        "status": "firing",
                        "labels": {"alertname": "TestAlert", "severity": "critical"},
                        "annotations": {
                            "summary": "Test summary",
                            "description": "Test description",
                        },
                        "generatorURL": "http://localhost:3001/alert",
                    }
                ],
            }
            resp = client.post("/api/alerts/slack", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "skipped"
        assert "SLACK_WEBHOOK_URL" in data["reason"]
        assert data["alerts_count"] == 1

    def test_slack_alert_sends_when_webhook_configured(self, client: TestClient):
        """When SLACK_WEBHOOK_URL is set, endpoint POSTs to Slack."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status.return_value = None

        mock_client_ctx = AsyncMock()
        mock_client_ctx.__aenter__ = AsyncMock(return_value=AsyncMock(
            post=AsyncMock(return_value=mock_response)
        ))
        mock_client_ctx.__aexit__ = AsyncMock(return_value=False)

        with patch.dict("os.environ", {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/test"}, clear=False):
            with patch("httpx.AsyncClient", return_value=mock_client_ctx):
                payload = {"status": "resolved", "alerts": []}
                resp = client.post("/api/alerts/slack", json=payload)

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "sent"
        assert data["alerts_count"] == 0

    def test_slack_message_built_from_grafana_payload(self, client: TestClient):
        """Firing alert with 2 alerts → skipped (no webhook), shape is correct."""
        with patch.dict("os.environ", {"SLACK_WEBHOOK_URL": ""}, clear=False):
            payload = {
                "status": "firing",
                "alerts": [
                    {
                        "labels": {"alertname": "A1", "severity": "critical", "instance": "hub"},
                        "annotations": {"summary": "S1", "description": "D1"},
                        "generatorURL": "http://g/1",
                    },
                    {
                        "labels": {"alertname": "A2", "severity": "warning"},
                        "annotations": {"summary": "S2"},
                        "generatorURL": "",
                    },
                ],
            }
            resp = client.post("/api/alerts/slack", json=payload)
        assert resp.status_code == 200
        assert resp.json()["alerts_count"] == 2

    def test_slack_test_endpoint_returns_200(self, client: TestClient):
        """POST /api/alerts/test should return 200 (skipped or sent)."""
        with patch.dict("os.environ", {"SLACK_WEBHOOK_URL": ""}, clear=False):
            resp = client.post("/api/alerts/test")
        assert resp.status_code == 200
        assert resp.json()["status"] in ("skipped", "sent")

    def test_slack_alert_empty_payload_accepted(self, client: TestClient):
        """Empty payload should be accepted (alerts defaults to [])."""
        with patch.dict("os.environ", {"SLACK_WEBHOOK_URL": ""}, clear=False):
            resp = client.post("/api/alerts/slack", json={})
        assert resp.status_code == 200


# ═══════════════════════════════════════════════════════════════
# 2. Grafana dashboard JSON valid
# ═══════════════════════════════════════════════════════════════

DASHBOARD_PATH = (
    Path(__file__).parent.parent.parent
    / "grafana" / "provisioning" / "dashboards" / "ai-home-hub.json"
)


class TestGrafanaDashboardJsonValid:
    """Validate the Grafana dashboard JSON file structure."""

    def test_dashboard_file_exists(self):
        assert DASHBOARD_PATH.exists(), f"Dashboard not found: {DASHBOARD_PATH}"

    def test_dashboard_is_valid_json(self):
        content = DASHBOARD_PATH.read_text()
        dashboard = json.loads(content)
        assert isinstance(dashboard, dict)

    def test_dashboard_has_required_fields(self):
        dashboard = json.loads(DASHBOARD_PATH.read_text())
        required = ["title", "panels", "schemaVersion", "uid"]
        for field in required:
            assert field in dashboard, f"Missing field: {field}"

    def test_dashboard_has_five_panels(self):
        dashboard = json.loads(DASHBOARD_PATH.read_text())
        panels = dashboard.get("panels", [])
        assert len(panels) == 5, f"Expected 5 panels, got {len(panels)}"

    def test_dashboard_panels_have_required_fields(self):
        dashboard = json.loads(DASHBOARD_PATH.read_text())
        for i, panel in enumerate(dashboard["panels"]):
            assert "title" in panel, f"Panel {i} missing title"
            assert "type" in panel, f"Panel {i} missing type"
            assert "targets" in panel, f"Panel {i} missing targets"
            assert len(panel["targets"]) >= 1, f"Panel {i} has no targets"

    def test_dashboard_uid_is_set(self):
        dashboard = json.loads(DASHBOARD_PATH.read_text())
        assert dashboard["uid"] == "ai-home-hub-resident"

    def test_dashboard_refresh_interval(self):
        dashboard = json.loads(DASHBOARD_PATH.read_text())
        assert dashboard.get("refresh") == "30s"

    def test_dashboard_panels_cover_resident_metrics(self):
        """All panel targets should reference Prometheus expressions."""
        dashboard = json.loads(DASHBOARD_PATH.read_text())
        all_exprs = []
        for panel in dashboard["panels"]:
            for target in panel.get("targets", []):
                expr = target.get("expr", "")
                if expr:
                    all_exprs.append(expr)

        # At least some resident_cycles_total expressions present
        assert any("resident_cycles" in e for e in all_exprs), "Missing resident_cycles metric"
        assert any("agent_memory" in e for e in all_exprs), "Missing agent_memory metric"
        assert any("kb_reindex" in e for e in all_exprs), "Missing kb_reindex metric"


# ═══════════════════════════════════════════════════════════════
# 3. Force cycle triggers immediately
# ═══════════════════════════════════════════════════════════════

class TestForceCycleTriggersImmediately:
    """POST /api/control/resident/force-cycle"""

    def _running_agent(self):
        """Return a mock resident agent that looks running."""
        agent = MagicMock()
        agent.get_state.return_value = {
            "is_running": True,
            "paused": False,
            "status": "idle",
        }
        agent.trigger_immediate_cycle = AsyncMock()
        return agent

    def test_force_cycle_returns_triggered(self, client: TestClient):
        agent = self._running_agent()
        with patch("app.services.resident_agent.get_resident_agent", return_value=agent):
            with patch("app.routers.control.get_resident_agent", return_value=agent):
                resp = client.post("/api/control/resident/force-cycle")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "triggered"

    def test_force_cycle_rejected_when_not_running(self, client: TestClient):
        agent = MagicMock()
        agent.get_state.return_value = {"is_running": False, "paused": False}
        with patch("app.routers.control.get_resident_agent", return_value=agent):
            resp = client.post("/api/control/resident/force-cycle")
        assert resp.status_code == 409
        assert "not running" in resp.json()["detail"].lower()

    def test_force_cycle_rejected_when_paused(self, client: TestClient):
        agent = MagicMock()
        agent.get_state.return_value = {"is_running": True, "paused": True}
        with patch("app.routers.control.get_resident_agent", return_value=agent):
            resp = client.post("/api/control/resident/force-cycle")
        assert resp.status_code == 409
        assert "paused" in resp.json()["detail"].lower()

    def test_force_cycle_uses_event_fallback(self, client: TestClient):
        """When trigger_immediate_cycle is absent, uses _force_cycle_event.set()."""
        agent = MagicMock(spec=[])  # empty spec – no attributes
        agent.get_state = MagicMock(return_value={"is_running": True, "paused": False})
        event = MagicMock()
        agent._force_cycle_event = event

        with patch("app.routers.control.get_resident_agent", return_value=agent):
            resp = client.post("/api/control/resident/force-cycle")
        assert resp.status_code == 200
        event.set.assert_called_once()


# ═══════════════════════════════════════════════════════════════
# 4. History CSV download no errors
# ═══════════════════════════════════════════════════════════════

class TestHistoryCsvDownloadNoErrors:
    """GET /api/control/resident/history/csv"""

    def _mock_db(self, rows):
        db = MagicMock()
        db.get_history.return_value = rows
        return db

    def test_csv_download_returns_200(self, client: TestClient):
        rows = [
            {
                "id": 1, "timestamp": "2024-01-01T00:00:00Z",
                "cycle_id": "c1", "cycle_number": 1, "status": "success",
                "action_type": "kb_reindex", "action_target": "", "output_preview": "ok",
                "duration_ms": 1234.5, "error": "",
            }
        ]
        db = self._mock_db(rows)
        with patch("app.routers.control.get_resident_state_db", return_value=db):
            with patch("app.db.resident_state.get_resident_state_db", return_value=db):
                resp = client.get("/api/control/resident/history/csv?limit=10")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]

    def test_csv_content_has_header(self, client: TestClient):
        db = self._mock_db([])
        with patch("app.routers.control.get_resident_state_db", return_value=db):
            resp = client.get("/api/control/resident/history/csv")
        assert resp.status_code == 200
        lines = resp.text.strip().splitlines()
        assert lines[0].startswith("id,timestamp")

    def test_csv_content_has_data_rows(self, client: TestClient):
        rows = [
            {"id": i, "timestamp": f"2024-01-0{i}T00:00:00Z", "cycle_id": f"c{i}",
             "cycle_number": i, "status": "success", "action_type": "", "action_target": "",
             "output_preview": "", "duration_ms": 100.0, "error": ""}
            for i in range(1, 4)
        ]
        db = self._mock_db(rows)
        with patch("app.routers.control.get_resident_state_db", return_value=db):
            resp = client.get("/api/control/resident/history/csv?limit=5")
        assert resp.status_code == 200
        reader = csv.DictReader(io.StringIO(resp.text))
        result_rows = list(reader)
        assert len(result_rows) == 3
        assert result_rows[0]["status"] == "success"

    def test_csv_content_disposition_header(self, client: TestClient):
        db = self._mock_db([])
        with patch("app.routers.control.get_resident_state_db", return_value=db):
            resp = client.get("/api/control/resident/history/csv?limit=500")
        assert "attachment" in resp.headers.get("content-disposition", "")
        assert "500rows" in resp.headers.get("content-disposition", "")

    def test_csv_limit_param_passed_to_db(self, client: TestClient):
        db = self._mock_db([])
        with patch("app.routers.control.get_resident_state_db", return_value=db):
            client.get("/api/control/resident/history/csv?limit=250&status=success")
        db.get_history.assert_called_once_with(limit=250, status="success")


# ═══════════════════════════════════════════════════════════════
# 5. Graceful shutdown waits for jobs
# ═══════════════════════════════════════════════════════════════

class TestGracefulShutdownWaitsForJobs:
    """POST /api/control/shutdown-graceful"""

    def test_graceful_shutdown_schedules_sigterm(self, client: TestClient):
        """Endpoint returns shutdown_scheduled and does not immediately kill."""
        with patch.dict("os.environ", {"ENABLE_GRACEFUL_SHUTDOWN": "true"}, clear=False):
            with patch("app.routers.control.asyncio.create_task") as mock_task:
                resp = client.post(
                    "/api/control/shutdown-graceful",
                    json={"reason": "test", "delay_seconds": 5},
                )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "shutdown_scheduled"
        assert data["delay_seconds"] == 5
        assert data["reason"] == "test"
        assert "pid" in data
        mock_task.assert_called_once()

    def test_graceful_shutdown_disabled_returns_403(self, client: TestClient):
        with patch.dict("os.environ", {"ENABLE_GRACEFUL_SHUTDOWN": "false"}, clear=False):
            # Need to reload the module to pick up env change
            import app.routers.control as ctrl_module
            original = ctrl_module.GRACEFUL_SHUTDOWN_ENABLED
            ctrl_module.GRACEFUL_SHUTDOWN_ENABLED = False
            try:
                resp = client.post("/api/control/shutdown-graceful", json={})
            finally:
                ctrl_module.GRACEFUL_SHUTDOWN_ENABLED = original
        assert resp.status_code == 403

    def test_graceful_shutdown_delay_clamped(self, client: TestClient):
        """Delay is clamped to [1, 30] range."""
        with patch("app.routers.control.asyncio.create_task"):
            resp = client.post(
                "/api/control/shutdown-graceful",
                json={"delay_seconds": 999},
            )
        assert resp.status_code == 200
        assert resp.json()["delay_seconds"] == 30

    def test_graceful_shutdown_default_delay(self, client: TestClient):
        with patch("app.routers.control.asyncio.create_task"):
            resp = client.post("/api/control/shutdown-graceful", json={})
        assert resp.status_code == 200
        assert resp.json()["delay_seconds"] >= 1

    def test_kb_purge_cache_endpoint(self, client: TestClient):
        """POST /api/control/kb/purge-cache returns 200."""
        mock_path = MagicMock()
        mock_path.exists.return_value = False  # no file to delete

        import app.routers.control as ctrl_mod
        original = ctrl_mod._kb_stats_cache_mod.CACHE_FILE
        ctrl_mod._kb_stats_cache_mod.CACHE_FILE = mock_path
        try:
            resp = client.post("/api/control/kb/purge-cache")
        finally:
            ctrl_mod._kb_stats_cache_mod.CACHE_FILE = original
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "purged"
