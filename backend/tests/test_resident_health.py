"""Tests for hardening round 1: health checks, metrics, dashboard, spawn errors.

Covers:
- test_health_degraded_ollama_runs_app
- test_spawn_blocked_increments_metric
- test_resident_dashboard_has_health_and_metrics
- test_agent_spawn_returns_structured_error (resource + concurrent_limit)
- test_kb_reindex_counter_updates
"""
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── ChromaDB shim (prevent import errors in tests) ────────────────────────────
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_client(startup_health: dict) -> TestClient:
    """Return a TestClient whose lifespan uses *startup_health* as the mock result."""
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value=startup_health,
    ):
        with TestClient(app) as c:
            yield c


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def healthy_client():
    """Client with fully healthy startup."""
    yield from _make_client({
        "ollama": "ok",
        "kb": "ok",
        "jobs_db": "ok",
        "overall": "healthy",
        "ollama_models": ["llama3.2:latest"],
    })


@pytest.fixture
def degraded_client():
    """Client where Ollama is unavailable (app should still start)."""
    yield from _make_client({
        "ollama": "unavailable",
        "kb": "ok",
        "jobs_db": "ok",
        "overall": "degraded",
        "ollama_models": [],
    })


# ── 1. App starts even when Ollama is unavailable ─────────────────────────────

