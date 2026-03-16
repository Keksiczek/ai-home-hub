"""Integration tests for Resident Agent scenarios.

UKOL 2 – Autonomous mode safety tests.
UKOL 3 – E2E reasoning scenarios.

How to test manually:
  1. Start the app, switch to Resident tab.
  2. Set mode to Autonomous via the dropdown.
  3. Trigger Reasoning, verify only safe actions auto-execute.
"""
import json
import sys
from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Chromadb shim
_chroma_mock = MagicMock()
for _mod in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod, _chroma_mock)

from app.models.resident_models import (  # noqa: E402
    ResidentSuggestion,
    SuggestedAction,
)
from app.services.resident_agent import ResidentAgent  # noqa: E402
from app.services.resident_reasoner import ResidentReasoner  # noqa: E402


# ── Helpers ──────────────────────────────────────────────────


def _make_suggestion(actions: List[Dict[str, Any]], mode: str = "autonomous") -> ResidentSuggestion:
    """Build a ResidentSuggestion from raw action dicts."""
    parsed = []
    for a in actions:
        parsed.append(SuggestedAction(
            title=a["title"],
            description=a.get("description", ""),
            action_type=a.get("action_type", "other"),
            priority=a.get("priority", "low"),
            requires_confirmation=a.get("requires_confirmation", False),
        ))
    return ResidentSuggestion(mode=mode, actions=parsed)


def _make_llm_mock(phase1_reply: str, phase2_reply: str):
    """Build a mock LLM service that returns different replies per call."""
    call_count = {"n": 0}

    async def _generate(message, mode=None, profile=None, history=None, **kw):
        call_count["n"] += 1
        if call_count["n"] == 1:
            return phase1_reply, {"model": "llama3.2"}
        return phase2_reply, {"model": "llama3.2"}

    mock = MagicMock()
    mock.generate = AsyncMock(side_effect=_generate)
    return mock


# ═══════════════════════════════════════════════════════════════
# UKOL 2 – Autonomous mode safeties
# ═══════════════════════════════════════════════════════════════


class TestAutonomousModeSafety:
    """Verify that autonomous mode only auto-executes non-destructive actions."""

    @pytest.mark.asyncio
    async def test_auto_execute_skips_requires_confirmation(self):
        """Actions with requires_confirmation=True must NOT be auto-executed."""
        agent = ResidentAgent.__new__(ResidentAgent)
        agent._suggestions = []
        agent._reflections = []

        suggestion = _make_suggestion([
            {"title": "Safe action", "action_type": "analysis", "requires_confirmation": False},
            {"title": "Dangerous KB cleanup", "action_type": "kb_maintenance", "requires_confirmation": True},
            {"title": "Dangerous job cleanup", "action_type": "job_cleanup", "requires_confirmation": True},
        ])

        mock_job_svc = MagicMock()
        mock_job = MagicMock()
        mock_job.id = "job-auto-1"
        mock_job_svc.create_job.return_value = mock_job

        with patch("app.services.job_service.get_job_service", return_value=mock_job_svc):
            await agent._auto_execute_safe_actions(suggestion)

        # Only 1 job should be created (the safe action)
        assert mock_job_svc.create_job.call_count == 1
        call_args = mock_job_svc.create_job.call_args
        assert "[Auto]" in call_args.kwargs.get("title", call_args[1].get("title", ""))
        # The safe action ID should be in executed list
        assert len(suggestion.executed_action_ids) == 1

    @pytest.mark.asyncio
    async def test_auto_execute_tags_payload(self):
        """Auto-executed jobs must have auto_executed=True in payload."""
        agent = ResidentAgent.__new__(ResidentAgent)
        agent._suggestions = []
        agent._reflections = []

        suggestion = _make_suggestion([
            {"title": "Health check", "action_type": "health_check", "requires_confirmation": False},
        ])

        mock_job_svc = MagicMock()
        mock_job = MagicMock()
        mock_job.id = "job-auto-2"
        mock_job_svc.create_job.return_value = mock_job

        with patch("app.services.job_service.get_job_service", return_value=mock_job_svc):
            await agent._auto_execute_safe_actions(suggestion)

        call_kwargs = mock_job_svc.create_job.call_args
        payload = call_kwargs.kwargs.get("payload", call_kwargs[1].get("payload", {}))
        assert payload.get("auto_executed") is True

    def test_destructive_types_always_require_confirmation(self):
        """Reasoner safety filter must enforce requires_confirmation for destructive types."""
        reasoner = ResidentReasoner()
        reply = json.dumps([
            {"title": "Cleanup KB", "description": "x", "action_type": "kb_maintenance",
             "priority": "medium", "requires_confirmation": False},
            {"title": "Cleanup jobs", "description": "y", "action_type": "job_cleanup",
             "priority": "low", "requires_confirmation": False},
        ])
        actions = reasoner._parse_suggestions(reply)
        for a in actions:
            assert a.requires_confirmation is True, (
                f"Action type '{a.action_type}' must require confirmation"
            )

    def test_disallowed_action_types_rejected(self):
        """Action types outside the whitelist are dropped entirely."""
        reasoner = ResidentReasoner()
        reply = json.dumps([
            {"title": "Run shell", "description": "rm -rf", "action_type": "shell_exec", "priority": "high"},
            {"title": "Good one", "description": "ok", "action_type": "health_check", "priority": "low"},
        ])
        actions = reasoner._parse_suggestions(reply)
        assert len(actions) == 1
        assert actions[0].action_type == "health_check"


