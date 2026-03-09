"""Tests for Shared Memory CRUD and search operations."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def mock_memory_service(monkeypatch):
    """Replace get_memory_service with a MagicMock that tracks calls."""
    from app.services.memory_service import MemoryRecord

    svc = MagicMock()

    # add_memory returns an ID
    svc.add_memory = AsyncMock(return_value="mem_test123456")

    # search_memory returns a list of MemoryRecord
    svc.search_memory = AsyncMock(return_value=[
        MemoryRecord(
            id="mem_aaa",
            text="User prefers short answers in Czech",
            tags=["preference", "language"],
            source="ui",
            importance=8,
            timestamp="2025-01-01T00:00:00+00:00",
            distance=0.15,
        ),
        MemoryRecord(
            id="mem_bbb",
            text="User likes Power BI and DAX",
            tags=["powerbi"],
            source="chat_session_1",
            importance=6,
            timestamp="2025-01-02T00:00:00+00:00",
            distance=0.35,
        ),
    ])

    # get_all_memories returns a list
    svc.get_all_memories.return_value = [
        MemoryRecord(
            id="mem_aaa",
            text="User prefers short answers in Czech",
            tags=["preference", "language"],
            source="ui",
            importance=8,
            timestamp="2025-01-01T00:00:00+00:00",
        ),
        MemoryRecord(
            id="mem_bbb",
            text="User likes Power BI and DAX",
            tags=["powerbi"],
            source="chat_session_1",
            importance=6,
            timestamp="2025-01-02T00:00:00+00:00",
        ),
    ]

    # delete_memory returns True
    svc.delete_memory.return_value = True

    # update_memory returns True
    svc.update_memory = AsyncMock(return_value=True)

    monkeypatch.setattr(
        "app.routers.memory.get_memory_service", lambda: svc
    )
    return svc


# ── Tests ─────────────────────────────────────────────────────────────────────


def test_add_memory(client, mock_memory_service):
    """POST /api/memory/add stores a memory and returns its ID."""
    resp = client.post("/api/memory/add", json={
        "text": "User prefers short answers in Czech",
        "tags": ["preference", "language"],
        "source": "ui",
        "importance": 8,
    })

    assert resp.status_code == 200
    data = resp.json()
    assert data["memory_id"] == "mem_test123456"
    mock_memory_service.add_memory.assert_called_once_with(
        text="User prefers short answers in Czech",
        tags=["preference", "language"],
        source="ui",
        importance=8,
    )


def test_add_memory_validation_empty_text(client, mock_memory_service):
    """POST /api/memory/add rejects empty text."""
    resp = client.post("/api/memory/add", json={
        "text": "",
        "tags": [],
        "importance": 5,
    })
    assert resp.status_code == 422


def test_add_memory_validation_importance_range(client, mock_memory_service):
    """POST /api/memory/add rejects importance outside 1-10."""
    resp = client.post("/api/memory/add", json={
        "text": "Some memory",
        "importance": 11,
    })
    assert resp.status_code == 422

    resp = client.post("/api/memory/add", json={
        "text": "Some memory",
        "importance": 0,
    })
    assert resp.status_code == 422


def test_search_memory(client, mock_memory_service):
    """POST /api/memory/search returns relevant results with distance."""
    resp = client.post("/api/memory/search", json={
        "query": "Czech language preference",
        "top_k": 5,
    })

    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 2
    results = data["results"]
    assert results[0]["id"] == "mem_aaa"
    assert results[0]["distance"] == 0.15
    assert results[1]["id"] == "mem_bbb"


def test_search_memory_with_filters(client, mock_memory_service):
    """POST /api/memory/search passes filters to service."""
    resp = client.post("/api/memory/search", json={
        "query": "powerbi",
        "top_k": 3,
        "filters": {"tags": ["powerbi"]},
    })

    assert resp.status_code == 200
    mock_memory_service.search_memory.assert_called_once_with(
        query="powerbi",
        top_k=3,
        filters={"tags": ["powerbi"]},
    )


def test_get_all_memories(client, mock_memory_service):
    """GET /api/memory/all returns all memories."""
    resp = client.get("/api/memory/all?limit=50")

    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 2
    assert len(data["memories"]) == 2
    mock_memory_service.get_all_memories.assert_called_once_with(limit=50)


def test_delete_memory(client, mock_memory_service):
    """DELETE /api/memory/{id} deletes a memory."""
    resp = client.delete("/api/memory/mem_aaa")

    assert resp.status_code == 200
    data = resp.json()
    assert data["deleted"] is True
    mock_memory_service.delete_memory.assert_called_once_with("mem_aaa")


def test_delete_memory_not_found(client, mock_memory_service):
    """DELETE /api/memory/{id} returns 404 for unknown ID."""
    mock_memory_service.delete_memory.return_value = False

    resp = client.delete("/api/memory/mem_nonexistent")

    assert resp.status_code == 404
    assert "mem_nonexistent" in resp.json()["detail"]


def test_update_memory(client, mock_memory_service):
    """PUT /api/memory/{id} updates text/tags/importance."""
    resp = client.put("/api/memory/mem_aaa", json={
        "text": "Updated memory text",
        "tags": ["updated"],
        "importance": 10,
    })

    assert resp.status_code == 200
    data = resp.json()
    assert data["updated"] is True
    mock_memory_service.update_memory.assert_called_once_with(
        memory_id="mem_aaa",
        new_text="Updated memory text",
        new_tags=["updated"],
        new_importance=10,
    )


def test_update_memory_partial(client, mock_memory_service):
    """PUT /api/memory/{id} allows partial updates."""
    resp = client.put("/api/memory/mem_aaa", json={
        "importance": 9,
    })

    assert resp.status_code == 200
    mock_memory_service.update_memory.assert_called_once_with(
        memory_id="mem_aaa",
        new_text=None,
        new_tags=None,
        new_importance=9,
    )


def test_update_memory_not_found(client, mock_memory_service):
    """PUT /api/memory/{id} returns 404 for unknown ID."""
    mock_memory_service.update_memory = AsyncMock(return_value=False)

    resp = client.put("/api/memory/mem_nonexistent", json={
        "text": "Updated text",
    })

    assert resp.status_code == 404


def test_filters_tag_search(client, mock_memory_service):
    """POST /api/memory/search with tag filter passes correct filters."""
    mock_memory_service.search_memory = AsyncMock(return_value=[])

    resp = client.post("/api/memory/search", json={
        "query": "anything",
        "filters": {"tags": ["preference", "language"]},
    })

    assert resp.status_code == 200
    assert resp.json()["count"] == 0
    mock_memory_service.search_memory.assert_called_once_with(
        query="anything",
        top_k=5,
        filters={"tags": ["preference", "language"]},
    )
