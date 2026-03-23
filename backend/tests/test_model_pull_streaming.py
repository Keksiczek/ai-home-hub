"""Tests for POST /api/models/pull – SSE streaming download progress."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def test_pull_model_returns_sse_stream(client):
    """POST /api/models/pull returns SSE stream with progress events."""
    # The endpoint returns a StreamingResponse, so we just verify the
    # response starts successfully and has the right content type.
    lines = [
        '{"status":"pulling manifest","completed":0,"total":0}',
        '{"status":"pulling fs layer","completed":500000000,"total":2000000000}',
        '{"status":"pulling fs layer","completed":2000000000,"total":2000000000}',
        '{"status":"success","completed":2000000000,"total":2000000000}',
    ]

    async def fake_aiter_lines():
        for line in lines:
            yield line

    mock_stream_resp = AsyncMock()
    mock_stream_resp.raise_for_status.return_value = None
    mock_stream_resp.aiter_lines = fake_aiter_lines
    mock_stream_resp.__aenter__ = AsyncMock(return_value=mock_stream_resp)
    mock_stream_resp.__aexit__ = AsyncMock(return_value=False)

    mock_client = AsyncMock()
    mock_client.stream.return_value = mock_stream_resp
    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch(
        "app.services.model_manager_service.httpx.AsyncClient", return_value=mock_ctx
    ):
        resp = client.post("/api/models/pull", json={"name": "llama3.2:3b"})

    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers.get("content-type", "")
    # SSE data lines should be present
    body = resp.text
    assert "data:" in body


def test_pull_model_requires_name(client):
    """POST /api/models/pull without name returns 422."""
    resp = client.post("/api/models/pull", json={})
    assert resp.status_code == 422
