"""Integration tests – Resident Agent brain orchestrator.

Covers:
- resident_mode switching (observer/advisor/autonomous)
- observer mode generates no suggestions
- advisor mode: reasoner returns suggestions, accept creates job
- mission creation with mocked LLM plan
- mission step advancement and status tracking
- reflection generation after job completion
- safety: destructive actions enforce requires_confirmation
"""
import json
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim ──────────────────────────────────────────────────────────────
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


def _reset_agent():
    from app.services.resident_agent import get_resident_agent
    agent = get_resident_agent()
    agent._state.is_running = False
    agent._state.started_at = None
    agent._state.last_heartbeat = None
    agent._state.heartbeat_status = "healthy"
    agent._state.alerts = []
    agent._start_time = None
    agent._suggestions = []
    agent._reflections = []
    return agent


def _set_mode(mode: str):
    from app.services.settings_service import get_settings_service
    get_settings_service().update({"resident_mode": mode})


# ── Mode switching tests ─────────────────────────────────────────────────────

class TestResidentMode:
    """Test autonomy mode CRUD."""

    def test_get_mode_returns_default(self, client):
        resp = client.get("/api/resident/mode")
        assert resp.status_code == 200
        assert resp.json()["mode"] in ("observer", "advisor", "autonomous")

    def test_set_mode_to_observer(self, client):
        resp = client.patch("/api/resident/mode", json={"mode": "observer"})
        assert resp.status_code == 200
        assert resp.json()["mode"] == "observer"

        resp = client.get("/api/resident/mode")
        assert resp.json()["mode"] == "observer"

    def test_set_mode_to_autonomous(self, client):
        resp = client.patch("/api/resident/mode", json={"mode": "autonomous"})
        assert resp.status_code == 200
        assert resp.json()["mode"] == "autonomous"

    def test_set_mode_invalid_returns_422(self, client):
        resp = client.patch("/api/resident/mode", json={"mode": "turbo"})
        assert resp.status_code == 422

    def test_dashboard_includes_mode(self, client):
        _set_mode("advisor")
        data = client.get("/api/resident/dashboard").json()
        assert "resident_mode" in data
        assert data["resident_mode"] == "advisor"


# ── Suggestions tests ────────────────────────────────────────────────────────

