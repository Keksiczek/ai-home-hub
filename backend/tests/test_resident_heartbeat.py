"""Tests for resident agent heartbeat and /api/agent/status endpoint."""

import pytest


def test_resident_heartbeat_endpoint(client):
    """GET /api/resident/heartbeat returns heartbeat status."""
    res = client.get("/api/resident/heartbeat")
    assert res.status_code == 200
    data = res.json()
    assert "heartbeat_status" in data
    assert "is_running" in data
    assert "tick_count" in data
    assert "consecutive_errors" in data
    assert "status" in data


def test_agent_status_endpoint(client):
    """GET /api/agent/status returns combined agent + background tasks status."""
    res = client.get("/api/agent/status")
    assert res.status_code == 200
    data = res.json()
    assert "resident_agent" in data
    assert "background_tasks" in data

    ra = data["resident_agent"]
    assert "is_running" in ra
    assert "status" in ra
    assert "heartbeat_status" in ra
    assert "tick_count" in ra
    assert "errors" in ra


def test_resident_status_endpoint(client):
    """GET /api/resident/status returns full state."""
    res = client.get("/api/resident/status")
    assert res.status_code == 200
    data = res.json()
    assert "is_running" in data
    assert "heartbeat_status" in data
    assert "last_heartbeat" in data


def test_resident_dashboard_endpoint(client):
    """GET /api/resident/dashboard returns dashboard data."""
    res = client.get("/api/resident/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data or "is_running" in data


def test_heartbeat_status_values():
    """ResidentAgentState heartbeat_status defaults to 'healthy'."""
    from app.services.resident_agent import ResidentAgentState

    state = ResidentAgentState()
    assert state.heartbeat_status == "healthy"
    assert state.consecutive_errors == 0
    assert state.is_running is False
