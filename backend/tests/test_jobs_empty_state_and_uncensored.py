"""Tests for Jobs empty-state fixes and uncensored model settings.

Covers:
- Jobs endpoints return consistent response shape ({jobs: [...], count: N})
- Job history endpoint returns consistent shape
- Job queue endpoint returns normalized shape
- Default allow_uncensored_models is False
- Persistence of allow_uncensored_models setting
- Model eligibility when uncensored toggle is OFF vs ON
- resolve_model falls back when uncensored model used with toggle OFF
"""

import sys
from typing import Any, Dict
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim ─────────────────────────────────────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.services.job_service import get_job_service  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


# ── Helpers ───────────────────────────────────────────────────────────────────


def _create_job(client, **kwargs) -> Dict[str, Any]:
    resp = client.post(
        "/api/jobs",
        json={
            "type": kwargs.get("type", "dummy_long_task"),
            "title": kwargs.get("title", "Test job"),
            "input_summary": "Created by test",
            "priority": kwargs.get("priority", "normal"),
        },
    )
    assert resp.status_code == 200
    return resp.json()


# ── Jobs Response Shape Tests ─────────────────────────────────────────────────


class TestJobsResponseShape:
    """All jobs list endpoints must return {jobs: [...]} with consistent fields."""

    def test_list_jobs_returns_jobs_array(self, client):
        _create_job(client)
        resp = client.get("/api/jobs")
        data = resp.json()
        assert "jobs" in data
        assert isinstance(data["jobs"], list)
        assert "count" in data
        assert data["count"] == len(data["jobs"])

    def test_list_jobs_item_has_required_fields(self, client):
        _create_job(client, title="Shape test")
        resp = client.get("/api/jobs")
        jobs = resp.json()["jobs"]
        assert len(jobs) > 0
        j = jobs[0]
        for field in ("id", "type", "title", "status", "created_at"):
            assert field in j, f"Missing field: {field}"

    def test_history_returns_jobs_array(self, client):
        _create_job(client)
        resp = client.get("/api/jobs/history?limit=5")
        data = resp.json()
        assert "jobs" in data
        assert isinstance(data["jobs"], list)
        assert "count" in data

    def test_history_item_has_required_fields(self, client):
        _create_job(client, title="History shape test")
        resp = client.get("/api/jobs/history?limit=5")
        jobs = resp.json()["jobs"]
        assert len(jobs) > 0
        j = jobs[0]
        for field in ("id", "type", "title", "status", "created_at"):
            assert field in j, f"Missing field: {field}"

    def test_queue_returns_queue_array(self, client):
        resp = client.get("/api/jobs/queue")
        data = resp.json()
        assert "queue" in data
        assert isinstance(data["queue"], list)
        assert "total" in data

    def test_mobile_summary_returns_jobs_array(self, client):
        _create_job(client)
        resp = client.get("/api/jobs/mobile-summary?limit=5")
        data = resp.json()
        assert "jobs" in data
        assert isinstance(data["jobs"], list)

    def test_empty_list_returns_empty_array_not_null(self, client):
        """Even with no matching jobs, the response must be an array, not null."""
        resp = client.get("/api/jobs?status=nonexistent_status_xyz")
        data = resp.json()
        assert data["jobs"] == []
        assert data["count"] == 0


# ── Uncensored Model Settings Tests ──────────────────────────────────────────


class TestUncensoredModelSettings:
    """Settings for allow_uncensored_models."""

    def test_default_settings_has_allow_uncensored_false(self, client):
        resp = client.get("/api/settings")
        settings = resp.json()["settings"]
        llm = settings.get("llm", {})
        assert llm.get("allow_uncensored_models") is False

    def test_persist_allow_uncensored_true(self, client):
        resp = client.post(
            "/api/settings",
            json={"settings": {"llm": {"allow_uncensored_models": True}}},
        )
        assert resp.status_code == 200
        settings = resp.json()["settings"]
        assert settings["llm"]["allow_uncensored_models"] is True

        # Verify persistence
        resp2 = client.get("/api/settings")
        assert resp2.json()["settings"]["llm"]["allow_uncensored_models"] is True

        # Reset
        client.post(
            "/api/settings",
            json={"settings": {"llm": {"allow_uncensored_models": False}}},
        )

    def test_persist_allow_uncensored_false(self, client):
        # First enable
        client.post(
            "/api/settings",
            json={"settings": {"llm": {"allow_uncensored_models": True}}},
        )
        # Then disable
        resp = client.post(
            "/api/settings",
            json={"settings": {"llm": {"allow_uncensored_models": False}}},
        )
        assert resp.status_code == 200
        settings = resp.json()["settings"]
        assert settings["llm"]["allow_uncensored_models"] is False

    def test_backward_compat_missing_field(self, client):
        """Old settings without allow_uncensored_models should default to False."""
        from app.services.settings_service import get_settings_service

        svc = get_settings_service()
        assert svc.allow_uncensored_models() is False


class TestUncensoredModelEligibility:
    """Model eligibility based on uncensored toggle."""

    def test_resolve_model_blocks_uncensored_by_default(self):
        from app.services.llm_service import resolve_model
        from app.utils.constants import LLM_FALLBACK_MODEL

        result = resolve_model(
            "general",
            settings_override="llama3-uncensored:8b",
            allow_uncensored=False,
        )
        assert result == LLM_FALLBACK_MODEL

    def test_resolve_model_allows_uncensored_when_enabled(self):
        from app.services.llm_service import resolve_model

        result = resolve_model(
            "general",
            settings_override="llama3-uncensored:8b",
            allow_uncensored=True,
        )
        assert result == "llama3-uncensored:8b"

    def test_resolve_model_passes_normal_model(self):
        from app.services.llm_service import resolve_model

        result = resolve_model(
            "general",
            settings_override="llama3.2:latest",
            allow_uncensored=False,
        )
        assert result == "llama3.2:latest"

    def test_is_abliterated_model_detects_tags(self):
        from app.services.llm_service import is_abliterated_model

        assert (
            is_abliterated_model("dolphin-llama3:8b") is False
        )  # dolphin is in quality_flags but not ABLITERATED_MODEL_TAGS
        assert is_abliterated_model("some-model-abliterated:7b") is True
        assert is_abliterated_model("llama3-uncensored:8b") is True
        assert is_abliterated_model("llama3.2:latest") is False
