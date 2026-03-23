"""Tests for model switching – request override, session override, model listing."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.fixture
def _mock_services():
    """Mock LLM and session services for model switching tests."""
    mock_session_svc = MagicMock()
    mock_session_svc.session_exists.return_value = True
    mock_session_svc.get_history_for_llm.return_value = []
    mock_session_svc.save_message.return_value = None
    mock_session_svc.get_model_override.return_value = None

    mock_llm_svc = MagicMock()
    mock_llm_svc.generate = AsyncMock(
        return_value=("reply", {"provider": "ollama", "model": "llama3.2"})
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
    yield {"llm": mock_llm_svc, "session": mock_session_svc}
    for p in patches:
        p.stop()


def test_model_override_in_request(_mock_services, client):
    """Model field in ChatRequest should override the profile default."""
    resp = client.post(
        "/api/chat",
        json={
            "message": "Hello",
            "session_id": "test-session",
            "model": "mistral:7b",
        },
    )
    assert resp.status_code == 200

    # Verify generate was called with model_override
    call_kwargs = _mock_services["llm"].generate.call_args
    assert call_kwargs.kwargs.get("model_override") == "mistral:7b"


def test_session_model_override_used_when_no_request_model(_mock_services, client):
    """When no model in request, session-level override should be used."""
    _mock_services["session"].get_model_override.return_value = "gemma2:9b"

    resp = client.post(
        "/api/chat",
        json={
            "message": "Hello",
            "session_id": "test-session",
        },
    )
    assert resp.status_code == 200

    call_kwargs = _mock_services["llm"].generate.call_args
    assert call_kwargs.kwargs.get("model_override") == "gemma2:9b"


def test_request_model_overrides_session_override(_mock_services, client):
    """Request-level model should take priority over session override."""
    _mock_services["session"].get_model_override.return_value = "gemma2:9b"

    resp = client.post(
        "/api/chat",
        json={
            "message": "Hello",
            "session_id": "test-session",
            "model": "phi3:latest",
        },
    )
    assert resp.status_code == 200

    call_kwargs = _mock_services["llm"].generate.call_args
    assert call_kwargs.kwargs.get("model_override") == "phi3:latest"


def test_no_model_override_passes_none(_mock_services, client):
    """When neither request nor session has model override, None is passed."""
    resp = client.post(
        "/api/chat",
        json={
            "message": "Hello",
            "session_id": "test-session",
        },
    )
    assert resp.status_code == 200

    call_kwargs = _mock_services["llm"].generate.call_args
    assert call_kwargs.kwargs.get("model_override") is None


def test_session_model_override_set_and_get():
    """set_model_override / get_model_override roundtrip."""
    import json
    import tempfile
    from pathlib import Path
    from unittest.mock import patch as p

    with tempfile.TemporaryDirectory() as tmpdir:
        sessions_dir = Path(tmpdir)
        # Create a minimal session file
        session_id = "test-model"
        session_file = sessions_dir / f"{session_id}.json"
        session_file.write_text(
            json.dumps(
                {
                    "session_id": session_id,
                    "messages": [],
                    "created_at": "2026-01-01T00:00:00Z",
                }
            )
        )

        with p("app.services.session_service.SESSIONS_DIR", sessions_dir):
            from app.services.session_service import SessionService

            svc = SessionService()

            # Initially no override
            assert svc.get_model_override(session_id) is None

            # Set override
            svc.set_model_override(session_id, "mistral:7b")
            assert svc.get_model_override(session_id) == "mistral:7b"

            # Clear override
            svc.set_model_override(session_id, None)
            assert svc.get_model_override(session_id) is None
