"""Tests for KB stats caching (4D)."""
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture(autouse=True)
def mock_cache_env(tmp_path, monkeypatch):
    """Redirect cache file to temp dir and mock vector store."""
    import app.services.kb_stats_cache as mod

    cache_file = tmp_path / "kb_stats_cache.json"
    monkeypatch.setattr(mod, "CACHE_FILE", cache_file)
    monkeypatch.setattr(mod, "DATA_DIR", tmp_path)

    # Mock CHROMA_DIR (used inside compute_stats)
    chroma_dir = tmp_path / "chroma"
    chroma_dir.mkdir(exist_ok=True)

    # Mock vector store service (used inside compute_stats via lazy import)
    vs = MagicMock()
    vs.get_stats.return_value = {
        "total_chunks": 100,
        "total_documents": 10,
        "file_types": {".pdf": 5, ".md": 5},
        "top_sources": [],
    }

    # Patch both the lazy import path and the CHROMA_DIR
    monkeypatch.setattr(
        "app.services.vector_store_service.get_vector_store_service", lambda: vs
    )
    monkeypatch.setattr(
        "app.services.vector_store_service.CHROMA_DIR", chroma_dir
    )

    return cache_file, vs


def test_refresh_cache_writes_file(mock_cache_env):
    from app.services.kb_stats_cache import refresh_cache
    cache_file, _ = mock_cache_env

    data = refresh_cache()
    assert cache_file.exists()
    assert data["total_chunks"] == 100
    assert "computed_at" in data

    with open(cache_file) as f:
        cached = json.load(f)
    assert cached["total_chunks"] == 100


def test_get_cached_stats_returns_cache(mock_cache_env):
    from app.services.kb_stats_cache import get_cached_stats, refresh_cache

    refresh_cache()
    stats = get_cached_stats()
    assert stats["total_chunks"] == 100
    assert "cache_age_seconds" in stats
    assert stats["cache_stale"] is False


def test_stale_detection(mock_cache_env):
    from app.services.kb_stats_cache import get_cached_stats
    import app.services.kb_stats_cache as mod

    cache_file, _ = mock_cache_env

    # Write cache with old timestamp
    old_data = {
        "computed_at": "2020-01-01T00:00:00+00:00",
        "total_chunks": 50,
    }
    mod._write_cache(old_data)

    stats = get_cached_stats()
    assert stats["cache_stale"] is True
    assert stats["cache_age_seconds"] > 600


def test_missing_cache_computes_fresh(mock_cache_env):
    from app.services.kb_stats_cache import get_cached_stats
    cache_file, _ = mock_cache_env

    assert not cache_file.exists()
    stats = get_cached_stats()
    assert stats["total_chunks"] == 100
    assert cache_file.exists()
