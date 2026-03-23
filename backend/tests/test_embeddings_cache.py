"""Tests for the EmbeddingsService LRU cache."""

import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.fixture(autouse=True)
def _patch_settings():
    mock_svc = MagicMock()
    mock_svc.load.return_value = {
        "llm": {
            "ollama_url": "http://localhost:11434",
            "embeddings_model": "nomic-embed-text",
        }
    }
    with patch(
        "app.services.embeddings_service.get_settings_service", return_value=mock_svc
    ):
        yield


def _make_mock_client(embedding: list[float]):
    """Build a mock httpx.AsyncClient that returns a fixed embedding."""
    mock_resp = MagicMock()
    mock_resp.raise_for_status.return_value = None
    mock_resp.json.return_value = {"embedding": embedding}

    mock_client = AsyncMock()
    mock_client.post = AsyncMock(return_value=mock_resp)
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    return mock_client


@pytest.mark.asyncio
async def test_cache_hit():
    """Second call with same text should return cached result without calling Ollama."""
    from app.services.embeddings_service import EmbeddingsService

    mock_client = _make_mock_client([0.1, 0.2, 0.3])

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = EmbeddingsService()
        result1 = await svc.get_embedding("hello world")
        result2 = await svc.get_embedding("hello world")

    assert result1 == [0.1, 0.2, 0.3]
    assert result2 == [0.1, 0.2, 0.3]
    # Only one actual call to Ollama
    assert mock_client.post.await_count == 1
    assert svc._cache_hits == 1
    assert svc._cache_misses == 1


@pytest.mark.asyncio
async def test_cache_miss_different_text():
    """Different text should trigger a new Ollama call."""
    from app.services.embeddings_service import EmbeddingsService

    mock_client = _make_mock_client([0.1, 0.2, 0.3])

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = EmbeddingsService()
        await svc.get_embedding("hello")
        await svc.get_embedding("world")

    assert mock_client.post.await_count == 2
    assert svc._cache_misses == 2
    assert svc._cache_hits == 0


@pytest.mark.asyncio
async def test_cache_ttl_expiry():
    """Expired cache entries should be evicted and re-fetched."""
    from app.services.embeddings_service import EmbeddingsService

    mock_client = _make_mock_client([0.1, 0.2])

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = EmbeddingsService()
        svc._cache_ttl_seconds = 0  # Immediate expiry

        await svc.get_embedding("test")
        # Entry is now expired immediately
        time.sleep(0.01)
        await svc.get_embedding("test")

    # Both calls should have hit Ollama
    assert mock_client.post.await_count == 2
    assert svc._cache_misses == 2


@pytest.mark.asyncio
async def test_cache_eviction_at_max_size():
    """When cache is full, oldest entry should be evicted."""
    from app.services.embeddings_service import EmbeddingsService

    mock_client = _make_mock_client([0.5])

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = EmbeddingsService()
        svc._cache_max_size = 3

        await svc.get_embedding("a")
        await svc.get_embedding("b")
        await svc.get_embedding("c")
        assert len(svc._cache) == 3

        # Adding a 4th should evict the oldest
        await svc.get_embedding("d")
        assert len(svc._cache) == 3


@pytest.mark.asyncio
async def test_cache_stats():
    """get_cache_stats() should return accurate counts."""
    from app.services.embeddings_service import EmbeddingsService

    mock_client = _make_mock_client([1.0])

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = EmbeddingsService()
        await svc.get_embedding("x")
        await svc.get_embedding("x")  # hit
        await svc.get_embedding("y")  # miss

    stats = svc.get_cache_stats()
    assert stats["size"] == 2
    assert stats["hits"] == 1
    assert stats["misses"] == 2
    assert stats["hit_rate_percent"] == pytest.approx(33.3, abs=0.1)


@pytest.mark.asyncio
async def test_clear_cache():
    """clear_cache() should empty the cache and reset counters."""
    from app.services.embeddings_service import EmbeddingsService

    mock_client = _make_mock_client([1.0])

    with patch("httpx.AsyncClient", return_value=mock_client):
        svc = EmbeddingsService()
        await svc.get_embedding("x")

    prev_stats = svc.clear_cache()
    assert prev_stats["size"] == 1
    assert len(svc._cache) == 0
    assert svc._cache_hits == 0
    assert svc._cache_misses == 0


@pytest.mark.asyncio
async def test_empty_text_returns_none():
    """Empty or whitespace-only text should return None without caching."""
    from app.services.embeddings_service import EmbeddingsService

    svc = EmbeddingsService()
    result = await svc.get_embedding("   ")
    assert result is None
    assert len(svc._cache) == 0
