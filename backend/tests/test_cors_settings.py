"""Tests for CORS settings endpoint: GET and PATCH /api/settings/cors."""
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

for _mod in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod, MagicMock())

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client():
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


# ---------------------------------------------------------------------------
# Test 1 – GET /api/settings/cors returns allowed_origins list
# ---------------------------------------------------------------------------

def test_get_cors_returns_allowed_origins(client):
    resp = client.get("/api/settings/cors")
    assert resp.status_code == 200
    data = resp.json()
    assert "allowed_origins" in data
    assert isinstance(data["allowed_origins"], list)


# ---------------------------------------------------------------------------
# Test 2 – PATCH with valid origins updates settings
# ---------------------------------------------------------------------------

def test_patch_cors_valid_origins(client):
    origins = ["http://localhost:8000", "https://myapp.ts.net"]
    with patch("app.routers.settings.get_settings_service") as mock_svc_fn:
        mock_svc = MagicMock()
        mock_svc.update.return_value = {"cors": {"allowed_origins": origins}}
        mock_svc_fn.return_value = mock_svc

        resp = client.patch(
            "/api/settings/cors",
            json={"allowed_origins": origins},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["updated"] is True
    assert data["allowed_origins"] == origins


# ---------------------------------------------------------------------------
# Test 3 – PATCH with invalid URL returns 422
# ---------------------------------------------------------------------------

def test_patch_cors_invalid_url_returns_422(client):
    resp = client.patch(
        "/api/settings/cors",
        json={"allowed_origins": ["not-a-url", "javascript:alert(1)"]},
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Test 4 – PATCH with non-list body returns 400
# ---------------------------------------------------------------------------

def test_patch_cors_non_list_returns_400(client):
    resp = client.patch(
        "/api/settings/cors",
        json={"allowed_origins": "http://localhost:8000"},
    )
    assert resp.status_code == 400
