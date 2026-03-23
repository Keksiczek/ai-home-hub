"""Tests for GET /api/models/disk – disk space information."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def test_disk_space_returns_info(client):
    """GET /api/models/disk returns disk usage details."""
    mock_disk = (500_000_000_000, 50_000_000_000, 450_000_000_000)  # 500GB total

    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "models": [
            {
                "name": "llama3.2:3b",
                "size": 2_000_000_000,
                "modified_at": "",
                "digest": "",
            },
        ]
    }
    mock_resp.raise_for_status.return_value = None

    mock_client = AsyncMock()
    mock_client.get.return_value = mock_resp
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch(
        "app.services.model_manager_service.shutil.disk_usage", return_value=mock_disk
    ), patch(
        "app.services.model_manager_service.httpx.AsyncClient", return_value=mock_ctx
    ):
        resp = client.get("/api/models/disk")

    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "free" in data
    assert "used" in data
    assert "models_size" in data
    assert data["total"] == 500_000_000_000
    assert data["models_size"] == 2_000_000_000
