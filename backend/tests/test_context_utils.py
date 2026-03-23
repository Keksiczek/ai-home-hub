"""Tests for context_utils.py – KB and memory context injection (4H)."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.memory_service import MemoryRecord


def _make_mock_memory_svc(has_data=True):
    svc = MagicMock()
    if has_data:
        svc.collection.count.return_value = 2
        svc.search_memory = AsyncMock(
            return_value=[
                MemoryRecord(
                    id="mem_aaa",
                    text="User prefers Czech",
                    tags=["preference"],
                    source="ui",
                    importance=8,
                    timestamp="2025-01-01T00:00:00+00:00",
                    distance=0.15,
                ),
            ]
        )
    else:
        svc.collection.count.return_value = 0
    return svc


@pytest.mark.asyncio
async def test_get_memory_context_returns_xml():
    mock_svc = _make_mock_memory_svc()
    with patch("app.services.memory_service.get_memory_service", return_value=mock_svc):
        from app.utils.context_utils import get_memory_context

        result = await get_memory_context("hello", session_id="s1")
    assert "<user_memory>" in result
    assert "User prefers Czech" in result


@pytest.mark.asyncio
async def test_get_memory_context_empty_when_no_memories():
    mock_svc = _make_mock_memory_svc(has_data=False)
    with patch("app.services.memory_service.get_memory_service", return_value=mock_svc):
        from app.utils.context_utils import get_memory_context

        result = await get_memory_context("hello")
    assert result == ""


@pytest.mark.asyncio
async def test_get_kb_context_returns_context():
    mock_settings = MagicMock()
    mock_settings.load.return_value = {"knowledge_base": {"enabled": True}}

    mock_vs = MagicMock()
    mock_vs.get_stats.return_value = {"total_chunks": 10}
    mock_vs.search.return_value = {
        "documents": ["chunk text"],
        "metadatas": [{"file_name": "doc.pdf"}],
        "distances": [0.2],
    }

    mock_emb = AsyncMock()
    mock_emb.generate_embedding.return_value = [0.1, 0.2, 0.3]

    with patch(
        "app.utils.context_utils.get_settings_service", return_value=mock_settings
    ), patch(
        "app.services.vector_store_service.get_vector_store_service",
        return_value=mock_vs,
    ), patch(
        "app.services.embeddings_service.get_embeddings_service", return_value=mock_emb
    ):
        from app.utils.context_utils import get_kb_context

        result = await get_kb_context("search query")
    assert "chunk text" in result
    assert "[From doc.pdf]" in result


@pytest.mark.asyncio
async def test_get_kb_context_empty_when_disabled():
    mock_settings = MagicMock()
    mock_settings.load.return_value = {"knowledge_base": {"enabled": False}}

    with patch(
        "app.utils.context_utils.get_settings_service", return_value=mock_settings
    ):
        from app.utils.context_utils import get_kb_context

        result = await get_kb_context("test")
    assert result == ""


def test_build_system_prompt_with_context():
    from app.utils.context_utils import build_system_prompt_with_context

    result = build_system_prompt_with_context("Base prompt", "memory xml", "kb text")
    assert "Base prompt" in result
    assert "memory xml" in result
    assert "kb text" in result


def test_build_system_prompt_no_context():
    from app.utils.context_utils import build_system_prompt_with_context

    result = build_system_prompt_with_context("Base prompt", "", "")
    assert result == "Base prompt"


@pytest.mark.asyncio
async def test_enrich_message_adds_memory_and_kb_flags():
    """enrich_message must set memory_used and kb_used flags in meta."""
    mock_svc = _make_mock_memory_svc()

    # Patch at the module where they are imported/used
    with patch(
        "app.utils.context_helpers.get_kb_context",
        new_callable=AsyncMock,
        return_value="kb stuff",
    ), patch("app.services.memory_service.get_memory_service", return_value=mock_svc):
        from app.utils.context_helpers import enrich_message

        llm_msg, meta = await enrich_message("hello")

    assert meta["memory_used"] is True
    # kb_used comes from get_kb_context returning non-empty string
    # But context_helpers.enrich_message calls context_helpers.get_kb_context (imported)
    assert meta["kb_used"] is True
    assert "kb stuff" in llm_msg
    assert "<user_memory>" in llm_msg
