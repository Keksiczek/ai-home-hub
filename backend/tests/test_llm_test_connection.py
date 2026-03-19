"""Tests for POST /api/llm/test – Ollama connection test."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def test_llm_test_connection_success(client):
    """POST /api/llm/test returns ok when Ollama is reachable."""
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"models": [{"name": "llama3.2"}]}
    mock_resp.raise_for_status.return_value = None
    mock_resp.headers = {"ollama-version": "0.3.12"}

    mock_client = AsyncMock()
    mock_client.get.return_value = mock_resp
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch("app.routers.models.httpx.AsyncClient", return_value=mock_ctx):
        resp = client.post("/api/llm/test")

    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["version"] == "0.3.12"
    assert data["model_count"] == 1


def test_llm_test_connection_failure(client):
    """POST /api/llm/test returns error when Ollama is down."""
    import httpx as real_httpx

    mock_client = AsyncMock()
    mock_client.get.side_effect = real_httpx.ConnectError("Connection refused")
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch("app.routers.models.httpx.AsyncClient", return_value=mock_ctx):
        resp = client.post("/api/llm/test")

    assert resp.status_code == 200  # Endpoint returns 200 with error status
    data = resp.json()
    assert data["status"] == "error"
    assert "message" in data
