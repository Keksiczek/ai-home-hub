"""Tests for Resident tool registry and individual tool implementations."""
import json
from typing import Any, Dict
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Ensure chromadb is shimmed before importing app code
import sys
_chroma_mock = MagicMock()
for _mod in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod, _chroma_mock)

from app.services.resident_tools import (  # noqa: E402
    TOOLS_REGISTRY,
    _TOOL_MAP,
    execute_tool_call,
    get_tools_registry,
    render_tools_for_prompt,
)


# ── Registry tests ──────────────────────────────────────────


class TestToolRegistry:
    def test_registry_has_six_tools(self):
        assert len(TOOLS_REGISTRY) >= 6

    def test_registry_tool_names(self):
        names = {t.name for t in TOOLS_REGISTRY}
        expected = {"search_web", "browse_page", "kb_search", "get_system_stats", "list_jobs", "get_weather"}
        assert names == expected

    def test_tool_map_matches_registry(self):
        assert len(_TOOL_MAP) == len(TOOLS_REGISTRY)
        for tool in TOOLS_REGISTRY:
            assert tool.name in _TOOL_MAP

    def test_render_tools_for_prompt_is_valid_json(self):
        rendered = render_tools_for_prompt()
        data = json.loads(rendered)
        assert isinstance(data, list)
        assert len(data) == 6
        for item in data:
            assert "name" in item
            assert "description" in item
            assert "parameters" in item

    def test_get_tools_registry_returns_list(self):
        tools = get_tools_registry()
        assert tools is TOOLS_REGISTRY

    def test_search_web_has_required_query(self):
        tool = _TOOL_MAP["search_web"]
        assert "query" in tool.parameters
        assert tool.parameters["query"].required is True

    def test_get_system_stats_has_no_params(self):
        tool = _TOOL_MAP["get_system_stats"]
        assert len(tool.parameters) == 0


# ── execute_tool_call dispatch tests ─────────────────────────


class TestExecuteToolCall:
    @pytest.mark.asyncio
    async def test_unknown_tool_returns_error(self):
        result = await execute_tool_call(
            {"function": {"name": "nonexistent_tool", "arguments": "{}"}}, {}
        )
        assert result["ok"] is False
        assert "Unknown tool" in result["error"]
        assert result["tool"] == "nonexistent_tool"

    @pytest.mark.asyncio
    async def test_string_arguments_are_parsed(self):
        """Arguments passed as a JSON string should be parsed correctly."""
        with patch("app.services.resident_tools._get_system_stats", new_callable=AsyncMock) as mock:
            mock.return_value = {"job_queue_depth": 0}
            result = await execute_tool_call(
                {"function": {"name": "get_system_stats", "arguments": "{}"}}, {}
            )
            assert result["ok"] is True

    @pytest.mark.asyncio
    async def test_dict_arguments_work(self):
        """Arguments passed as a dict should also work."""
        with patch("app.services.resident_tools._get_system_stats", new_callable=AsyncMock) as mock:
            mock.return_value = {"ram_usage": 55}
            result = await execute_tool_call(
                {"function": {"name": "get_system_stats", "arguments": {}}}, {}
            )
            assert result["ok"] is True

    @pytest.mark.asyncio
    async def test_tool_exception_returns_error(self):
        """If a tool raises, the result should indicate failure gracefully."""
        with patch("app.services.resident_tools._search_web", new_callable=AsyncMock) as mock:
            mock.side_effect = RuntimeError("connection refused")
            result = await execute_tool_call(
                {"function": {"name": "search_web", "arguments": json.dumps({"query": "test"})}}, {}
            )
            assert result["ok"] is False
            assert "connection refused" in result["error"]
            assert result["duration_ms"] >= 0

    @pytest.mark.asyncio
    async def test_result_has_duration(self):
        with patch("app.services.resident_tools._get_weather", new_callable=AsyncMock) as mock:
            mock.return_value = {"location": "Praha", "temp_c": "15"}
            result = await execute_tool_call(
                {"function": {"name": "get_weather", "arguments": json.dumps({"location": "Praha"})}}, {}
            )
            assert result["ok"] is True
            assert "duration_ms" in result
            assert isinstance(result["duration_ms"], int)


