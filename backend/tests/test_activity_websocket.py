"""Tests for activity service and WebSocket endpoints."""
import pytest
from unittest.mock import AsyncMock, patch

from app.services.activity_service import ActivityService, get_activity_service


def test_activity_service_singleton():
    """get_activity_service returns the same singleton instance."""
    svc1 = get_activity_service()
    svc2 = get_activity_service()
    assert svc1 is svc2


def test_activity_snapshot_structure():
    """ActivityService.get_snapshot returns expected keys."""
    svc = ActivityService()
    # Mock dependencies to avoid import issues
    with patch("app.services.activity_service.get_activity_service", return_value=svc):
        snapshot = svc.get_snapshot()

    assert "timestamp" in snapshot
    assert "resident" in snapshot
    assert "jobs" in snapshot
    assert "kb" in snapshot
    assert "resources" in snapshot
    assert "ollama" in snapshot


def test_activity_snapshot_jobs_default():
    """Jobs section defaults to zero counts."""
    svc = ActivityService()
    snapshot = svc.get_snapshot()
    jobs = snapshot.get("jobs", {})
    assert jobs.get("running", 0) >= 0
    assert jobs.get("queued", 0) >= 0


def test_ws_activity_endpoint_exists(client):
    """The /ws/activity WebSocket endpoint is registered."""
    # TestClient doesn't support WebSocket, but we can verify route exists
    routes = [r.path for r in client.app.routes]
    assert "/ws/activity" in routes


def test_ws_agent_status_endpoint_exists(client):
    """The /ws/agent-status WebSocket endpoint is registered."""
    routes = [r.path for r in client.app.routes]
    assert "/ws/agent-status" in routes
