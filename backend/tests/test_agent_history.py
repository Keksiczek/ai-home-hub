"""Tests for agent cycle history."""

import pytest
from app.services.resident_agent import get_resident_agent, CycleRecord


def test_cycle_record_dataclass():
    """CycleRecord stores cycle data correctly."""
    r = CycleRecord(
        cycle_id="cycle-0001",
        cycle_number=1,
        timestamp="2025-01-01T00:00:00Z",
        status="success",
        action_type="kb_search",
        duration_ms=120.5,
    )
    d = r.to_dict()
    assert d["cycle_id"] == "cycle-0001"
    assert d["cycle_number"] == 1
    assert d["status"] == "success"
    assert d["duration_ms"] == 120.5


def test_get_cycle_history_empty():
    """get_cycle_history returns empty list when no cycles have run."""
    agent = get_resident_agent()
    agent._cycle_history.clear()
    history = agent.get_cycle_history(limit=10)
    assert history == []


def test_add_cycle_record():
    """Adding cycle records populates history."""
    agent = get_resident_agent()
    agent._cycle_history.clear()
    record = CycleRecord(
        cycle_id="cycle-0042",
        cycle_number=42,
        timestamp="2025-01-01T12:00:00Z",
        status="success",
        action_type="periodic",
        duration_ms=50.0,
    )
    agent._add_cycle_record(record)
    history = agent.get_cycle_history(limit=5)
    assert len(history) == 1
    assert history[0]["cycle_id"] == "cycle-0042"


def test_history_endpoint(client):
    """GET /api/resident/history returns history data."""
    res = client.get("/api/resident/history?limit=5")
    assert res.status_code == 200
    data = res.json()
    assert "history" in data
    assert "count" in data


def test_agent_history_alias_endpoint(client):
    """GET /api/agent/history returns same data."""
    res = client.get("/api/agent/history?limit=5")
    assert res.status_code == 200
    data = res.json()
    assert "history" in data