class TestResidentSuggestions:
    """Test suggestion generation and acceptance."""

    def test_suggestions_empty_initially(self, client):
        _reset_agent()
        resp = client.get("/api/resident/suggestions")
        assert resp.status_code == 200
        assert resp.json()["suggestions"] == []
        assert resp.json()["count"] == 0

    def test_observer_mode_no_suggestions(self, client):
        """In observer mode, the reasoner should not generate suggestions."""
        from app.services.resident_reasoner import get_resident_reasoner
        import asyncio

        _set_mode("observer")
        reasoner = get_resident_reasoner()
        result = asyncio.get_event_loop().run_until_complete(
            reasoner.generate_suggestions("observer")
        )
        assert result is None

    def test_advisor_mode_generates_suggestions_with_mock_llm(self, client):
        """With mocked LLM, reasoner should produce valid SuggestedActions."""
        from app.services.resident_reasoner import get_resident_reasoner
        import asyncio

        _set_mode("advisor")

        mock_llm_response = json.dumps([{
            "id": "a1",
            "title": "Vyčistit staré joby",
            "description": "Smazat dokončené joby starší 30 dní.",
            "action_type": "job_cleanup",
            "priority": "low",
            "requires_confirmation": False,
            "estimated_cost": "žádný LLM dotaz",
            "steps": ["Najít staré joby", "Smazat"]
        }])

        with patch(
            "app.services.resident_reasoner.get_llm_service"
        ) as mock_get_llm:
            mock_llm = MagicMock()
            mock_llm.generate = AsyncMock(return_value=(mock_llm_response, {"provider": "mock"}))
            mock_get_llm.return_value = mock_llm

            reasoner = get_resident_reasoner()
            result = asyncio.get_event_loop().run_until_complete(
                reasoner.generate_suggestions("advisor")
            )

        assert result is not None
        assert len(result.actions) == 1
        assert result.actions[0].title == "Vyčistit staré joby"
        assert result.actions[0].action_type == "job_cleanup"
        # job_cleanup is destructive → requires_confirmation must be enforced
        assert result.actions[0].requires_confirmation is True

    def test_accept_suggestion_creates_job(self, client):
        """Accepting a suggestion action should create a queued job."""
        agent = _reset_agent()
        _set_mode("advisor")

        # Manually inject a suggestion
        from app.models.resident_models import ResidentSuggestion, SuggestedAction
        suggestion = ResidentSuggestion(
            mode="advisor",
            actions=[SuggestedAction(
                id="test-a1",
                title="Test akce",
                description="Testovací akce",
                action_type="health_check",
                priority="low",
                requires_confirmation=False,
                steps=["krok 1"],
            )],
            context_summary="test kontext",
        )
        agent._suggestions.append(suggestion)

        resp = client.post(
            f"/api/resident/suggestions/{suggestion.id}/accept?action_id=test-a1"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "queued"
        assert "job_id" in data

        # Verify job exists
        job_resp = client.get("/api/jobs")
        job_ids = [j["id"] for j in job_resp.json()["jobs"]]
        assert data["job_id"] in job_ids

    def test_accept_suggestion_in_observer_mode_rejected(self, client):
        _set_mode("observer")
        resp = client.post(
            "/api/resident/suggestions/fake-id/accept?action_id=fake-action"
        )
        assert resp.status_code == 400

    def test_accept_nonexistent_suggestion_returns_404(self, client):
        _reset_agent()
        _set_mode("advisor")
        resp = client.post(
            "/api/resident/suggestions/nonexistent/accept?action_id=fake"
        )
        assert resp.status_code == 404


# ── Mission tests ────────────────────────────────────────────────────────────

class TestResidentMissions:
    """Test mission creation and listing."""

    def test_create_mission_with_mock_llm(self, client):
        """Creating a mission should call LLM planner and create a job."""
        mock_plan_response = json.dumps({
            "goal": "Analyzuj KB",
            "steps": [
                {"title": "Vyhledat v KB", "description": "Prohledat KB"},
                {"title": "Shrnout výsledky", "description": "Vytvořit shrnutí"},
            ]
        })

        with patch(
            "app.services.resident_reasoner.get_llm_service"
        ) as mock_get_llm:
            mock_llm = MagicMock()
            mock_llm.generate = AsyncMock(return_value=(mock_plan_response, {"provider": "mock"}))
            mock_get_llm.return_value = mock_llm

            resp = client.post("/api/resident/missions", json={
                "goal": "Analyzuj KB k tématu Python",
            })

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "planned"
        assert data["steps_count"] == 2
        assert "mission_id" in data

    def test_list_missions(self, client):
        """Mission listing should include recently created missions."""
        resp = client.get("/api/resident/missions")
        assert resp.status_code == 200
        data = resp.json()
        assert "missions" in data
        assert isinstance(data["missions"], list)

    def test_mission_detail(self, client):
        """Getting a specific mission should return step details."""
        mock_plan_response = json.dumps({
            "goal": "Test detail",
            "steps": [{"title": "Krok 1", "description": "Popis"}]
        })

        with patch(
            "app.services.resident_reasoner.get_llm_service"
        ) as mock_get_llm:
            mock_llm = MagicMock()
            mock_llm.generate = AsyncMock(return_value=(mock_plan_response, {"provider": "mock"}))
            mock_get_llm.return_value = mock_llm

            create_resp = client.post("/api/resident/missions", json={"goal": "Test detail"})
            mission_id = create_resp.json()["mission_id"]

        resp = client.get(f"/api/resident/missions/{mission_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["goal"] == "Test detail"
        assert len(data["steps"]) == 1
        assert data["steps"][0]["title"] == "Krok 1"
        assert data["status"] == "planned"

    def test_mission_detail_not_found(self, client):
        resp = client.get("/api/resident/missions/nonexistent-id")
        assert resp.status_code == 404

    def test_mission_advancement(self, client):
        """Test that _advance_mission progresses a mission by one step."""
        from app.services.resident_agent import get_resident_agent
        from app.services.job_service import get_job_service
        import asyncio

        agent = _reset_agent()
        job_svc = get_job_service()

        # Create a mission job directly
        plan = {
            "goal": "Test advance",
            "steps": [
                {"title": "Krok 1", "description": "Popis 1", "status": "pending"},
                {"title": "Krok 2", "description": "Popis 2", "status": "pending"},
            ],
            "current_step": 0,
            "status": "planned",
        }
        mission_job = job_svc.create_job(
            type="resident_mission",
            title="Test advance",
            payload={"plan": plan},
        )

        # Advance one step (mock reflection to avoid LLM call)
        with patch.object(agent, "_generate_reflection_for_job", new_callable=AsyncMock):
            asyncio.get_event_loop().run_until_complete(
                agent._advance_mission(mission_job, job_svc)
            )

        # Reload and check
        updated = job_svc.get_job(mission_job.id)
        updated_plan = updated.payload["plan"]
        assert updated_plan["current_step"] == 1
        assert updated_plan["status"] == "in_progress"
        assert updated.status == "running"


# ── Reflections tests ────────────────────────────────────────────────────────

class TestResidentReflections:
    """Test reflection generation and listing."""

    def test_reflections_empty_initially(self, client):
        _reset_agent()
        resp = client.get("/api/resident/reflections")
        assert resp.status_code == 200
        assert resp.json()["reflections"] == []

    def test_reflection_generation_with_mock_llm(self, client):
        """Reflection generation should parse LLM response into structured data."""
        from app.services.resident_reasoner import get_resident_reasoner
        import asyncio

        mock_reflection = json.dumps({
            "points": ["Úkol dokončen úspěšně", "KB obsahuje relevantní data"],
            "useful": True,
            "recommendation": "Příště filtrovat podle data",
        })

        with patch(
            "app.services.resident_reasoner.get_llm_service"
        ) as mock_get_llm:
            mock_llm = MagicMock()
            mock_llm.generate = AsyncMock(return_value=(mock_reflection, {"provider": "mock"}))
            mock_get_llm.return_value = mock_llm

            reasoner = get_resident_reasoner()
            result = asyncio.get_event_loop().run_until_complete(
                reasoner.generate_reflection(
                    job_id="test-job-1",
                    job_type="resident_task",
                    goal="Test reflexe",
                    status="succeeded",
                )
            )

        assert result is not None
        assert len(result.points) == 2
        assert result.useful is True
        assert "filtrovat" in result.recommendation


# ── Safety tests ─────────────────────────────────────────────────────────────

class TestResidentSafety:
    """Test that safety guardrails work properly."""

    def test_destructive_action_types_enforce_confirmation(self):
        """kb_maintenance and job_cleanup must have requires_confirmation=True."""
        from app.services.resident_reasoner import get_resident_reasoner
        import asyncio

        mock_response = json.dumps([
            {
                "id": "d1",
                "title": "Smazat KB duplicity",
                "description": "Smazat duplicitní chunky v KB",
                "action_type": "kb_maintenance",
                "priority": "medium",
                "requires_confirmation": False,  # LLM says false, but we enforce true
                "estimated_cost": "žádný",
                "steps": ["Najít duplicity", "Smazat"],
            },
            {
                "id": "d2",
                "title": "Cleanup jobů",
                "description": "Vyčistit staré joby",
                "action_type": "job_cleanup",
                "priority": "low",
                "requires_confirmation": False,
                "estimated_cost": "žádný",
                "steps": ["Smazat staré joby"],
            },
        ])

        with patch(
            "app.services.resident_reasoner.get_llm_service"
        ) as mock_get_llm:
            mock_llm = MagicMock()
            mock_llm.generate = AsyncMock(return_value=(mock_response, {"provider": "mock"}))
            mock_get_llm.return_value = mock_llm

            reasoner = get_resident_reasoner()
            result = asyncio.get_event_loop().run_until_complete(
                reasoner.generate_suggestions("advisor")
            )

        assert result is not None
        for action in result.actions:
            assert action.requires_confirmation is True, (
                f"Action {action.action_type} should enforce requires_confirmation=True"
            )

    def test_disallowed_action_type_filtered(self):
        """Action types not in the whitelist should be filtered out."""
        from app.services.resident_reasoner import get_resident_reasoner
        import asyncio

        mock_response = json.dumps([
            {
                "id": "x1",
                "title": "Shell command",
                "description": "Execute rm -rf /",
                "action_type": "shell_execute",
                "priority": "high",
                "requires_confirmation": False,
                "estimated_cost": "dangerous",
                "steps": ["rm -rf /"],
            },
        ])

        with patch(
            "app.services.resident_reasoner.get_llm_service"
        ) as mock_get_llm:
            mock_llm = MagicMock()
            mock_llm.generate = AsyncMock(return_value=(mock_response, {"provider": "mock"}))
            mock_get_llm.return_value = mock_llm

            reasoner = get_resident_reasoner()
            result = asyncio.get_event_loop().run_until_complete(
                reasoner.generate_suggestions("advisor")
            )

        # Should be filtered out → None or empty actions
        assert result is None or len(result.actions) == 0

    def test_dashboard_has_new_orchestrator_fields(self, client):
        """Dashboard response must include new brain orchestrator fields."""
        data = client.get("/api/resident/dashboard").json()
        assert "resident_mode" in data
        assert "suggestions_count" in data
        assert "missions" in data
        assert "reflections_count" in data
        assert isinstance(data["missions"], list)
