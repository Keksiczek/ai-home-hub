"""Tests for session cleanup (4G)."""

import json
import time
from pathlib import Path

import pytest

from app.services.session_service import SessionService, SESSIONS_DIR


@pytest.fixture
def session_svc(tmp_path, monkeypatch):
    """SessionService with temporary sessions directory."""
    monkeypatch.setattr("app.services.session_service.SESSIONS_DIR", tmp_path)
    svc = SessionService.__new__(SessionService)
    # Set the sessions dir for the instance
    return svc, tmp_path


def _create_session_file(
    sessions_dir: Path, session_id: str, age_days: int = 0
) -> Path:
    """Create a session JSON file with a given age."""
    data = {
        "session_id": session_id,
        "created_at": "2020-01-01T00:00:00+00:00",
        "messages": [
            {
                "role": "user",
                "content": "Hello",
                "timestamp": "2020-01-01T00:00:00+00:00",
            },
        ],
        "artifacts": [],
        "active_agents": [],
    }
    path = sessions_dir / f"{session_id}.json"
    path.write_text(json.dumps(data))

    if age_days > 0:
        old_time = time.time() - (age_days * 86400)
        import os

        os.utime(path, (old_time, old_time))

    return path


def test_get_session_stats(session_svc):
    svc, sessions_dir = session_svc
    _create_session_file(sessions_dir, "s1")
    _create_session_file(sessions_dir, "s2")

    # Manually call with monkeypatched dir
    import app.services.session_service as mod

    stats = svc.get_session_stats()
    assert stats["count"] == 2
    assert stats["total_size_bytes"] > 0


def test_cleanup_old_sessions(session_svc):
    svc, sessions_dir = session_svc
    _create_session_file(sessions_dir, "old1", age_days=60)
    _create_session_file(sessions_dir, "old2", age_days=45)
    _create_session_file(sessions_dir, "recent", age_days=5)

    result = svc.cleanup_old_sessions(older_than_days=30)
    assert result["deleted_count"] == 2
    assert "old1" in result["deleted_ids"]
    assert "old2" in result["deleted_ids"]

    # Recent session should still exist
    assert (sessions_dir / "recent.json").exists()
    assert not (sessions_dir / "old1.json").exists()


def test_cleanup_no_old_sessions(session_svc):
    svc, sessions_dir = session_svc
    _create_session_file(sessions_dir, "recent1", age_days=1)
    _create_session_file(sessions_dir, "recent2", age_days=2)

    result = svc.cleanup_old_sessions(older_than_days=30)
    assert result["deleted_count"] == 0


def test_list_sessions_detailed(session_svc):
    svc, sessions_dir = session_svc
    _create_session_file(sessions_dir, "s1")
    _create_session_file(sessions_dir, "s2")

    sessions = svc.list_sessions_detailed()
    assert len(sessions) == 2
    assert "session_id" in sessions[0]
    assert "message_count" in sessions[0]
    assert "last_activity" in sessions[0]
    assert "size_bytes" in sessions[0]


# ── API endpoint tests ───────────────────────────────────────────────────


def test_sessions_stats_endpoint(client):
    """GET /api/sessions/stats returns stats."""
    resp = client.get("/api/sessions/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "count" in data


def test_sessions_list_endpoint(client):
    """GET /api/sessions returns session list."""
    resp = client.get("/api/sessions")
    assert resp.status_code == 200
    data = resp.json()
    assert "sessions" in data
    assert "count" in data


def test_sessions_cleanup_endpoint(client):
    """DELETE /api/sessions/cleanup returns cleanup result."""
    resp = client.delete("/api/sessions/cleanup", params={"older_than_days": 365})
    assert resp.status_code == 200
    data = resp.json()
    assert "deleted_count" in data
