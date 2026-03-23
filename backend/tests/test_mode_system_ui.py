"""Tests for Mode System UI – Phase 3.

Covers:
- GET /api/resident/status contains mode field
- PATCH /api/resident/mode with valid mode returns 200
- PATCH /api/resident/mode with invalid mode returns 422
- GET /api/resident/pending-actions returns list (may be empty)
- POST /api/resident/pending-actions/{id}/approve returns 200 or 404
- GET /api/resident/agent-memory/search?q=test returns results structure
- GET /api/resident/agent-memory/search?q=ab returns 400
- GET /api/resident/mode-history returns list
"""

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim ────────────────────────────────────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


def _set_mode(mode: str):
    from app.services.settings_service import get_settings_service

    get_settings_service().update({"resident_mode": mode})


# ── Task 1: Mode Switcher – status and mode field ────────────────────────────


class TestModeStatusField:
    def test_status_endpoint_reachable(self, client):
        resp = client.get("/api/resident/status")
        assert resp.status_code == 200

    def test_status_endpoint_has_resident_mode(self, client):
        _set_mode("advisor")
        resp = client.get("/api/resident/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert "resident_mode" in data

    def test_mode_endpoint_returns_current_mode(self, client):
        _set_mode("observer")
        resp = client.get("/api/resident/mode")
        assert resp.status_code == 200
        data = resp.json()
        assert "mode" in data
        assert data["mode"] == "observer"


# ── Task 1: PATCH /resident/mode ─────────────────────────────────────────────


class TestSetMode:
    def test_patch_mode_observer_returns_200(self, client):
        resp = client.patch("/api/resident/mode", json={"mode": "observer"})
        assert resp.status_code == 200
        assert resp.json()["mode"] == "observer"

    def test_patch_mode_advisor_returns_200(self, client):
        resp = client.patch("/api/resident/mode", json={"mode": "advisor"})
        assert resp.status_code == 200
        assert resp.json()["mode"] == "advisor"

    def test_patch_mode_autonomous_returns_200(self, client):
        resp = client.patch("/api/resident/mode", json={"mode": "autonomous"})
        assert resp.status_code == 200
        assert resp.json()["mode"] == "autonomous"

    def test_patch_mode_invalid_returns_422(self, client):
        resp = client.patch("/api/resident/mode", json={"mode": "turbo"})
        assert resp.status_code == 422

    def test_patch_mode_empty_returns_422(self, client):
        resp = client.patch("/api/resident/mode", json={"mode": ""})
        assert resp.status_code == 422

    def test_patch_mode_records_audit_history(self, client):
        from app.services.mode_audit_service import get_mode_audit_service

        _set_mode("observer")
        client.patch("/api/resident/mode", json={"mode": "advisor"})
        history = get_mode_audit_service().get_history(limit=5)
        assert len(history) > 0
        last = history[-1]
        assert last["to_mode"] == "advisor"
        assert last["from_mode"] == "observer"


# ── Task 2: Pending Actions ───────────────────────────────────────────────────


class TestPendingActions:
    def test_get_pending_actions_returns_list(self, client):
        resp = client.get("/api/resident/pending-actions")
        assert resp.status_code == 200
        data = resp.json()
        assert "actions" in data
        assert "count" in data
        assert isinstance(data["actions"], list)

    def test_get_pending_actions_empty_initially(self, client):
        from app.services.resident_agent import get_resident_agent

        agent = get_resident_agent()
        agent._pending_actions.clear()
        resp = client.get("/api/resident/pending-actions")
        assert resp.status_code == 200
        assert resp.json()["count"] == 0

    def test_approve_nonexistent_action_returns_404(self, client):
        resp = client.post("/api/resident/pending-actions/nonexistent-id/approve")
        assert resp.status_code == 404

    def test_reject_nonexistent_action_returns_404(self, client):
        resp = client.post("/api/resident/pending-actions/nonexistent-id/reject")
        assert resp.status_code == 404

    def test_add_and_approve_pending_action(self, client):
        from app.services.resident_agent import get_resident_agent

        agent = get_resident_agent()
        agent._pending_actions.clear()
        # Add a pending action directly
        action = agent.add_pending_action(
            action_type="system_health",
            description="Check system health",
        )
        action_id = action["id"]

        # Verify it appears in the list
        resp = client.get("/api/resident/pending-actions")
        assert resp.status_code == 200
        assert resp.json()["count"] == 1

        # Approve it
        resp = client.post(f"/api/resident/pending-actions/{action_id}/approve")
        assert resp.status_code == 200
        assert resp.json()["status"] == "approved"

        # After approval it no longer appears as pending
        resp = client.get("/api/resident/pending-actions")
        assert resp.json()["count"] == 0

    def test_add_and_reject_pending_action(self, client):
        from app.services.resident_agent import get_resident_agent

        agent = get_resident_agent()
        agent._pending_actions.clear()
        action = agent.add_pending_action(
            action_type="kb_search",
            description="Search KB",
        )
        action_id = action["id"]

        resp = client.post(f"/api/resident/pending-actions/{action_id}/reject")
        assert resp.status_code == 200
        assert resp.json()["status"] == "rejected"


# ── Task 3: Agent Memory Search ───────────────────────────────────────────────


class TestAgentMemorySearch:
    def test_search_query_too_short_returns_400(self, client):
        resp = client.get("/api/resident/agent-memory/search?q=ab")
        assert resp.status_code == 400

    def test_search_missing_query_returns_422(self, client):
        resp = client.get("/api/resident/agent-memory/search")
        assert resp.status_code == 422

    def test_search_valid_query_returns_structure(self, client):
        # Mock memory service to avoid actual ChromaDB call
        mock_record = MagicMock()
        mock_record.id = "mem-1"
        mock_record.text = "test memory content"
        mock_record.tags = ["resident", "test"]
        mock_record.created_at = "2024-01-01T00:00:00Z"

        with patch("app.services.memory_service.get_memory_service") as mock_get_mem:
            mock_mem = MagicMock()
            mock_mem.search_memory = AsyncMock(return_value=[mock_record])
            mock_get_mem.return_value = mock_mem

            resp = client.get("/api/resident/agent-memory/search?q=test&limit=5")

        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert "count" in data
        assert "query" in data
        assert data["query"] == "test"
        assert isinstance(data["results"], list)

    def test_search_result_has_relevance_score(self, client):
        mock_record = MagicMock()
        mock_record.id = "mem-2"
        mock_record.text = "another memory"
        mock_record.tags = []
        mock_record.created_at = None

        with patch("app.services.memory_service.get_memory_service") as mock_get_mem:
            mock_mem = MagicMock()
            mock_mem.search_memory = AsyncMock(return_value=[mock_record])
            mock_get_mem.return_value = mock_mem

            resp = client.get("/api/resident/agent-memory/search?q=memory")

        assert resp.status_code == 200
        results = resp.json()["results"]
        assert len(results) == 1
        assert "relevance_score" in results[0]
        assert 0.0 <= results[0]["relevance_score"] <= 1.0


# ── Task 4: Mode History ──────────────────────────────────────────────────────


class TestModeHistory:
    def test_mode_history_returns_list(self, client):
        resp = client.get("/api/resident/mode-history")
        assert resp.status_code == 200
        data = resp.json()
        assert "history" in data
        assert "count" in data
        assert isinstance(data["history"], list)

    def test_mode_history_records_on_patch(self, client):
        from app.services.mode_audit_service import get_mode_audit_service

        # Clear history first
        svc = get_mode_audit_service()
        svc._history.clear()

        _set_mode("observer")
        client.patch("/api/resident/mode", json={"mode": "autonomous"})

        resp = client.get("/api/resident/mode-history?limit=5")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] >= 1
        last = data["history"][-1]
        assert last["from_mode"] == "observer"
        assert last["to_mode"] == "autonomous"

    def test_mode_history_limit_param(self, client):
        resp = client.get("/api/resident/mode-history?limit=5")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["history"]) <= 5

    def test_mode_history_record_structure(self, client):
        from app.services.mode_audit_service import get_mode_audit_service

        svc = get_mode_audit_service()
        svc._history.clear()
        _set_mode("advisor")
        client.patch("/api/resident/mode", json={"mode": "observer"})

        resp = client.get("/api/resident/mode-history?limit=1")
        history = resp.json()["history"]
        if history:
            record = history[-1]
            assert "from_mode" in record
            assert "to_mode" in record
            assert "changed_by" in record
            assert "timestamp" in record

    def test_mode_pause_records_history(self, client):
        from app.services.mode_audit_service import get_mode_audit_service

        svc = get_mode_audit_service()
        svc._history.clear()
        _set_mode("autonomous")
        client.post("/api/resident/mode/pause")

        history = svc.get_history(limit=5)
        assert len(history) >= 1
        assert history[-1]["to_mode"] == "advisor"
