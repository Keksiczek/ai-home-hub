"""Tests for parallel KB + Memory context fetching in context_helpers."""
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.utils.context_helpers import MemoryContextResult, enrich_message


@pytest.fixture(autouse=True)
def _patch_settings():
    mock_svc = MagicMock()
    mock_svc.load.return_value = {"knowledge_base": {"enabled": True}}
    with patch("app.utils.context_helpers.get_settings_service", return_value=mock_svc):
        yield


@pytest.mark.asyncio
async def test_parallel_fetch_both_succeed():
    """Both KB and memory context should be fetched in parallel and merged."""
    async def _fake_kb(msg):
        return "[From doc.pdf]\nSome KB content"

    async def _fake_memory(msg):
        return MemoryContextResult(
            xml='<user_memory>\n  <note importance="high">Remember X</note>\n</user_memory>',
            items=[{"id": "1", "text": "Remember X", "importance": "high"}],
        )

    with patch("app.utils.context_helpers.get_kb_context", side_effect=_fake_kb), \
         patch("app.utils.context_helpers.get_memory_context", side_effect=_fake_memory):
        llm_message, meta = await enrich_message("test query")

    assert meta["kb_context_used"] is True
    assert meta["memory_context_used"] is True
    assert "context_fetch_ms" in meta
    assert "<user_memory>" in llm_message
    assert "Some KB content" in llm_message


@pytest.mark.asyncio
async def test_parallel_fetch_kb_fails_gracefully():
    """If KB fetch fails, memory should still work."""
    async def _failing_kb(msg):
        raise RuntimeError("ChromaDB down")

    async def _fake_memory(msg):
        return MemoryContextResult(
            xml='<user_memory>\n  <note importance="low">Note</note>\n</user_memory>',
            items=[{"id": "2", "text": "Note", "importance": "low"}],
        )

    with patch("app.utils.context_helpers.get_kb_context", side_effect=_failing_kb), \
         patch("app.utils.context_helpers.get_memory_context", side_effect=_fake_memory):
        llm_message, meta = await enrich_message("test")

    assert meta["kb_context_used"] is False
    assert meta["memory_context_used"] is True


@pytest.mark.asyncio
async def test_parallel_fetch_memory_fails_gracefully():
    """If memory fetch fails, KB should still work."""
    async def _fake_kb(msg):
        return "[From notes.txt]\nKB data"

    async def _failing_memory(msg):
        raise ValueError("Memory service error")

    with patch("app.utils.context_helpers.get_kb_context", side_effect=_fake_kb), \
         patch("app.utils.context_helpers.get_memory_context", side_effect=_failing_memory):
        llm_message, meta = await enrich_message("test")

    assert meta["kb_context_used"] is True
    assert meta["memory_context_used"] is False
    assert "KB data" in llm_message


@pytest.mark.asyncio
async def test_parallel_fetch_both_fail():
    """If both fail, message should be returned unchanged."""
    async def _fail_kb(msg):
        raise RuntimeError("KB down")

    async def _fail_memory(msg):
        raise RuntimeError("Memory down")

    with patch("app.utils.context_helpers.get_kb_context", side_effect=_fail_kb), \
         patch("app.utils.context_helpers.get_memory_context", side_effect=_fail_memory):
        llm_message, meta = await enrich_message("original message")

    assert llm_message == "original message"
    assert meta["kb_context_used"] is False
    assert meta["memory_context_used"] is False


@pytest.mark.asyncio
async def test_context_fetch_ms_is_reported():
    """Meta should include context_fetch_ms timing."""
    async def _fake_kb(msg):
        return ""

    async def _fake_memory(msg):
        return MemoryContextResult(xml="", items=[])

    with patch("app.utils.context_helpers.get_kb_context", side_effect=_fake_kb), \
         patch("app.utils.context_helpers.get_memory_context", side_effect=_fake_memory):
        _, meta = await enrich_message("test")

    assert "context_fetch_ms" in meta
    assert isinstance(meta["context_fetch_ms"], int)
    assert meta["context_fetch_ms"] >= 0
