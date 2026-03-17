"""UI-polish regression tests (ÚKOL 5).

Covers:
1. Resident dashboard endpoint returns required fields (status, uptime_seconds,
   heartbeat_status, stats_24h, recent_tasks) so the UI can render without errors.
2. Jobs API returns duration-related timestamp fields (created_at, started_at,
   finished_at) that the frontend uses in formatJobDuration().
"""
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim ──────────────────────────────────────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


# ── Test 1: Resident dashboard error visibility ────────────────────────────────

class TestResidentDashboard:
    """The dashboard endpoint must always return a usable JSON payload.

    When the endpoint returns a non-2xx status the frontend renders an inline
    error box with a 'Zkusit znovu' retry button instead of a blank page.
    This test verifies the *happy path* structure so we can detect regressions
    that would silently break the error-state display (e.g. missing keys that
    cause the JS renderer to throw before reaching the error handler).
    """

    def test_dashboard_returns_required_fields(self, client: TestClient):
        resp = client.get("/api/resident/dashboard")
        # The endpoint must respond – 200 means agent is stopped (default state).
        assert resp.status_code == 200, resp.text
        data = resp.json()

        # Fields consumed by renderResidentDashboard() in app.js
        assert "status" in data, "Missing 'status' – UI cannot render status indicator"
        assert "uptime_seconds" in data, "Missing 'uptime_seconds' – UI cannot render uptime"
        assert "heartbeat_status" in data, "Missing 'heartbeat_status' – UI cannot render heartbeat badge"
        assert "stats_24h" in data, "Missing 'stats_24h' – UI cannot render stat cards"
        assert "recent_tasks" in data, "Missing 'recent_tasks' – UI cannot render task table"
        assert isinstance(data["recent_tasks"], list), "'recent_tasks' must be a list"

    def test_dashboard_stats_24h_subkeys(self, client: TestClient):
        """stats_24h must contain keys used by the stat-card renderer."""
        resp = client.get("/api/resident/dashboard")
        assert resp.status_code == 200
        stats = resp.json().get("stats_24h", {})
        assert "tasks_total" in stats
        assert "success_rate" in stats


# ── Test 2: Jobs duration fields ──────────────────────────────────────────────

class TestJobsDuration:
    """Jobs returned by GET /api/jobs must include timestamp fields used by
    the frontend's formatJobDuration() helper.

    formatJobDuration(startIso, finishIso):
      - if startIso is missing/falsy → returns '-'
      - otherwise calculates elapsed seconds from (finishIso or Date.now()) - startIso
    """

    def _create_job(self, client, title: str = "duration-test") -> dict:
        resp = client.post("/api/jobs", json={
            "type": "dummy_long_task",
            "title": title,
            "input_summary": "UI polish test",
            "priority": "low",
        })
        assert resp.status_code == 200, resp.text
        return resp.json()

    def test_job_has_duration_fields(self, client: TestClient):
        """Each job in the list must expose created_at, started_at, finished_at."""
        job = self._create_job(client)
        job_id = job["id"]

        resp = client.get(f"/api/jobs/{job_id}")
        assert resp.status_code == 200, resp.text
        detail = resp.json()

        assert "created_at" in detail, "Missing 'created_at' – formatJobDuration cannot run"
        # started_at / finished_at are optional before the job runs, but must be present (even null)
        assert "started_at" in detail, "Missing 'started_at' key (may be null)"
        assert "finished_at" in detail, "Missing 'finished_at' key (may be null)"

    def test_jobs_list_includes_timestamps(self, client: TestClient):
        """GET /api/jobs list items must also carry timestamp fields for the table."""
        self._create_job(client, "list-duration-test")
        resp = client.get("/api/jobs?limit=10")
        assert resp.status_code == 200
        jobs = resp.json().get("jobs", [])
        assert len(jobs) > 0, "No jobs returned – cannot verify timestamp fields"

        for j in jobs:
            assert "created_at" in j, f"Job {j.get('id')} missing 'created_at'"
            assert "started_at" in j, f"Job {j.get('id')} missing 'started_at'"
            assert "finished_at" in j, f"Job {j.get('id')} missing 'finished_at'"


# ── Test 3: Panic/Pause endpoint ──────────────────────────────────────────────

class TestResidentPanic:
    """POST /api/resident/mode/pause forces advisor mode (panic button)."""

    def test_pause_sets_advisor_mode(self, client: TestClient):
        resp = client.post("/api/resident/mode/pause")
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["status"] == "ok"
        assert data["mode"] == "advisor"

    def test_autonomous_endpoint_enables_autonomous(self, client: TestClient):
        resp = client.post("/api/resident/mode/autonomous")
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["status"] == "ok"
        assert data["mode"] == "autonomous"

    def test_pause_after_autonomous_resets_to_advisor(self, client: TestClient):
        """Calling pause after enabling autonomous must force advisor."""
        client.post("/api/resident/mode/autonomous")
        resp = client.post("/api/resident/mode/pause")
        assert resp.status_code == 200
        assert resp.json()["mode"] == "advisor"


# ── Test 4: Admin restart / update endpoints ──────────────────────────────────

class TestAdminEndpoints:
    """Admin endpoints must return 200 and a status/message payload.

    The actual shell commands are not executed during tests – the subprocess is
    patched so the test suite works without dev.sh on the CI file system.
    """

    def test_restart_returns_ok(self, client: TestClient):
        with patch("app.routers.admin._run_dev_command", new_callable=AsyncMock) as mock_cmd:
            resp = client.post("/api/admin/restart")
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["status"] == "ok"
        assert "message" in data

    def test_update_returns_ok(self, client: TestClient):
        with patch("app.routers.admin._run_dev_command", new_callable=AsyncMock):
            resp = client.post("/api/admin/update")
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["status"] == "ok"
        assert "message" in data
