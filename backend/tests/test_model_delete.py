"""Tests for DELETE /api/models/{name} – delete an Ollama model."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def test_delete_model_success(client):
    """DELETE /api/models/llama3.2:3b returns ok on successful delete."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200

    mock_client = AsyncMock()
    mock_client.delete.return_value = mock_resp
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch(
        "app.services.model_manager_service.httpx.AsyncClient", return_value=mock_ctx
    ):
        resp = client.delete("/api/models/llama3.2:3b")

    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["deleted"] == "llama3.2:3b"


def test_delete_model_not_found(client):
    """DELETE /api/models/nonexistent returns 404."""
    mock_resp = MagicMock()
    mock_resp.status_code = 404

    mock_client = AsyncMock()
    mock_client.delete.return_value = mock_resp
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch(
        "app.services.model_manager_service.httpx.AsyncClient", return_value=mock_ctx
    ):
        resp = client.delete("/api/models/nonexistent:latest")

    assert resp.status_code == 404
