"""Tests for POST /api/prompts/generate."""
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Ensure chromadb is mocked before app import (mirrors conftest shim)
_chroma_mock = MagicMock()
for _mod in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client():
    """TestClient with startup checks bypassed (no Ollama required)."""
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new=AsyncMock(return_value={"status": "ok"}),
    ):
        with TestClient(app) as c:
            yield c


def _llm_patch(reply="Vygenerovaný testovací prompt.", status="ok"):
    """Return a patch context manager that stubs LLMService.generate."""
    mock_llm = MagicMock()
    mock_llm.generate = AsyncMock(return_value=(reply, {"status": status}))
    return patch("app.routers.prompts.LLMService", return_value=mock_llm)


# ---------------------------------------------------------------------------
# Basic happy-path
# ---------------------------------------------------------------------------

def test_generate_prompt_returns_200(client):
    """POST /api/prompts/generate returns 200 with generated_prompt."""
    with _llm_patch():
        resp = client.post(
            "/api/prompts/generate",
            json={"task_type": "chat", "context": "o počasí", "tone": "casual"},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert "generated_prompt" in data
    assert "example_usage" in data


def test_generate_prompt_text_stripped(client):
    """Surrounding quotes are stripped from the LLM reply."""
    with _llm_patch(reply='"Prompt s uvozovkami."'):
        resp = client.post("/api/prompts/generate", json={"task_type": "chat"})

    assert resp.status_code == 200
    assert resp.json()["generated_prompt"] == "Prompt s uvozovkami."


def test_generate_prompt_example_usage_nonempty(client):
    """example_usage is a non-empty string for every task_type."""
    with _llm_patch():
        resp = client.post(
            "/api/prompts/generate",
            json={"task_type": "kb_search", "context": "", "tone": "technical"},
        )

    assert resp.status_code == 200
    assert resp.json()["example_usage"]  # non-empty


def test_generate_prompt_all_task_types_accepted(client):
    """All four task_type values are accepted."""
    for tt in ("chat", "kb_search", "resident_mission", "file_analysis"):
        with _llm_patch():
            resp = client.post("/api/prompts/generate", json={"task_type": tt})
        assert resp.status_code == 200, f"task_type={tt} failed: {resp.text}"


def test_generate_prompt_all_tones_accepted(client):
    """All three tone values are accepted."""
    for tone in ("professional", "casual", "technical"):
        with _llm_patch():
            resp = client.post(
                "/api/prompts/generate",
                json={"task_type": "chat", "tone": tone},
            )
        assert resp.status_code == 200, f"tone={tone} failed: {resp.text}"


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def test_generate_prompt_invalid_task_type_returns_422(client):
    """Unknown task_type triggers a validation error."""
    resp = client.post(
        "/api/prompts/generate",
        json={"task_type": "unknown_type"},
    )
    assert resp.status_code == 422


def test_generate_prompt_invalid_tone_returns_422(client):
    """Unknown tone triggers a validation error."""
    resp = client.post(
        "/api/prompts/generate",
        json={"task_type": "chat", "tone": "angry"},
    )
    assert resp.status_code == 422


def test_generate_prompt_context_too_long_returns_422(client):
    """Context exceeding 500 chars triggers a validation error."""
    resp = client.post(
        "/api/prompts/generate",
        json={"task_type": "chat", "context": "x" * 501},
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Error paths
# ---------------------------------------------------------------------------

def test_generate_prompt_llm_unavailable_returns_503(client):
    """When LLM reports unavailable status, endpoint returns 503."""
    with _llm_patch(reply="", status="llm_unavailable"):
        resp = client.post("/api/prompts/generate", json={"task_type": "chat"})

    assert resp.status_code == 503


def test_generate_prompt_empty_llm_reply_returns_500(client):
    """When LLM returns an empty string, endpoint returns 500."""
    with _llm_patch(reply="   "):
        resp = client.post("/api/prompts/generate", json={"task_type": "chat"})

    assert resp.status_code == 500


def test_generate_prompt_llm_exception_returns_500(client):
    """An unexpected LLM exception propagates as a 500 response."""
    mock_llm = MagicMock()
    mock_llm.generate = AsyncMock(side_effect=RuntimeError("boom"))
    with patch("app.routers.prompts.LLMService", return_value=mock_llm):
        resp = client.post("/api/prompts/generate", json={"task_type": "chat"})

    assert resp.status_code == 500
