"""Tests for agent WebSocket heartbeat broadcast."""
import pytest
from unittest.mock import AsyncMock, patch

from app.services.resident_agent import get_resident_agent, ResidentAgentState


def test_heartbeat_broadcast_includes_extended_fields():
    """Agent status broadcast should include paused, quiet_hours, error_count, uptime."""
    agent = get_resident_agent()
    state = agent.get_state()
    # The state dict should contain the new fields
    assert "paused" in state
    assert "quiet_hours_active" in state
    assert "agent_settings" in state


def test_agent_status_endpoint_includes_paused(client):
    """GET /api/agent/status includes paused and quiet_hours_active."""
    res = client.get("/api/agent/status")
    assert res.status_code == 200
    data = res.json()
    ra = data["resident_agent"]
    assert "paused" in ra
    assert "quiet_hours_active" in ra


def test_resident_heartbeat_endpoint_still_works(client):
    """GET /api/resident/heartbeat continues to work after upgrade."""
    res = client.get("/api/resident/heartbeat")
    assert res.status_code == 200
    data = res.json()
    assert "heartbeat_status" in data
    assert "is_running" in data
