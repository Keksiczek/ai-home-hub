"""Tests for the /api/chat/stream WebSocket endpoint."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def _mock_deps():
    """Mock LLM service streaming and session service for WS tests."""
    mock_session_svc = MagicMock()
    mock_session_svc.session_exists.return_value = False
    mock_session_svc.create_session.return_value = "test-ws"
    mock_session_svc.get_history_for_llm.return_value = []
    mock_session_svc.save_message.return_value = None

    mock_llm_svc = MagicMock()
    mock_settings = MagicMock()
    mock_settings.get_llm_config.return_value = {
        "model": "llama3.2",
        "ollama_url": "http://localhost:11434",
    }
    mock_settings.get_system_prompt.return_value = "You are a helper."
    mock_llm_svc._settings = mock_settings

    async def _fake_stream(**kwargs):
        for token in ["Hello", " ", "World"]:
            yield token

    mock_llm_svc.generate_stream = MagicMock(
        side_effect=lambda **kw: _fake_stream(**kw)
    )

    async def _fake_enrich(msg, **kw):
        return msg, {
            "kb_context_used": False,
            "memory_context_used": False,
            "memory_context_items": [],
        }

    patches = [
        patch("app.routers.chat.get_session_service", return_value=mock_session_svc),
        patch("app.routers.chat.get_llm_service", return_value=mock_llm_svc),
        patch("app.routers.chat.enrich_message", side_effect=_fake_enrich),
    ]
    for p in patches:
        p.start()
    yield
    for p in patches:
        p.stop()


def test_chat_stream_ws_token_sequence(_mock_deps, client):
    """WebSocket stream should send token → token → token → done."""
    with client.websocket_connect("/api/chat/stream") as ws:
        ws.send_json({"message": "Hi", "mode": "general"})

        messages = []
        while True:
            data = ws.receive_json()
            messages.append(data)
            if data.get("type") in ("done", "error"):
                break

    # Should have 3 tokens + 1 done
    token_msgs = [m for m in messages if m["type"] == "token"]
    done_msgs = [m for m in messages if m["type"] == "done"]

    assert len(token_msgs) == 3
    assert token_msgs[0]["content"] == "Hello"
    assert token_msgs[1]["content"] == " "
    assert token_msgs[2]["content"] == "World"

    assert len(done_msgs) == 1
    assert "meta" in done_msgs[0]
    assert done_msgs[0]["meta"]["session_id"] == "test-ws"
    assert done_msgs[0]["meta"]["provider"] == "ollama"


def test_chat_stream_ws_empty_message(_mock_deps, client):
    """Empty message should return an error and close."""
    with client.websocket_connect("/api/chat/stream") as ws:
        ws.send_json({"message": "", "mode": "general"})
        data = ws.receive_json()
        assert data["type"] == "error"
        assert "empty" in data["message"].lower() or "Empty" in data["message"]
