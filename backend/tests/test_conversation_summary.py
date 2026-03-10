"""Tests for conversation summarization in SessionService."""
import json
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest

from app.services.session_service import SessionService


def _make_session(tmpdir: str, session_id: str, num_messages: int) -> Path:
    """Create a session file with the given number of user/assistant messages."""
    sessions_dir = Path(tmpdir)
    messages = []
    for i in range(num_messages):
        role = "user" if i % 2 == 0 else "assistant"
        messages.append({
            "role": role,
            "content": f"Message {i}",
            "timestamp": f"2026-01-01T00:00:{i:02d}Z",
        })
    data = {
        "session_id": session_id,
        "created_at": "2026-01-01T00:00:00Z",
        "messages": messages,
        "artifacts": [],
        "active_agents": [],
    }
    fpath = sessions_dir / f"{session_id}.json"
    fpath.write_text(json.dumps(data))
    return fpath


def test_short_session_returns_full_history():
    """Sessions under the threshold should return all messages unchanged."""
    with tempfile.TemporaryDirectory() as tmpdir:
        _make_session(tmpdir, "short", 10)
        with patch("app.services.session_service.SESSIONS_DIR", Path(tmpdir)):
            svc = SessionService()
            history = svc.get_history_for_llm("short", limit=20, max_messages_before_summary=20)

    assert len(history) == 10
    assert all(m["role"] in ("user", "assistant") for m in history)


def test_long_session_returns_summary_plus_recent():
    """Sessions over the threshold should return a summary + last N messages."""
    with tempfile.TemporaryDirectory() as tmpdir:
        _make_session(tmpdir, "long", 30)
        with patch("app.services.session_service.SESSIONS_DIR", Path(tmpdir)):
            svc = SessionService()
            history = svc.get_history_for_llm("long", limit=20, max_messages_before_summary=20)

    # Should have 1 summary message + 20 recent messages
    assert len(history) == 21
    assert history[0]["role"] == "system"
    assert "Summary of earlier conversation:" in history[0]["content"]
    # Recent messages should be the last 20
    assert history[-1]["content"] == "Message 29"


def test_cached_summary_is_reused():
    """If a cached summary exists and < 10 new messages, reuse it."""
    with tempfile.TemporaryDirectory() as tmpdir:
        sessions_dir = Path(tmpdir)
        session_id = "cached"
        messages = [{"role": "user", "content": f"Msg {i}", "timestamp": "t"} for i in range(25)]
        data = {
            "session_id": session_id,
            "created_at": "2026-01-01T00:00:00Z",
            "messages": messages,
            "history_summary": "Cached summary of conversation.",
            "history_summary_msg_count": 22,  # 3 new since summary
        }
        (sessions_dir / f"{session_id}.json").write_text(json.dumps(data))

        with patch("app.services.session_service.SESSIONS_DIR", sessions_dir):
            svc = SessionService()
            history = svc.get_history_for_llm(session_id, limit=20, max_messages_before_summary=20)

    assert history[0]["role"] == "system"
    assert "Cached summary of conversation." in history[0]["content"]


def test_summary_is_regenerated_when_stale():
    """If > 10 new messages since last summary, regenerate."""
    with tempfile.TemporaryDirectory() as tmpdir:
        sessions_dir = Path(tmpdir)
        session_id = "stale"
        messages = [{"role": "user", "content": f"Msg {i}", "timestamp": "t"} for i in range(35)]
        data = {
            "session_id": session_id,
            "created_at": "2026-01-01T00:00:00Z",
            "messages": messages,
            "history_summary": "Old summary",
            "history_summary_msg_count": 20,  # 15 new since summary
        }
        (sessions_dir / f"{session_id}.json").write_text(json.dumps(data))

        with patch("app.services.session_service.SESSIONS_DIR", sessions_dir):
            svc = SessionService()
            history = svc.get_history_for_llm(session_id, limit=20, max_messages_before_summary=20)

    # Should NOT use the old summary – new one generated
    assert history[0]["role"] == "system"
    assert "Old summary" not in history[0]["content"]


def test_build_summary_text():
    """_build_summary_text should produce a pipe-separated extractive summary."""
    messages = [
        {"role": "user", "content": "What is Python?"},
        {"role": "assistant", "content": "Python is a programming language."},
        {"role": "user", "content": "How do I install it?"},
    ]
    summary = SessionService._build_summary_text(messages)
    assert "User: What is Python?" in summary
    assert "Assistant: Python is a programming language." in summary
    assert "|" in summary


def test_disabled_summarization_returns_all():
    """When max_messages_before_summary is None, return all (no summary)."""
    with tempfile.TemporaryDirectory() as tmpdir:
        _make_session(tmpdir, "nosumm", 30)
        with patch("app.services.session_service.SESSIONS_DIR", Path(tmpdir)):
            svc = SessionService()
            history = svc.get_history_for_llm("nosumm", limit=50, max_messages_before_summary=None)

    # No summarization – all messages returned (capped by limit)
    assert all("Summary" not in m.get("content", "") for m in history)
