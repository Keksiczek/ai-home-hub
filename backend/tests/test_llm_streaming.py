"""Tests for LLM streaming – generate_stream() yields tokens from Ollama NDJSON."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio


@pytest.fixture(autouse=True)
def _patch_settings():
    """Provide a minimal settings service and circuit breaker for all tests in this module."""
    mock_svc = MagicMock()
    mock_svc.get_llm_config.return_value = {
        "provider": "ollama",
        "ollama_url": "http://localhost:11434",
        "model": "llama3.2",
        "temperature": 0.3,
        "timeout_seconds": 30,
    }
    mock_svc.get_system_prompt.return_value = "You are a helpful assistant."

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


def _make_ndjson_lines(tokens: list[str], include_done: bool = True) -> list[str]:
    """Build NDJSON lines the same way Ollama streams them."""
    lines = []
    for t in tokens:
        lines.append(json.dumps({"message": {"content": t}, "done": False}))
    if include_done:
        lines.append(json.dumps({"message": {"content": ""}, "done": True}))
    return lines


@pytest.mark.asyncio
async def test_generate_stream_yields_tokens():
    """generate_stream() should yield individual tokens from the NDJSON stream."""
    from app.services.llm_service import LLMService

    tokens = ["Hello", " ", "world", "!"]
    ndjson_lines = _make_ndjson_lines(tokens)

    # Build a mock async line iterator
    async def _aiter_lines():
        for line in ndjson_lines:
            yield line

    mock_response = AsyncMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.aiter_lines = _aiter_lines
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=False)

    mock_client = AsyncMock()
    mock_client.stream = MagicMock(return_value=mock_response)
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = LLMService()
        collected = []
        async for token in svc.generate_stream("Hi"):
            collected.append(token)

    assert collected == tokens


@pytest.mark.asyncio
async def test_generate_stream_handles_empty_lines():
    """Empty lines in NDJSON should be skipped without error."""
    from app.services.llm_service import LLMService

    ndjson_lines = [
        "",
        json.dumps({"message": {"content": "ok"}, "done": False}),
        "  ",
        json.dumps({"message": {"content": ""}, "done": True}),
    ]

    async def _aiter_lines():
        for line in ndjson_lines:
            yield line

    mock_response = AsyncMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.aiter_lines = _aiter_lines
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=False)

    mock_client = AsyncMock()
    mock_client.stream = MagicMock(return_value=mock_response)
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = LLMService()
        collected = []
        async for token in svc.generate_stream("test"):
            collected.append(token)

    assert collected == ["ok"]


@pytest.mark.asyncio
async def test_generate_stream_fallback_on_connect_error():
    """When Ollama is unreachable, generate_stream() yields a stub message."""
    import httpx
    from app.services.llm_service import LLMService

    mock_client = AsyncMock()
    mock_client.stream = MagicMock(side_effect=httpx.ConnectError("refused"))
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = LLMService()
        collected = []
        async for token in svc.generate_stream("test"):
            collected.append(token)

    assert len(collected) == 1
    assert (
        "Stub" in collected[0]
        or "not reachable" in collected[0].lower()
        or "stub" in collected[0].lower()
    )
