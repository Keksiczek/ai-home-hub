"""Tests for GET /api/models/installed – list installed Ollama models."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def test_list_installed_returns_models(client):
    """GET /api/models/installed returns model list when Ollama is available."""
    mock_models = [
        {"name": "llama3.2:3b", "size": 2_000_000_000, "modified_at": "2024-01-01", "digest": "abc123"},
        {"name": "llava:7b", "size": 4_700_000_000, "modified_at": "2024-01-02", "digest": "def456"},
    ]

    mock_resp = MagicMock()
    mock_resp.json.return_value = {"models": mock_models}
    mock_resp.raise_for_status.return_value = None

    mock_client = AsyncMock()
    mock_client.get.return_value = mock_resp
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch("app.services.model_manager_service.httpx.AsyncClient", return_value=mock_ctx):
        resp = client.get("/api/models/installed")

    assert resp.status_code == 200
    data = resp.json()
    assert "models" in data
    assert data["count"] == 2
    assert data["models"][0]["name"] == "llama3.2:3b"
    assert data["models"][0]["type"] == "chat"
    assert data["models"][1]["type"] == "vision"


def test_list_installed_ollama_down(client):
    """GET /api/models/installed returns 502 when Ollama is unreachable."""
    import httpx as real_httpx

    mock_client = AsyncMock()
    mock_client.get.side_effect = real_httpx.ConnectError("Connection refused")
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch("app.services.model_manager_service.httpx.AsyncClient", return_value=mock_ctx):
        resp = client.get("/api/models/installed")

    assert resp.status_code == 502
