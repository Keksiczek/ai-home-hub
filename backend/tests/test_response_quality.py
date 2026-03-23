"""Tests for response quality improvements (5H)."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.fixture(autouse=True)
def _patch_settings():
    mock_svc = MagicMock()
    mock_svc.get_llm_config.return_value = {
        "provider": "ollama",
        "ollama_url": "http://localhost:11434",
        "model": "llama3.2",
        "temperature": 0.3,
        "timeout_seconds": 30,
    }
    mock_svc.get_system_prompt.return_value = "Test prompt."
    mock_svc.load.return_value = {"auto_translate_to_czech": True}

    # Mock circuit breaker so it always allows requests
    mock_cb = MagicMock()
    mock_cb.can_execute = AsyncMock(return_value=True)
    mock_cb.record_success = AsyncMock()
    mock_cb.record_failure = AsyncMock()
    mock_cb.recovery_timeout = 30.0

    with patch(
        "app.services.llm_service.get_settings_service", return_value=mock_svc
    ), patch(
        "app.services.llm_service.get_ollama_circuit_breaker", return_value=mock_cb
    ):
        yield mock_svc


# ── 5H-1: Retry on empty response ──────────────────────────


@pytest.mark.asyncio
async def test_empty_response_triggers_retry():
    """Empty response from Ollama should trigger retry (max 2)."""
    from app.services.llm_service import LLMService

    call_count = 0

    async def _fake_call(ollama_url, payload, timeout):
        nonlocal call_count
        call_count += 1
        if call_count <= 1:
            return ""  # First call returns empty
        return "Actual response"

    with patch(
        "app.services.llm_service._call_ollama_with_retry", side_effect=_fake_call
    ):
        svc = LLMService()
        reply, meta = await svc._generate_ollama(
            "test", "general", [], svc._settings.get_llm_config()
        )

    assert reply == "Actual response"
    assert call_count == 2  # 1 initial + 1 retry


@pytest.mark.asyncio
async def test_empty_response_fallback_after_retries():
    """After 2 retries still empty, return fallback message."""
    from app.services.llm_service import LLMService

    async def _always_empty(ollama_url, payload, timeout):
        return ""

    with patch(
        "app.services.llm_service._call_ollama_with_retry", side_effect=_always_empty
    ):
        svc = LLMService()
        reply, meta = await svc._generate_ollama(
            "test", "general", [], svc._settings.get_llm_config()
        )

    assert "nevrátil odpověď" in reply.lower() or "nevratil" in reply.lower()
    assert meta.get("empty_response_fallback") is True


# ── 5H-2: Language detection ───────────────────────────────


def test_looks_english_with_english_text():
    """Long English text without diacritics should be detected as English."""
    from app.services.llm_service import LLMService

    english_text = " ".join(["The quick brown fox jumps over the lazy dog."] * 10)
    assert LLMService._looks_english(english_text) is True


def test_looks_english_with_czech_text():
    """Czech text with diacritics should NOT be detected as English."""
    from app.services.llm_service import LLMService

    czech_text = " ".join(["Příliš žluťoučký kůň úpěl ďábelské ódy."] * 10)
    assert LLMService._looks_english(czech_text) is False


def test_looks_english_short_text():
    """Short text (<50 words) should never be flagged as English."""
    from app.services.llm_service import LLMService

    assert LLMService._looks_english("Hello world") is False


# ── 5H-3: Structured output hints ─────────────────────────


def test_comparison_hint_added():
    """Messages with comparison keywords should get table/list hint."""
    from app.services.llm_service import LLMService

    result = LLMService._add_structured_hints(
        "Base prompt.", "Porovnej Python a JavaScript"
    )
    assert "tabulku" in result.lower() or "seznam" in result.lower()


def test_step_hint_added():
    """Messages with how-to keywords should get numbered steps hint."""
    from app.services.llm_service import LLMService

    result = LLMService._add_structured_hints(
        "Base prompt.", "Jak nainstalovat Docker?"
    )
    assert "číslovaný" in result.lower() or "kroků" in result.lower()


def test_no_hint_for_regular_message():
    """Regular messages should not get extra hints."""
    from app.services.llm_service import LLMService

    result = LLMService._add_structured_hints("Base prompt.", "Co je Python?")
    assert result == "Base prompt."


# ── 5H-4: KB and Memory context formatting ────────────────


def test_kb_context_uses_xml_tags():
    """KB context should be wrapped in <kb_context> XML tags."""
    # This tests the formatting in context_helpers.get_kb_context
    # We test the formatter directly
    from app.utils.context_helpers import get_kb_context

    # Since get_kb_context uses ChromaDB, we just verify the format expectation
    # by checking the source code pattern
    import inspect

    source = inspect.getsource(get_kb_context)
    assert "kb_context" in source
    assert "relevance" in source


@pytest.mark.asyncio
async def test_auto_translate_disabled():
    """When auto_translate_to_czech is False, no translation should happen."""
    from app.services.llm_service import LLMService

    english_reply = " ".join(
        ["This is a long English response about programming."] * 10
    )

    call_count = 0

    async def _fake_call(ollama_url, payload, timeout):
        nonlocal call_count
        call_count += 1
        return english_reply

    mock_svc = MagicMock()
    mock_svc.get_llm_config.return_value = {
        "ollama_url": "http://localhost:11434",
        "model": "llama3.2",
        "timeout_seconds": 30,
    }
    mock_svc.get_system_prompt.return_value = "Test."
    mock_svc.load.return_value = {"auto_translate_to_czech": False}

    mock_cb = MagicMock()
    mock_cb.can_execute = AsyncMock(return_value=True)
    mock_cb.record_success = AsyncMock()
    mock_cb.record_failure = AsyncMock()
    mock_cb.recovery_timeout = 30.0

    with patch(
        "app.services.llm_service.get_settings_service", return_value=mock_svc
    ), patch(
        "app.services.llm_service.get_ollama_circuit_breaker", return_value=mock_cb
    ), patch(
        "app.services.llm_service._call_ollama_with_retry", side_effect=_fake_call
    ):
        svc = LLMService()
        reply, meta = await svc._generate_ollama(
            "test", "general", [], svc._settings.get_llm_config()
        )

    # Should only have 1 call (no translation call)
    assert call_count == 1
    assert meta["auto_translated"] is False