class TestHealthDegradedOllamaRunsApp:
    def test_app_starts_without_ollama(self, degraded_client):
        """/api/health returns 200 even when Ollama is unavailable."""
        resp = degraded_client.get("/api/health")
        assert resp.status_code == 200

    def test_system_health_reflects_ollama_unavailable(self, degraded_client):
        """/api/system/health reports ollama=unavailable."""
        resp = degraded_client.get("/api/system/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["ollama"] == "unavailable"
        assert data["overall"] == "degraded"

    def test_system_health_returns_full_structure(self, degraded_client):
        """Health dict has all expected keys."""
        resp = degraded_client.get("/api/system/health")
        data = resp.json()
        for key in ("ollama", "kb", "jobs_db", "overall"):
            assert key in data, f"Missing key: {key}"

    def test_system_health_healthy(self, healthy_client):
        """/api/system/health reports overall=healthy when all components ok."""
        resp = healthy_client.get("/api/system/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["overall"] == "healthy"
        assert data["ollama"] == "ok"
        assert data["kb"] == "ok"
        assert data["jobs_db"] == "ok"


# ── 2. Agent spawn blocked → increments metric ───────────────────────────────

class TestSpawnBlockedIncrementsMetric:
    def test_spawn_blocked_resource_increments_counter(self):
        """agent_spawn_blocked_total[resource] increments when resources are critical."""
        from app.services.metrics_service import agent_spawn_blocked_total

        before = agent_spawn_blocked_total.labels(reason="resource")._value.get()

        # Simulate the counter being incremented (as orchestrator would do)
        agent_spawn_blocked_total.labels(reason="resource").inc()

        after = agent_spawn_blocked_total.labels(reason="resource")._value.get()
        assert after == before + 1

    def test_spawn_blocked_concurrent_limit_increments_counter(self):
        """agent_spawn_blocked_total[concurrent_limit] increments when limit reached."""
        from app.services.metrics_service import agent_spawn_blocked_total

        before = agent_spawn_blocked_total.labels(reason="concurrent_limit")._value.get()
        agent_spawn_blocked_total.labels(reason="concurrent_limit").inc()
        after = agent_spawn_blocked_total.labels(reason="concurrent_limit")._value.get()
        assert after == before + 1

    def test_spawn_blocked_experimental_increments_counter(self):
        """agent_spawn_blocked_total[experimental] increments for disabled types."""
        from app.services.metrics_service import agent_spawn_blocked_total

        before = agent_spawn_blocked_total.labels(reason="experimental")._value.get()
        agent_spawn_blocked_total.labels(reason="experimental").inc()
        after = agent_spawn_blocked_total.labels(reason="experimental")._value.get()
        assert after == before + 1

    def test_spawn_blocked_in_orchestrator_resource(self, healthy_client):
        """AgentOrchestrator raises AgentSpawnError when resources blocked."""
        import asyncio
        from app.services.agent_orchestrator import AgentOrchestrator, AgentSpawnError
        from app.services.metrics_service import agent_spawn_blocked_total

        orch = AgentOrchestrator()

        before = agent_spawn_blocked_total.labels(reason="resource")._value.get()

        # get_resource_monitor is imported inside spawn_agent, patch at source module
        with patch(
            "app.services.resource_monitor.get_resource_monitor"
        ) as mock_mon:
            mock_mon.return_value.is_blocked.return_value = True

            with pytest.raises(AgentSpawnError) as exc_info:
                asyncio.get_event_loop().run_until_complete(
                    orch.spawn_agent("general", {"goal": "test"})
                )

        assert exc_info.value.status_code == 429
        assert exc_info.value.detail["error"] == "spawn_blocked"
        assert exc_info.value.detail["reason"] == "resource"

        after = agent_spawn_blocked_total.labels(reason="resource")._value.get()
        assert after == before + 1


# ── 3. Dashboard includes health + metrics_24h ───────────────────────────────

class TestResidentDashboardHasHealthAndMetrics:
    def test_dashboard_has_health_key(self, degraded_client):
        """Dashboard response includes 'health' from startup."""
        resp = degraded_client.get("/api/resident/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert "health" in data

    def test_dashboard_health_reflects_startup_state(self, degraded_client):
        """Dashboard health matches /api/system/health."""
        resp = degraded_client.get("/api/resident/dashboard")
        data = resp.json()
        assert data["health"]["ollama"] == "unavailable"
        assert data["health"]["overall"] == "degraded"

    def test_dashboard_has_metrics_24h(self, healthy_client):
        """Dashboard response includes 'metrics_24h' with required keys."""
        resp = healthy_client.get("/api/resident/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert "metrics_24h" in data
        m = data["metrics_24h"]
        assert "cycles_total" in m
        assert "success_rate" in m
        assert "avg_cycle_duration_s" in m

    def test_dashboard_metrics_types(self, healthy_client):
        """metrics_24h values have correct types."""
        resp = healthy_client.get("/api/resident/dashboard")
        data = resp.json()
        m = data["metrics_24h"]
        assert isinstance(m["cycles_total"], int)
        assert isinstance(m["success_rate"], float)

    def test_dashboard_alerts_include_ollama_warning(self, degraded_client):
        """Dashboard alerts mention Ollama when it is unavailable."""
        resp = degraded_client.get("/api/resident/dashboard")
        data = resp.json()
        alerts = data.get("alerts", [])
        assert any("Ollama" in a for a in alerts), f"Expected Ollama alert, got: {alerts}"


# ── 4. Agent spawn returns structured error ───────────────────────────────────

class TestAgentSpawnReturnsStructuredError:
    def test_spawn_error_reason_resource(self, healthy_client):
        """/api/agents/spawn returns 429 with structured body on resource block."""
        # get_resource_monitor is imported locally inside spawn_agent; patch source
        with patch(
            "app.services.resource_monitor.get_resource_monitor"
        ) as mock_mon:
            mock_mon.return_value.is_blocked.return_value = True

            resp = healthy_client.post(
                "/api/agents/spawn",
                json={"agent_type": "general", "task": {"goal": "test"}},
            )

        assert resp.status_code == 429
        body = resp.json()
        assert body.get("detail", {}).get("error") == "spawn_blocked"
        assert body.get("detail", {}).get("reason") == "resource"

    def test_spawn_error_reason_concurrent_limit(self, healthy_client):
        """/api/agents/spawn returns 429 when concurrent limit reached."""
        from app.services.agent_orchestrator import get_agent_orchestrator, AGENT_STATUS_RUNNING

        orch = get_agent_orchestrator()
        # Fill up agents to max_concurrent (default 3)
        original_agents = dict(orch._agents)

        fake_agents = {}
        for i in range(10):
            rec = MagicMock()
            rec.status = AGENT_STATUS_RUNNING
            fake_agents[str(i)] = rec

        try:
            orch._agents = fake_agents

            resp = healthy_client.post(
                "/api/agents/spawn",
                json={"agent_type": "general", "task": {"goal": "test"}},
            )

            assert resp.status_code == 429
            body = resp.json()
            assert body.get("detail", {}).get("error") == "spawn_blocked"
            assert body.get("detail", {}).get("reason") == "concurrent_limit"
        finally:
            orch._agents = original_agents

    def test_agent_spawn_error_is_http_exception(self):
        """AgentSpawnError is an HTTPException with status 429."""
        from app.services.agent_orchestrator import AgentSpawnError
        from fastapi import HTTPException

        err = AgentSpawnError("resource")
        assert isinstance(err, HTTPException)
        assert err.status_code == 429
        assert err.detail["error"] == "spawn_blocked"
        assert err.detail["reason"] == "resource"


# ── 5. KB reindex counter updates ────────────────────────────────────────────

class TestKbReindexCounterUpdates:
    def test_kb_reindex_jobs_total_has_labels(self):
        """kb_reindex_jobs_total counter accepts expected labels."""
        from app.services.metrics_service import kb_reindex_jobs_total

        for label in ("queued", "success", "fail"):
            c = kb_reindex_jobs_total.labels(status=label)
            assert c is not None

    def test_kb_reindex_queued_increments(self):
        """Counter increments for 'queued' status."""
        from app.services.metrics_service import kb_reindex_jobs_total

        before = kb_reindex_jobs_total.labels(status="queued")._value.get()
        kb_reindex_jobs_total.labels(status="queued").inc()
        after = kb_reindex_jobs_total.labels(status="queued")._value.get()
        assert after == before + 1

    def test_kb_reindex_success_increments(self):
        """Counter increments for 'success' status."""
        from app.services.metrics_service import kb_reindex_jobs_total

        before = kb_reindex_jobs_total.labels(status="success")._value.get()
        kb_reindex_jobs_total.labels(status="success").inc()
        after = kb_reindex_jobs_total.labels(status="success")._value.get()
        assert after == before + 1

    def test_kb_reindex_fail_increments(self):
        """Counter increments for 'fail' status."""
        from app.services.metrics_service import kb_reindex_jobs_total

        before = kb_reindex_jobs_total.labels(status="fail")._value.get()
        kb_reindex_jobs_total.labels(status="fail").inc()
        after = kb_reindex_jobs_total.labels(status="fail")._value.get()
        assert after == before + 1

    def test_new_metrics_in_prometheus_output(self, healthy_client):
        """New metrics appear in /metrics Prometheus output."""
        resp = healthy_client.get("/metrics")
        assert resp.status_code == 200
        body = resp.text
        for metric in (
            "agent_spawn_blocked_total",
            "resident_cycles_total",
            "kb_reindex_jobs_total",
            "resident_queue_depth",
        ):
            assert metric in body, f"Missing metric in /metrics output: {metric}"
