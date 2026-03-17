"""Shared pytest fixtures for the ai-home-hub backend test suite."""
import sys
from typing import Any, Dict
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── Compatibility shim ───────────────────────────────────────────────────────
# chromadb==0.4.22 references np.float_ which was removed in NumPy 2.0.
# Mock the module at the sys.modules level so the import chain never touches
# the real chromadb code.  The vector-store service is not exercised in these
# tests, so a MagicMock is sufficient.
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

# App import must come AFTER the sys.modules patch above.
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    """Synchronous ASGI test client with full app lifespan.

    Mocks startup checks so tests don't require a running Ollama instance.
    """
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


def _make_ollama_mock() -> tuple:
    """
    Build a patched httpx.AsyncClient that intercepts Ollama HTTP calls.

    Returns (mock_class, call_log) where call_log is a list of dicts
    ``{"url": str, "json": dict}`` appended for each POST request.

    Response routing:
    - URL contains ``/api/generate`` → ``{"response": "mocked vision reply"}``
    - All other URLs              → ``{"message": {"content": "mocked chat reply"}}``
    """
    call_log: list[Dict[str, Any]] = []

    async def _fake_post(url: str, **kwargs: Any) -> MagicMock:
        call_log.append({"url": url, "json": kwargs.get("json", {})})
        mock_resp = MagicMock()
        mock_resp.raise_for_status.return_value = None
        if "/api/generate" in url:
            mock_resp.json.return_value = {"response": "mocked vision reply"}
        else:
            mock_resp.json.return_value = {"message": {"content": "mocked chat reply"}}
        return mock_resp

    mock_client = AsyncMock()
    mock_client.post.side_effect = _fake_post

    mock_ctx = AsyncMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_client)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)

    mock_class = MagicMock(return_value=mock_ctx)
    return mock_class, call_log


@pytest.fixture
def mock_ollama() -> Dict[str, Any]:
    """
    Patch ``httpx.AsyncClient`` so no real Ollama connection is made.

    Yields a dict with key ``"calls"`` – a list of captured POST payloads.
    Each entry: ``{"url": str, "json": dict}``.
    """
    mock_class, call_log = _make_ollama_mock()
    with patch("httpx.AsyncClient", mock_class):
        yield {"calls": call_log}