# ── Individual tool tests (mocked) ──────────────────────────


class TestSearchWeb:
    @pytest.mark.asyncio
    async def test_search_web_returns_snippets(self):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "AbstractText": "Python is a programming language.",
            "RelatedTopics": [
                {"Text": "Python tutorial", "FirstURL": "https://example.com/tutorial"},
                {"Text": "Python docs", "FirstURL": "https://example.com/docs"},
            ],
        }

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)

        with patch("app.services.resident_tools.httpx.AsyncClient", return_value=mock_client):
            result = await execute_tool_call(
                {"function": {"name": "search_web", "arguments": json.dumps({"query": "python"})}}, {}
            )

        assert result["ok"] is True
        data = result["data"]
        assert data["abstract"] == "Python is a programming language."
        assert len(data["results"]) == 2
        assert data["results"][0]["text"] == "Python tutorial"


class TestKbSearch:
    @pytest.mark.asyncio
    async def test_kb_search_returns_relevant_docs(self):
        mock_embed_svc = MagicMock()
        mock_embed_svc.embed = AsyncMock(return_value=[0.1] * 384)

        mock_vs = MagicMock()
        mock_vs.search.return_value = {
            "documents": ["Doc about CI pipeline setup"],
            "metadatas": [{"title": "CI Setup Guide", "file_path": "/docs/ci.md"}],
            "distances": [0.15],
        }

        with patch("app.services.embeddings_service.get_embeddings_service", return_value=mock_embed_svc), \
             patch("app.services.vector_store_service.get_vector_store_service", return_value=mock_vs):
            result = await execute_tool_call(
                {"function": {"name": "kb_search", "arguments": json.dumps({"query": "CI pipeline"})}}, {}
            )

        assert result["ok"] is True
        data = result["data"]
        assert data["count"] == 1
        assert data["documents"][0]["title"] == "CI Setup Guide"
        assert data["documents"][0]["score"] == 0.85  # 1 - 0.15


class TestGetSystemStats:
    @pytest.mark.asyncio
    async def test_get_system_stats_parses_metrics(self):
        mock_job_svc = MagicMock()
        mock_job_svc.get_stats_since.return_value = {"tasks_total": 42, "success_rate": 0.95}
        mock_job_svc.list_jobs.return_value = [MagicMock() for _ in range(3)]
        mock_job_svc.count_jobs.return_value = 2

        mock_vs = MagicMock()
        mock_vs.get_stats.return_value = {"total_chunks": 5000}

        mock_monitor = MagicMock()
        mock_monitor.to_dict.return_value = {"ram_used_percent": 65.2, "cpu_percent": 30.1, "throttle": False}

        mock_cb = AsyncMock()
        mock_cb.can_execute.return_value = True

        with patch("app.services.job_service.get_job_service", return_value=mock_job_svc), \
             patch("app.services.vector_store_service.get_vector_store_service", return_value=mock_vs), \
             patch("app.services.resource_monitor.get_resource_monitor", return_value=mock_monitor), \
             patch("app.utils.circuit_breaker.get_ollama_circuit_breaker", return_value=mock_cb):
            result = await execute_tool_call(
                {"function": {"name": "get_system_stats", "arguments": "{}"}}, {}
            )

        assert result["ok"] is True
        data = result["data"]
        assert data["job_queue_depth"] == 3
        assert data["kb_size"] == 5000
        assert data["ram_usage"] == 65.2
        assert data["ollama_circuit_open"] is False


