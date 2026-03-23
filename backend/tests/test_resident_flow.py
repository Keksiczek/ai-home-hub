"""Integration tests – Resident Agent flow.

Covers:
- GET /api/resident/dashboard structure (stopped and running states)
- Empty recent_tasks doesn't crash the endpoint
- POST /api/resident/start / stop lifecycle
- POST /api/resident/task queuing
- Dashboard stats_24h field types
"""

import sys
import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim (same pattern as conftest.py) ──────────────────────────────
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


# ── Helper ────────────────────────────────────────────────────────────────────


def _reset_agent():
    from app.services.resident_agent import get_resident_agent

    agent = get_resident_agent()
    agent._state.is_running = False
    agent._state.started_at = None
    agent._state.last_heartbeat = None
    agent._state.heartbeat_status = "healthy"
    agent._state.alerts = []
    agent._start_time = None
    return agent


# ── Tests ─────────────────────────────────────────────────────────────────────


class TestResidentDashboardStructure:
    """Dashboard always returns a valid JSON document regardless of agent state."""

    def test_dashboard_returns_200(self, client):
        resp = client.get("/api/resident/dashboard")
        assert resp.status_code == 200

    def test_dashboard_has_required_keys(self, client):
        data = client.get("/api/resident/dashboard").json()
        required = {
            "status",
            "uptime_seconds",
            "heartbeat_status",
            "last_heartbeat",
            "current_task",
            "recent_tasks",
            "alerts",
            "stats_24h",
        }
        assert required.issubset(data.keys())

    def test_stopped_state_values(self, client):
        _reset_agent()
        data = client.get("/api/resident/dashboard").json()
        assert data["status"] == "stopped"
        assert data["uptime_seconds"] == 0.0
        assert data["current_task"] is None
        assert isinstance(data["recent_tasks"], list)
        assert isinstance(data["alerts"], list)

    def test_stats_24h_types(self, client):
        data = client.get("/api/resident/dashboard").json()
        stats = data["stats_24h"]
        assert isinstance(stats["tasks_total"], int)
        assert isinstance(stats["success_rate"], (int, float))
        assert isinstance(stats["avg_task_duration_s"], (int, float))

    def test_recent_tasks_is_always_a_list(self, client):
        """recent_tasks must always be a list (never None), even when empty."""
        _reset_agent()
        data = client.get("/api/resident/dashboard").json()
        assert isinstance(data["recent_tasks"], list)


class TestResidentDashboardRunning:
    """Dashboard reflects running-state when agent is marked as running."""

    def test_status_running_after_start(self, client):
        agent = _reset_agent()
        agent._state.is_running = True
        agent._state.started_at = "2025-01-01T00:00:00+00:00"
        agent._state.heartbeat_status = "healthy"
        agent._start_time = time.monotonic()

        try:
            data = client.get("/api/resident/dashboard").json()
            assert data["status"] == "running"
            assert data["uptime_seconds"] >= 0
            assert data["heartbeat_status"] == "healthy"
        finally:
            _reset_agent()

    def test_alerts_visible_in_dashboard(self, client):
        agent = _reset_agent()
        agent._state.is_running = True
        agent._state.started_at = "2025-01-01T00:00:00+00:00"
        agent._start_time = time.monotonic()
        agent._state.alerts = ["Queue depth high (15 queued jobs)"]

        try:
            data = client.get("/api/resident/dashboard").json()
            assert len(data["alerts"]) == 1
            assert "Queue depth" in data["alerts"][0]
        finally:
            _reset_agent()


class TestResidentLifecycle:
    """Start / stop endpoints return correct JSON and are idempotent."""

    def test_start_returns_started(self, client):
        _reset_agent()
        resp = client.post("/api/resident/start")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "started"
        assert "message" in data

    def test_start_when_already_running_returns_already_running(self, client):
        agent = _reset_agent()
        agent._state.is_running = True
        resp = client.post("/api/resident/start")
        assert resp.status_code == 200
        assert resp.json()["status"] == "already_running"
        _reset_agent()

    def test_stop_when_running_returns_stopped(self, client):
        _reset_agent()
        client.post("/api/resident/start")
        resp = client.post("/api/resident/stop")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "stopped"

    def test_stop_when_not_running_returns_not_running(self, client):
        _reset_agent()
        resp = client.post("/api/resident/stop")
        assert resp.status_code == 200
        assert resp.json()["status"] == "not_running"

    def test_full_start_stop_cycle(self, client):
        _reset_agent()

        resp = client.post("/api/resident/start")
        assert resp.json()["status"] == "started"

        resp = client.post("/api/resident/start")
        assert resp.json()["status"] == "already_running"

        resp = client.post("/api/resident/stop")
        assert resp.json()["status"] == "stopped"

        resp = client.post("/api/resident/stop")
        assert resp.json()["status"] == "not_running"


class TestResidentTaskSubmission:
    """POST /api/resident/task creates a queued job."""

    def test_submit_task_returns_queued(self, client):
        resp = client.post(
            "/api/resident/task",
            json={
                "title": "Test task",
                "description": "Integration test task",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "queued"
        assert "job_id" in data
        assert data["title"] == "Test task"

    def test_submit_task_without_description(self, client):
        resp = client.post("/api/resident/task", json={"title": "Minimal task"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "queued"

    def test_submitted_task_appears_in_jobs(self, client):
        resp = client.post("/api/resident/task", json={"title": "Traceable task"})
        job_id = resp.json()["job_id"]

        jobs_resp = client.get("/api/jobs")
        jobs = jobs_resp.json()["jobs"]
        ids = [j["id"] for j in jobs]
        assert job_id in ids