# ═══════════════════════════════════════════════════════════════
# UKOL 3 – E2E integration scenarios
# ═══════════════════════════════════════════════════════════════


class TestScenarioKBPlusResidentSuggestion:
    """Scenario: KB has documents → Resident reasoning → suggests analysis/kb_maintenance.

    Manual test:
      1. Upload 2-3 docs to KB.
      2. Go to Resident Dashboard, click "Spustit reasoning".
      3. Verify suggestions include an analysis or kb_maintenance action.
    """

    @pytest.mark.asyncio
    async def test_kb_context_yields_suggestions(self):
        # Phase 1: LLM uses kb_search tool
        phase1 = json.dumps([
            {"type": "function", "function": {"name": "kb_search", "arguments": {"query": "existing documents"}}},
            {"type": "function", "function": {"name": "get_system_stats", "arguments": {}}},
        ])
        # Phase 2: LLM suggests analysis
        phase2 = json.dumps([
            {"title": "Analyzovat KB dokumenty", "description": "KB má 5000 chunků, navrhuju analýzu pokrytí.",
             "action_type": "analysis", "priority": "medium"},
        ])

        llm_mock = _make_llm_mock(phase1, phase2)

        async def _execute(tool_call, context):
            name = tool_call.get("function", {}).get("name", "")
            if name == "kb_search":
                return {"tool": name, "ok": True, "data": {"documents": [{"title": "CI Guide", "content": "Setup CI pipeline..."}], "count": 1}, "duration_ms": 10}
            elif name == "get_system_stats":
                return {"tool": name, "ok": True, "data": {"kb_size": 5000, "job_queue_depth": 2}, "duration_ms": 5}
            return {"tool": name, "ok": False, "data": None, "error": "unknown", "duration_ms": 0}

        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock), \
             patch("app.services.resident_tools.execute_tool_call", side_effect=_execute):
            cycle = await reasoner.reason_with_tools(context_override={"kb_size": 5000})

        assert "kb_search" in cycle.tools_used
        assert len(cycle.final_suggestions) >= 1
        assert any(s.action_type in ("analysis", "kb_maintenance") for s in cycle.final_suggestions)