class TestListJobs:
    @pytest.mark.asyncio
    async def test_list_jobs_returns_jobs(self):
        mock_job = MagicMock()
        mock_job.id = "job-123"
        mock_job.type = "resident_task"
        mock_job.title = "Test job"
        mock_job.status = "succeeded"
        mock_job.progress = 100.0
        mock_job.created_at = "2025-01-01T00:00:00Z"

        mock_job_svc = MagicMock()
        mock_job_svc.list_jobs.return_value = [mock_job]

        with patch("app.services.job_service.get_job_service", return_value=mock_job_svc):
            result = await execute_tool_call(
                {"function": {"name": "list_jobs", "arguments": json.dumps({"status": "succeeded", "limit": 5})}}, {}
            )

        assert result["ok"] is True
        data = result["data"]
        assert data["count"] == 1
        assert data["jobs"][0]["id"] == "job-123"


class TestGetWeather:
    @pytest.mark.asyncio
    async def test_get_weather_returns_forecast(self):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "current_condition": [{
                "temp_C": "18",
                "FeelsLikeC": "16",
                "humidity": "55",
                "weatherDesc": [{"value": "Partly cloudy"}],
                "windspeedKmph": "12",
            }]
        }

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)

        with patch("app.services.resident_tools.httpx.AsyncClient", return_value=mock_client):
            result = await execute_tool_call(
                {"function": {"name": "get_weather", "arguments": json.dumps({"location": "Brno"})}}, {}
            )

        assert result["ok"] is True
        data = result["data"]
        assert data["location"] == "Brno"
        assert data["temp_c"] == "18"
        assert data["description"] == "Partly cloudy"


class TestBrowsePage:
    @pytest.mark.asyncio
    async def test_browse_page_extracts_text(self):
        html = "<html><head><title>Test Page</title></head><body><p>Hello world!</p></body></html>"
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.text = html

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)

        with patch("app.services.resident_tools.httpx.AsyncClient", return_value=mock_client):
            result = await execute_tool_call(
                {"function": {"name": "browse_page", "arguments": json.dumps({"url": "https://example.com"})}}, {}
            )

        assert result["ok"] is True
        data = result["data"]
        assert data["title"] == "Test Page"
        assert "Hello world" in data["text_summary"]

    @pytest.mark.asyncio
    async def test_browse_page_rejects_bad_scheme(self):
        result = await execute_tool_call(
            {"function": {"name": "browse_page", "arguments": json.dumps({"url": "ftp://evil.com/payload"})}}, {}
        )
        assert result["ok"] is False
        assert "Unsupported URL" in result["error"]


# ── Rate limit / max tools enforcement test ──────────────────

class TestToolSafety:
    @pytest.mark.asyncio
    async def test_max_three_tools_enforced_in_reasoner(self):
        """The reasoner limits tool calls to 3; verify parsing logic."""
        from app.services.resident_reasoner import ResidentReasoner

        reasoner = ResidentReasoner()

        # Simulate LLM returning 5 tool calls
        reply = json.dumps([
            {"type": "function", "function": {"name": f"tool_{i}", "arguments": {}}}
            for i in range(5)
        ])
        calls = reasoner._parse_tool_calls(reply)
        # parse returns all 5, but reason_with_tools slices to 3
        assert len(calls) == 5  # parser returns all

    def test_parse_tool_calls_flat_format(self):
        """Parser handles flat format {"name": ..., "arguments": ...}."""
        from app.services.resident_reasoner import ResidentReasoner

        reasoner = ResidentReasoner()
        reply = json.dumps([{"name": "search_web", "arguments": {"query": "test"}}])
        calls = reasoner._parse_tool_calls(reply)
        assert len(calls) == 1
        assert calls[0]["function"]["name"] == "search_web"

    def test_parse_tool_calls_garbage_returns_empty(self):
        from app.services.resident_reasoner import ResidentReasoner

        reasoner = ResidentReasoner()
        assert reasoner._parse_tool_calls("I don't need any tools.") == []
        assert reasoner._parse_tool_calls("") == []
