"""Unit tests for ModeAuditService."""

import pytest
from app.services.mode_audit_service import ModeAuditService, ModeChangeRecord, get_mode_audit_service
from app.services import mode_audit_service as _module


# ── Fixture: fresh service for each test ─────────────────────────────────────

@pytest.fixture(autouse=True)
def reset_singleton():
    """Reset the module-level singleton before every test."""
    _module._mode_audit_service = None
    yield
    _module._mode_audit_service = None


# ── Tests for record_change ───────────────────────────────────────────────────

def test_record_change_stores_correctly():
    """record_change() persists all fields and returns them via get_history()."""
    svc = ModeAuditService()
    svc.record_change(from_mode="observer", to_mode="advisor", changed_by="user", reason="test")

    history = svc.get_history()
    assert len(history) == 1
    rec = history[0]
    assert rec["from_mode"] == "observer"
    assert rec["to_mode"] == "advisor"
    assert rec["changed_by"] == "user"
    assert rec["reason"] == "test"
    assert "timestamp" in rec


def test_record_change_defaults():
    """changed_by defaults to 'api' and reason defaults to empty string."""
    svc = ModeAuditService()
    svc.record_change(from_mode="advisor", to_mode="autonomous")

    rec = svc.get_history()[0]
    assert rec["changed_by"] == "api"
    assert rec["reason"] == ""


def test_record_change_multiple_entries():
    """Multiple records are stored in insertion order."""
    svc = ModeAuditService()
    svc.record_change("observer", "advisor", "user")
    svc.record_change("advisor", "autonomous", "api")
    svc.record_change("autonomous", "observer", "system")

    history = svc.get_history()
    assert len(history) == 3
    assert history[0]["from_mode"] == "observer"
    assert history[1]["from_mode"] == "advisor"
    assert history[2]["from_mode"] == "autonomous"


def test_get_history_limit():
    """get_history(limit=N) returns at most N most-recent records."""
    svc = ModeAuditService()
    for i in range(10):
        svc.record_change("advisor", "observer")

    assert len(svc.get_history(limit=5)) == 5
    assert len(svc.get_history(limit=3)) == 3


# ── Tests for ring buffer (max 50) ───────────────────────────────────────────

def test_ring_buffer_does_not_exceed_50():
    """The deque never holds more than 50 entries regardless of how many are added."""
    svc = ModeAuditService()
    for _ in range(70):
        svc.record_change("advisor", "observer")

    history = svc.get_history(limit=100)
    assert len(history) <= 50


def test_ring_buffer_keeps_most_recent():
    """When overflow happens the oldest entries are dropped, newest are kept."""
    svc = ModeAuditService()
    for i in range(55):
        svc.record_change("observer", "advisor", reason=f"change-{i}")

    history = svc.get_history(limit=50)
    # Oldest 5 should be gone; last entry should be change-54
    assert history[-1]["reason"] == "change-54"
    assert all(h["reason"] != "change-0" for h in history)


# ── Tests for singleton ───────────────────────────────────────────────────────

def test_get_mode_audit_service_returns_singleton():
    """get_mode_audit_service() always returns the same instance."""
    svc1 = get_mode_audit_service()
    svc2 = get_mode_audit_service()
    assert svc1 is svc2


def test_get_mode_audit_service_creates_fresh_after_reset():
    """After resetting the module singleton a new instance is created."""
    svc1 = get_mode_audit_service()
    _module._mode_audit_service = None
    svc2 = get_mode_audit_service()
    assert svc1 is not svc2
