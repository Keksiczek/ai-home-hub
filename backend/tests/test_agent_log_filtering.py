"""Tests for agent structured log filtering."""
import pytest
from app.services.resident_agent import get_resident_agent, LogEntry


def test_log_entry_dataclass():
    """LogEntry stores structured data."""
    entry = LogEntry(
        timestamp="2025-01-01T00:00:00Z",
        level="INFO",
        event="cycle_start",
        cycle_id="cycle-0001",
        data={"status": "thinking"},
    )
    d = entry.to_dict()
    assert d["level"] == "INFO"
    assert d["event"] == "cycle_start"
    assert d["data"]["status"] == "thinking"


def test_add_log_and_get_logs():
    """Adding logs and retrieving them works."""
    agent = get_resident_agent()
    agent._log_entries.clear()
    agent._add_log("INFO", "test_event", cycle_id="cycle-0001", foo="bar")
    agent._add_log("ERROR", "test_error", cycle_id="cycle-0001", msg="fail")
    agent._add_log("INFO", "another_event", cycle_id="cycle-0002")

    all_logs = agent.get_logs()
    assert len(all_logs) == 3

    # Filter by level
    error_logs = agent.get_logs(level="ERROR")
    assert len(error_logs) == 1
    assert error_logs[0]["event"] == "test_error"

    # Filter by cycle
    cycle1_logs = agent.get_logs(cycle="cycle-0001")
    assert len(cycle1_logs) == 2

    # Both filters
    both = agent.get_logs(level="INFO", cycle="cycle-0002")
    assert len(both) == 1


def test_clear_logs():
    """Clearing logs empties the buffer."""
    agent = get_resident_agent()
    agent._log_entries.clear()
    agent._add_log("INFO", "test_event")
    assert len(agent.get_logs()) == 1
    count = agent.clear_logs()
    assert count == 1
    assert len(agent.get_logs()) == 0


def test_logs_endpoint(client):
    """GET /api/resident/logs returns logs."""
    res = client.get("/api/resident/logs")
    assert res.status_code == 200
    data = res.json()
    assert "logs" in data
    assert "count" in data


def test_logs_endpoint_with_level_filter(client):
    """GET /api/resident/logs?level=INFO filters by level."""
    res = client.get("/api/resident/logs?level=INFO")
    assert res.status_code == 200
    data = res.json()
    assert "logs" in data


def test_logs_endpoint_invalid_level(client):
    """GET /api/resident/logs?level=INVALID returns 422."""
    res = client.get("/api/resident/logs?level=INVALID")
    assert res.status_code == 422


def test_delete_logs_endpoint(client):
    """DELETE /api/resident/logs clears logs."""
    res = client.delete("/api/resident/logs")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"


def test_agent_logs_alias_endpoint(client):
    """GET /api/agent/logs returns logs."""
    res = client.get("/api/agent/logs")
    assert res.status_code == 200
    data = res.json()
    assert "logs" in data
