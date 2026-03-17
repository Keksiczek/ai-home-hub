"""Tests for resident agent live status fields."""
import pytest
from app.services.resident_agent import ResidentAgentState, get_resident_agent


def test_state_has_live_fields():
    """ResidentAgentState includes current_thought, next_run_in, cycle_count."""
    state = ResidentAgentState()
    d = state.to_dict()
    assert "current_thought" in d
    assert "next_run_in" in d
    assert "cycle_count" in d


def test_cycle_count_mirrors_tick_count():
    """cycle_count in to_dict should equal tick_count."""
    state = ResidentAgentState(tick_count=42)
    d = state.to_dict()
    assert d["cycle_count"] == 42
    assert d["tick_count"] == 42


def test_resident_get_state_includes_live_fields():
    """get_resident_agent().get_state() includes live activity fields."""
    agent = get_resident_agent()
    state = agent.get_state()
    assert "current_thought" in state
    assert "next_run_in" in state
    assert "cycle_count" in state


def test_resident_status_endpoint(client):
    """GET /api/resident/status returns agent state."""
    resp = client.get("/api/resident/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "is_running" in data
    assert "status" in data
    assert "current_thought" in data


def test_resident_dashboard_endpoint(client):
    """GET /api/resident/dashboard returns dashboard data."""
    resp = client.get("/api/resident/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "resident_mode" in data