class TestScenarioHighQueueResident:
    """Scenario: High queue depth → Resident uses get_system_stats → suggests job_cleanup.

    Manual test:
      1. Create 10+ dummy jobs.
      2. Trigger reasoning.
      3. Verify suggestions include job_cleanup.
    """

    @pytest.mark.asyncio
    async def test_high_queue_triggers_cleanup_suggestion(self):
        phase1 = json.dumps([
            {"type": "function", "function": {"name": "get_system_stats", "arguments": {}}},
            {"type": "function", "function": {"name": "list_jobs", "arguments": {"status": "queued"}}},
        ])
        phase2 = json.dumps([
            {"title": "Vyčistit frontu jobů", "description": "15 jobů ve frontě, doporučuji vyčistit staré.",
             "action_type": "job_cleanup", "priority": "high", "requires_confirmation": True},
        ])

        llm_mock = _make_llm_mock(phase1, phase2)

        async def _execute(tool_call, context):
            name = tool_call.get("function", {}).get("name", "")
            if name == "get_system_stats":
                return {"tool": name, "ok": True, "data": {"job_queue_depth": 15, "kb_size": 1000, "ram_usage": 80}, "duration_ms": 5}
            elif name == "list_jobs":
                return {"tool": name, "ok": True, "data": {"jobs": [{"id": f"j-{i}", "status": "queued", "title": f"Old job {i}"} for i in range(15)], "count": 15}, "duration_ms": 8}
            return {"tool": name, "ok": False, "data": None, "error": "unknown", "duration_ms": 0}

        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock), \
             patch("app.services.resident_tools.execute_tool_call", side_effect=_execute):
            cycle = await reasoner.reason_with_tools(
                context_override={"job_queue_depth": 15, "queued_jobs": 15}
            )

        # Verify tools used
        assert "get_system_stats" in cycle.tools_used or "list_jobs" in cycle.tools_used
        # Verify cleanup suggestion
        assert len(cycle.final_suggestions) >= 1
        assert any(s.action_type == "job_cleanup" for s in cycle.final_suggestions)
        # Verify destructive type has confirmation
        for s in cycle.final_suggestions:
            if s.action_type == "job_cleanup":
                assert s.requires_confirmation is True


class TestScenarioAutonomousLightCleanup:
    """Scenario: Autonomous mode + old jobs → auto-creates cleanup job.

    Manual test:
      1. Set mode to Autonomous.
      2. Have several old succeeded/failed jobs.
      3. Trigger reasoning + wait for auto tick.
      4. Verify cleanup job was created in Jobs list.
      5. Check autonomous logbook shows the action.
    """

    @pytest.mark.asyncio
    async def test_autonomous_creates_safe_job_only(self):
        """In autonomous mode, only non-confirmation actions are auto-executed."""
        agent = ResidentAgent.__new__(ResidentAgent)
        agent._suggestions = []
        agent._reflections = []

        # Two suggestions: one safe (analysis), one destructive (job_cleanup)
        suggestion = _make_suggestion([
            {"title": "Quick health check", "action_type": "health_check",
             "priority": "low", "requires_confirmation": False},
            {"title": "Delete old jobs", "action_type": "job_cleanup",
             "priority": "high", "requires_confirmation": True},
        ])

        created_jobs = []
        mock_job_svc = MagicMock()
        def _create_job(**kwargs):
            mock_job = MagicMock()
            mock_job.id = f"job-{len(created_jobs)}"
            created_jobs.append(kwargs)
            return mock_job
        mock_job_svc.create_job.side_effect = _create_job

        with patch("app.services.job_service.get_job_service", return_value=mock_job_svc):
            await agent._auto_execute_safe_actions(suggestion)

        # Only the safe health check should have been created
        assert len(created_jobs) == 1
        assert "[Auto]" in created_jobs[0]["title"]
        assert created_jobs[0]["payload"]["auto_executed"] is True
        assert created_jobs[0]["payload"]["action_type"] == "health_check"

        # The destructive action should NOT be executed
        assert suggestion.executed_action_ids  # at least one
        # Verify the executed action is the safe one
        safe_action = suggestion.actions[0]
        dangerous_action = suggestion.actions[1]
        assert safe_action.id in suggestion.executed_action_ids
        assert dangerous_action.id not in suggestion.executed_action_ids
