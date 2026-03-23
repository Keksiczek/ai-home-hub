"""Tests for structured logging integration (structlog)."""

import pytest
from app.services.resident_agent import get_resident_agent, LogEntry, CycleRecord


def test_structlog_import():
    """structlog is importable and configured."""
    import structlog

    log = structlog.get_logger("resident_agent")
    assert log is not None


def test_add_log_creates_entry():
    """_add_log creates a LogEntry in the ring buffer."""
    agent = get_resident_agent()
    agent._log_entries.clear()
    agent._add_log("INFO", "test_structured_log", cycle_id="cycle-0001", key="value")
    entries = agent.get_logs()
    assert len(entries) >= 1
    last = entries[-1]
    assert last["event"] == "test_structured_log"
    assert last["level"] == "INFO"
    assert last["cycle_id"] == "cycle-0001"
    assert last["data"]["key"] == "value"


def test_log_levels():
    """Logs can be INFO, WARN, or ERROR."""
    agent = get_resident_agent()
    agent._log_entries.clear()
    agent._add_log("INFO", "info_event")
    agent._add_log("WARN", "warn_event")
    agent._add_log("ERROR", "error_event")
    logs = agent.get_logs()
    levels = [e["level"] for e in logs]
    assert "INFO" in levels
    assert "WARN" in levels
    assert "ERROR" in levels


def test_log_ring_buffer_limit():
    """Log ring buffer respects MAX_LOG_ENTRIES."""
    from app.services.resident_agent import MAX_LOG_ENTRIES

    agent = get_resident_agent()
    agent._log_entries.clear()
    for i in range(MAX_LOG_ENTRIES + 50):
        agent._add_log("INFO", f"event_{i}")
    assert len(agent._log_entries) == MAX_LOG_ENTRIES


def test_cycle_history_ring_buffer():
    """Cycle history respects MAX_CYCLE_HISTORY."""
    from app.services.resident_agent import MAX_CYCLE_HISTORY

    agent = get_resident_agent()
    agent._cycle_history.clear()
    for i in range(MAX_CYCLE_HISTORY + 10):
        agent._add_cycle_record(
            CycleRecord(
                cycle_id=f"cycle-{i:04d}",
                cycle_number=i,
                timestamp="2025-01-01T00:00:00Z",
                status="success",
            )
        )
    assert len(agent._cycle_history) == MAX_CYCLE_HISTORY


def test_reset_clears_logs_and_history():
    """Agent reset clears logs and cycle history."""
    agent = get_resident_agent()
    agent._add_log("INFO", "pre_reset")
    agent._add_cycle_record(
        CycleRecord(
            cycle_id="cycle-0001",
            cycle_number=1,
            timestamp="2025-01-01T00:00:00Z",
            status="success",
        )
    )

    import asyncio

    asyncio.get_event_loop().run_until_complete(agent.reset())

    # After reset, the only log should be the "agent_reset" log
    logs = agent.get_logs()
    assert any(e["event"] == "agent_reset" for e in logs)
    assert agent.get_cycle_history() == []
