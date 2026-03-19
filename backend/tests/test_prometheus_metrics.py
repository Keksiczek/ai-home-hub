"""Tests for the extended Prometheus metrics (PR #44)."""
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ChromaDB shim
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.services.metrics_service import (  # noqa: E402
    active_jobs,
    agent_cycles_total,
    chat_latency_seconds,
    chat_requests_total,
    kb_chunks_total,
    ollama_memory_bytes,
)


@pytest.fixture
def client() -> TestClient:
    with patch(
        "app.services.startup_checks.run_startup_checks",
        new_callable=AsyncMock,
        return_value={"ollama": "ok (mocked)"},
    ):
        with TestClient(app) as c:
            yield c


class TestMetricsEndpoint:
    def test_metrics_endpoint_returns_200(self, client: TestClient):
        resp = client.get("/metrics")
        assert resp.status_code == 200

    def test_metrics_content_type_is_text_plain(self, client: TestClient):
        resp = client.get("/metrics")
        assert "text/plain" in resp.headers.get("content-type", "")

    def test_new_metrics_present_in_output(self, client: TestClient):
        resp = client.get("/metrics")
        body = resp.text
        for metric in (
            "chat_requests_total",
            "chat_latency_seconds",
            "active_jobs",
            "kb_chunks_total",
            "agent_cycles_total",
            "ollama_memory_bytes",
        ):
            assert metric in body, f"Missing new metric: {metric}"


class TestChatMetrics:
    def test_chat_requests_counter_has_labels(self):
        counter = chat_requests_total.labels(profile="lean_ci", model="llama3.2")
        assert counter is not None

    def test_chat_requests_counter_increments(self):
        before = chat_requests_total.labels(profile="test", model="test-model")._value.get()
        chat_requests_total.labels(profile="test", model="test-model").inc()
        after = chat_requests_total.labels(profile="test", model="test-model")._value.get()
        assert after == before + 1

    def test_chat_latency_histogram_has_model_label(self):
        hist = chat_latency_seconds.labels(model="llama3.2")
        assert hist is not None

    def test_chat_latency_observe(self):
        # Should not raise
        chat_latency_seconds.labels(model="llama3.2").observe(1.5)


class TestJobMetrics:
    def test_active_jobs_is_gauge(self):
        active_jobs.set(3)
        assert active_jobs._value.get() == 3
        active_jobs.set(0)

    def test_active_jobs_set_running_count(self):
        active_jobs.set(5)
        assert active_jobs._value.get() == 5
        active_jobs.set(0)


class TestKBMetrics:
    def test_kb_chunks_total_has_collection_label(self):
        gauge = kb_chunks_total.labels(collection="knowledge_base")
        assert gauge is not None

    def test_kb_chunks_total_set(self):
        kb_chunks_total.labels(collection="test_collection").set(100)
        assert kb_chunks_total.labels(collection="test_collection")._value.get() == 100


class TestAgentMetrics:
    def test_agent_cycles_counter_has_status_label(self):
        counter = agent_cycles_total.labels(status="success")
        assert counter is not None

    def test_agent_cycles_success_increment(self):
        before = agent_cycles_total.labels(status="success")._value.get()
        agent_cycles_total.labels(status="success").inc()
        after = agent_cycles_total.labels(status="success")._value.get()
        assert after == before + 1

    def test_agent_cycles_error_increment(self):
        before = agent_cycles_total.labels(status="error")._value.get()
        agent_cycles_total.labels(status="error").inc()
        after = agent_cycles_total.labels(status="error")._value.get()
        assert after == before + 1


class TestOllamaMemoryMetric:
    def test_ollama_memory_bytes_is_gauge(self):
        ollama_memory_bytes.set(1024 * 1024 * 100)
        assert ollama_memory_bytes._value.get() == 1024 * 1024 * 100
        ollama_memory_bytes.set(0)
