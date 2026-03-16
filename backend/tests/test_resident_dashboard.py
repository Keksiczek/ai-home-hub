"""Integration tests for GET /api/resident/dashboard endpoint."""
import sys
import time
from unittest.mock import patch, AsyncMock, MagicMock

import pytest

# ── Compatibility shim (same as conftest.py) ─────────────────────
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


def test_resident_dashboard_stopped(client):
    """Dashboard returns correct structure when resident agent is not running."""
    resp = client.get("/api/resident/dashboard")
    assert resp.status_code == 200
    data = resp.json()

    # Verify top-level keys
    assert "status" in data
    assert "uptime_seconds" in data
    assert "heartbeat_status" in data
    assert "last_heartbeat" in data
    assert "current_task" in data
    assert "recent_tasks" in data
    assert "alerts" in data
    assert "stats_24h" in data

    # When stopped, status should be "stopped"
    assert data["status"] == "stopped"
    assert data["uptime_seconds"] == 0.0
    assert data["current_task"] is None
    assert isinstance(data["recent_tasks"], list)
    assert isinstance(data["alerts"], list)

    # stats_24h structure
    stats = data["stats_24h"]
    assert "tasks_total" in stats
    assert "success_rate" in stats
    assert "avg_task_duration_s" in stats


def test_resident_dashboard_with_running_agent(client):
    """Dashboard returns running status after agent is started."""
    from app.services.resident_agent import get_resident_agent

    agent = get_resident_agent()
    # Simulate that agent is "running" by directly setting state
    agent._state.is_running = True
    agent._state.started_at = "2025-01-01T00:00:00+00:00"
    agent._state.heartbeat_status = "healthy"
    agent._state.last_heartbeat = "2025-01-01T00:01:00+00:00"
    agent._state.alerts = ["Queue depth high (12 queued jobs)"]
    agent._start_time = time.monotonic()

    try:
        resp = client.get("/api/resident/dashboard")
        assert resp.status_code == 200
        data = resp.json()

        assert data["status"] == "running"
        assert data["uptime_seconds"] >= 0  # may be 0 if evaluated instantly
        assert data["heartbeat_status"] == "healthy"
        assert data["last_heartbeat"] is not None
        assert len(data["alerts"]) == 1
        assert "Queue depth" in data["alerts"][0]
    finally:
        # Reset state
        agent._state.is_running = False
        agent._state.started_at = None
        agent._state.last_heartbeat = None
        agent._state.heartbeat_status = "healthy"
        agent._state.alerts = []
        agent._start_time = None


def test_resident_start_stop(client):
    """Start and stop endpoints return proper JSON responses."""
    from app.services.resident_agent import get_resident_agent
    agent = get_resident_agent()

    # Ensure clean state
    agent._state.is_running = False
    agent._start_time = None

    # Start
    resp = client.post("/api/resident/start")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "started"
    assert "message" in data

    # Start again → already running
    resp = client.post("/api/resident/start")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "already_running"

    # Stop
    resp = client.post("/api/resident/stop")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "stopped"
    assert "message" in data

    # Stop again → not running
    resp = client.post("/api/resident/stop")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "not_running"


def test_resident_dashboard_stats_structure(client):
    """Verify stats_24h has correct types."""
    resp = client.get("/api/resident/dashboard")
    data = resp.json()
    stats = data["stats_24h"]
    assert isinstance(stats["tasks_total"], int)
    assert isinstance(stats["success_rate"], (int, float))
    assert isinstance(stats["avg_task_duration_s"], (int, float))


def test_resident_add_task(client):
    """Add a task via the resident task endpoint."""
    resp = client.post("/api/resident/task", json={
        "title": "Test task",
        "description": "A test task for integration test",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "queued"
    assert "job_id" in data
    assert data["title"] == "Test task"
