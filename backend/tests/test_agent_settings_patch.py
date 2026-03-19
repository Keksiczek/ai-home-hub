"""Tests for agent settings PATCH endpoint."""
import pytest
from app.services.resident_agent import get_resident_agent, AgentSettings


def test_agent_settings_dataclass():
    """AgentSettings has correct defaults."""
    s = AgentSettings()
    assert s.interval_seconds == 30
    assert s.max_cycles_per_day == 100
    assert s.quiet_hours_start == "22:00"
    assert s.quiet_hours_end == "07:00"
    assert s.quiet_hours_enabled is False


def test_get_agent_settings():
    """get_agent_settings returns dict."""
    agent = get_resident_agent()
    settings = agent.get_agent_settings()
    assert isinstance(settings, dict)
    assert "interval_seconds" in settings
    assert "quiet_hours_enabled" in settings


def test_update_agent_settings():
    """update_agent_settings modifies settings."""
    agent = get_resident_agent()
    original = agent._agent_settings.interval_seconds
    agent.update_agent_settings({"interval_seconds": 60})
    assert agent._agent_settings.interval_seconds == 60
    # Restore
    agent.update_agent_settings({"interval_seconds": original})


def test_quiet_hours_detection():
    """_is_quiet_hours returns False when disabled."""
    agent = get_resident_agent()
    agent._agent_settings.quiet_hours_enabled = False
    assert agent._is_quiet_hours() is False


def test_get_agent_settings_endpoint(client):
    """GET /api/resident/agent-settings returns settings."""
    res = client.get("/api/resident/agent-settings")
    assert res.status_code == 200
    data = res.json()
    assert "interval_seconds" in data
    assert "quiet_hours_enabled" in data


def test_patch_agent_settings_endpoint(client):
    """PATCH /api/resident/agent-settings updates settings."""
    res = client.patch(
        "/api/resident/agent-settings",
        json={"interval_seconds": 45, "quiet_hours_enabled": True},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["interval_seconds"] == 45
    assert data["quiet_hours_enabled"] is True

    # Restore defaults
    client.patch(
        "/api/resident/agent-settings",
        json={"interval_seconds": 30, "quiet_hours_enabled": False},
    )


def test_patch_empty_body(client):
    """PATCH /api/resident/agent-settings with empty body returns 400."""
    res = client.patch("/api/resident/agent-settings", json={})
    assert res.status_code == 400


def test_agent_settings_alias_endpoint(client):
    """PATCH /api/agent/settings alias works."""
    res = client.patch(
        "/api/agent/settings",
        json={"interval_seconds": 30},
    )
    assert res.status_code == 200
