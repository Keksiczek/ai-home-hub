"""Tests for GET /api/models/search/huggingface – HuggingFace GGUF search."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def test_search_huggingface_returns_results(client):
    """GET /api/models/search/huggingface?q=llama returns HF models."""
    hf_response = [
        {
            "id": "bartowski/Llama-3.2-3B-Instruct-GGUF",
            "downloads": 125000,
            "likes": 234,
        },
        {
            "id": "TheBloke/Llama-2-7B-GGUF",
            "downloads": 500000,
            "likes": 1000,
        },
    ]

    mock_resp = MagicMock()
    mock_resp.json.return_value = hf_response
    mock_resp.raise_for_status.return_value = None

    mock_client = AsyncMock()
    mock_client.get.return_value = mock_resp
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch("app.services.model_manager_service.httpx.AsyncClient", return_value=mock_ctx):
        resp = client.get("/api/models/search/huggingface?q=llama")

    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert len(data["results"]) == 2
    assert data["results"][0]["ollama_name"] == "hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF"
    assert data["results"][0]["downloads"] == 125000


def test_search_huggingface_requires_query(client):
    """GET /api/models/search/huggingface without q returns 422."""
    resp = client.get("/api/models/search/huggingface")
    assert resp.status_code == 422
