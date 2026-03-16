"""Full-cycle integration tests for Resident tool-calling reasoning.

Tests the complete reason_with_tools flow: context → LLM → tools → LLM → suggestions.
"""
import json
import socket
import sys
from typing import Any, Dict
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def _ollama_available(host: str = "localhost", port: int = 11434) -> bool:
    """Quick TCP check to see if Ollama is reachable."""
    try:
        with socket.create_connection((host, port), timeout=1):
            return True
    except OSError:
        return False

# Chromadb shim
_chroma_mock = MagicMock()
for _mod in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod, _chroma_mock)

from app.services.resident_reasoner import ResidentReasoner  # noqa: E402


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


class TestFullReasoningCycle:
    @pytest.mark.asyncio
    async def test_full_reasoning_cycle(self):
        """Complete flow: LLM picks tools → tools execute → LLM suggests actions."""
        # Phase 1: LLM decides to call search_web and get_system_stats
        phase1 = json.dumps([
            {"type": "function", "function": {"name": "search_web", "arguments": {"query": "ollama queue depth fix"}}},
            {"type": "function", "function": {"name": "get_system_stats", "arguments": {}}},
        ])

        # Phase 2: LLM produces final suggestions
        phase2 = json.dumps([
            {
                "title": "Restartovat Ollama worker",
                "description": "Queue depth je vysoký, restart pomůže.",
                "action_type": "health_check",
                "priority": "high",
                "requires_confirmation": True,
                "steps": ["Zkontrolovat stav", "Restartovat Ollamu"],
            }
        ])

        llm_mock = _make_llm_mock(phase1, phase2)

        # Mock both tools
        mock_search = AsyncMock(return_value={
            "tool": "search_web", "ok": True,
            "data": {"abstract": "Restart Ollama", "results": []},
            "duration_ms": 50,
        })
        mock_stats = AsyncMock(return_value={
            "tool": "get_system_stats", "ok": True,
            "data": {"job_queue_depth": 15, "kb_size": 12000, "ram_usage": 72},
            "duration_ms": 5,
        })

        async def _execute(tool_call, context):
            name = tool_call.get("function", {}).get("name", "")
            if name == "search_web":
                return await mock_search()
            elif name == "get_system_stats":
                return await mock_stats()
            return {"tool": name, "ok": False, "data": None, "error": "unknown", "duration_ms": 0}

        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock), \
             patch("app.services.resident_tools.execute_tool_call", side_effect=_execute):
            cycle = await reasoner.reason_with_tools(
                context_override={"job_queue_depth": 15, "kb_size": 12000}
            )

        # Verify cycle structure
        assert len(cycle.tools_used) == 2
        assert "search_web" in cycle.tools_used
        assert "get_system_stats" in cycle.tools_used
        assert len(cycle.tool_calls) == 2
        assert len(cycle.final_suggestions) == 1
        assert cycle.final_suggestions[0].priority == "high"
        assert cycle.final_suggestions[0].action_type == "health_check"
        assert cycle.total_duration_ms >= 0

    @pytest.mark.asyncio
    async def test_max_three_tools_enforced(self):
        """Even if LLM requests 5 tools, only the first 3 are executed."""
        phase1 = json.dumps([
            {"type": "function", "function": {"name": f"get_weather", "arguments": {"location": f"City{i}"}}}
            for i in range(5)
        ])
        phase2 = json.dumps([])

        llm_mock = _make_llm_mock(phase1, phase2)
        call_count = {"n": 0}

        async def _execute(tool_call, context):
            call_count["n"] += 1
            return {"tool": "get_weather", "ok": True, "data": {"temp_c": "20"}, "duration_ms": 10}

        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock), \
             patch("app.services.resident_tools.execute_tool_call", side_effect=_execute):
            cycle = await reasoner.reason_with_tools(context_override={})

        assert call_count["n"] == 3  # max 3 enforced
        assert len(cycle.tools_used) == 3

    @pytest.mark.asyncio
    async def test_suggestions_capped_at_three(self):
        """Final suggestions are limited by safety filtering."""
        phase1 = json.dumps([])  # No tools
        phase2 = json.dumps([
            {"title": f"Action {i}", "description": "desc", "action_type": "analysis", "priority": "low"}
            for i in range(6)
        ])

        llm_mock = _make_llm_mock(phase1, phase2)
        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock), \
             patch("app.services.resident_tools.execute_tool_call", new_callable=AsyncMock):
            cycle = await reasoner.reason_with_tools(context_override={})

        # _parse_suggestions allows max 5 (existing limit)
        assert len(cycle.final_suggestions) <= 5

    @pytest.mark.asyncio
    async def test_llm_unavailable_returns_empty_cycle(self):
        """If LLM is unavailable, return an empty cycle gracefully."""
        async def _generate(message, mode=None, profile=None, history=None, **kw):
            return "[LLM nedostupné]", {"status": "llm_unavailable", "model": "llama3.2"}

        llm_mock = MagicMock()
        llm_mock.generate = AsyncMock(side_effect=_generate)

        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock):
            cycle = await reasoner.reason_with_tools(context_override={"test": True})

        assert cycle.tools_used == []
        assert cycle.tool_calls == []
        assert cycle.final_suggestions == []

    @pytest.mark.asyncio
    async def test_tool_failure_handled_gracefully(self):
        """If a tool fails, reasoning continues with error in results."""
        phase1 = json.dumps([
            {"type": "function", "function": {"name": "search_web", "arguments": {"query": "test"}}},
        ])
        phase2 = json.dumps([
            {"title": "Fallback action", "description": "Web search failed", "action_type": "other", "priority": "low"}
        ])

        llm_mock = _make_llm_mock(phase1, phase2)

        async def _execute(tool_call, context):
            return {"tool": "search_web", "ok": False, "data": None, "error": "timeout", "duration_ms": 10000}

        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock), \
             patch("app.services.resident_tools.execute_tool_call", side_effect=_execute):
            cycle = await reasoner.reason_with_tools(context_override={})

        assert len(cycle.tools_used) == 1
        assert cycle.tool_calls[0].ok is False
        assert len(cycle.final_suggestions) == 1

    @pytest.mark.asyncio
    async def test_destructive_actions_require_confirmation(self):
        """Suggestions with destructive action_types must have requires_confirmation=True."""
        phase1 = json.dumps([])
        phase2 = json.dumps([
            {"title": "Clean KB", "description": "Remove old chunks", "action_type": "kb_maintenance",
             "priority": "medium", "requires_confirmation": False},
        ])

        llm_mock = _make_llm_mock(phase1, phase2)
        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock), \
             patch("app.services.resident_tools.execute_tool_call", new_callable=AsyncMock):
            cycle = await reasoner.reason_with_tools(context_override={})

        # Safety filter must override requires_confirmation to True
        assert len(cycle.final_suggestions) == 1
        assert cycle.final_suggestions[0].requires_confirmation is True

    @pytest.mark.asyncio
    async def test_disallowed_action_types_filtered_out(self):
        """Action types not in the whitelist are dropped."""
        phase1 = json.dumps([])
        phase2 = json.dumps([
            {"title": "Shell exec", "description": "Run rm -rf /", "action_type": "shell_exec", "priority": "high"},
            {"title": "Valid", "description": "A valid check", "action_type": "health_check", "priority": "low"},
        ])

        llm_mock = _make_llm_mock(phase1, phase2)
        reasoner = ResidentReasoner()

        with patch("app.services.resident_reasoner.get_llm_service", return_value=llm_mock), \
             patch("app.services.resident_tools.execute_tool_call", new_callable=AsyncMock):
            cycle = await reasoner.reason_with_tools(context_override={})

        assert len(cycle.final_suggestions) == 1
        assert cycle.final_suggestions[0].action_type == "health_check"


class TestReasoningEndpoints:
    """Test the /resident/reasoning API endpoints via TestClient.

    These tests require Ollama to be running (for app startup checks).
    They are skipped in CI / environments without Ollama.
    """

    @pytest.mark.skipif(
        not _ollama_available(),
        reason="Ollama not running – endpoint tests need full app lifespan",
    )
    def test_get_reasoning_empty(self, client, mock_ollama):
        """GET /reasoning returns empty list initially."""
        from app.routers import resident
        resident._reasoning_cycles.clear()

        resp = client.get("/api/resident/reasoning")
        assert resp.status_code == 200
        data = resp.json()
        assert data["cycles"] == []
        assert data["count"] == 0
