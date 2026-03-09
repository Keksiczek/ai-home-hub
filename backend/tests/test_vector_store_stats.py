"""Tests for VectorStoreService.get_stats() – sampling and detailed/lightweight modes."""
from unittest.mock import MagicMock, patch

import pytest

from app.services.vector_store_service import VectorStoreService


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_service(count: int, metadatas: list) -> VectorStoreService:
    """Return a VectorStoreService with a fully-mocked ChromaDB collection."""
    svc = VectorStoreService.__new__(VectorStoreService)
    col = MagicMock()
    col.count.return_value = count
    col.get.return_value = {"metadatas": metadatas}
    svc.collection = col
    return svc


# ── Tests ─────────────────────────────────────────────────────────────────────


def test_get_stats_lightweight_skips_metadata_scan():
    """detailed=False must return only total_chunks / collection_name without fetching metadatas."""
    svc = _make_service(count=42, metadatas=[])

    result = svc.get_stats(detailed=False)

    assert result["total_chunks"] == 42
    assert result["collection_name"] == VectorStoreService.COLLECTION_NAME
    assert result["detailed"] is False
    # The metadata scan must NOT have been called
    svc.collection.get.assert_not_called()


def test_get_stats_detailed_returns_breakdown():
    """detailed=True returns file_types, top_sources, and total_documents."""
    metadatas = [
        {"file_path": "/docs/guide.pdf", "file_name": "guide.pdf"},
        {"file_path": "/docs/guide.pdf", "file_name": "guide.pdf"},
        {"file_path": "/notes/todo.md", "file_name": "todo.md"},
    ]
    svc = _make_service(count=3, metadatas=metadatas)

    result = svc.get_stats(detailed=True)

    assert result["total_chunks"] == 3
    assert result["total_documents"] == 2          # 2 unique files
    assert result["file_types"][".pdf"] == 2
    assert result["file_types"][".md"] == 1
    assert result["sampled"] is False
    assert "warning" not in result
    assert len(result["top_sources"]) == 2


def test_get_stats_large_collection_samples_and_warns():
    """Collections > 50 000 chunks trigger sampling and add a warning field."""
    # Build 3 fake metadatas – what matters is count > threshold
    metadatas = [
        {"file_path": "/big/file.txt", "file_name": "file.txt"},
    ] * 3
    svc = _make_service(count=60_000, metadatas=metadatas)

    result = svc.get_stats(detailed=True, sample_limit=10_000)

    assert result["sampled"] is True
    assert "warning" in result
    assert "sample" in result["warning"].lower()
    # collection.get should have been called with limit=10_000
    svc.collection.get.assert_called_once_with(limit=10_000, include=["metadatas"])


def test_stats_endpoint_detailed_false(client, monkeypatch):
    """GET /knowledge/stats?detailed=false returns lightweight response."""
    mock_vs = MagicMock()
    mock_vs.get_stats.return_value = {
        "total_chunks": 7,
        "collection_name": "knowledge_base",
        "detailed": False,
    }
    monkeypatch.setattr(
        "app.routers.knowledge.get_vector_store_service", lambda: mock_vs
    )

    resp = client.get("/api/knowledge/stats", params={"detailed": "false"})

    assert resp.status_code == 200
    data = resp.json()
    assert data["total_chunks"] == 7
    assert data["detailed"] is False
    mock_vs.get_stats.assert_called_once_with(detailed=False)
