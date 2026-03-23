"""Tests for Prometheus metrics instrumentation."""

import io
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ChromaDB shim (same as conftest.py)
_chroma_mock = MagicMock()
for _mod_name in ("chromadb", "chromadb.config"):
    sys.modules.setdefault(_mod_name, _chroma_mock)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.services.metrics_service import (  # noqa: E402
    documents_parsed_total,
    ollama_latency_seconds,
    ollama_requests_total,
    upload_bytes_total,
    upload_files_total,
    ws_connected_clients,
    ws_messages_total,
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
    """Test the /metrics Prometheus endpoint."""

    def test_metrics_endpoint_returns_200(self, client: TestClient):
        resp = client.get("/metrics")
        assert resp.status_code == 200
        assert "text/plain" in resp.headers.get("content-type", "")

    def test_metrics_contains_app_info(self, client: TestClient):
        resp = client.get("/metrics")
        body = resp.text
        assert "ai_home_hub_info" in body

    def test_metrics_contains_defined_metrics(self, client: TestClient):
        resp = client.get("/metrics")
        body = resp.text
        # Check that our custom metric families are present
        for metric_name in (
            "upload_files_total",
            "upload_bytes_total",
            "ollama_requests_total",
            "ollama_latency_seconds",
            "chromadb_query_duration_seconds",
            "job_queue_depth",
            "job_duration_seconds",
            "ws_connected_clients",
            "ws_messages_total",
            "document_analysis_duration_seconds",
            "documents_parsed_total",
        ):
            assert metric_name in body, f"Missing metric: {metric_name}"


class TestUploadMetrics:
    """Test that file uploads increment metrics."""

    def test_document_upload_increments_metrics(self, client: TestClient):
        before = upload_files_total.labels(type="document")._value.get()
        before_bytes = upload_bytes_total.labels(type="document")._value.get()

        content = b"test file content for metrics"
        resp = client.post(
            "/api/upload",
            files={"file": ("test.txt", io.BytesIO(content), "text/plain")},
        )
        assert resp.status_code == 200

        after = upload_files_total.labels(type="document")._value.get()
        after_bytes = upload_bytes_total.labels(type="document")._value.get()

        assert after == before + 1
        assert after_bytes == before_bytes + len(content)

    def test_media_upload_rejected_format_no_metrics(self, client: TestClient):
        before = upload_files_total.labels(type="media")._value.get()

        resp = client.post(
            "/api/media/upload",
            files={
                "file": ("bad.exe", io.BytesIO(b"data"), "application/octet-stream")
            },
        )
        assert resp.status_code == 400

        after = upload_files_total.labels(type="media")._value.get()
        assert after == before  # no increment on rejection


class TestMetricDefinitions:
    """Test that metric objects are properly defined."""

    def test_upload_files_counter_has_type_label(self):
        counter = upload_files_total.labels(type="document")
        assert counter is not None

    def test_ollama_metrics_have_model_label(self):
        counter = ollama_requests_total.labels(model="test-model", status="success")
        assert counter is not None
        hist = ollama_latency_seconds.labels(model="test-model")
        assert hist is not None

    def test_ws_connected_clients_is_gauge(self):
        ws_connected_clients.set(5)
        assert ws_connected_clients._value.get() == 5
        ws_connected_clients.set(0)

    def test_ws_messages_total_counter(self):
        before = ws_messages_total.labels(type="test")._value.get()
        ws_messages_total.labels(type="test").inc()
        after = ws_messages_total.labels(type="test")._value.get()
        assert after == before + 1
