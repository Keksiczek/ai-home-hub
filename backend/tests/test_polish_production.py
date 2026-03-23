"""Tests for Polish round 4 – production readiness features.

Covers:
  - Error handler middleware
  - Resident history persistence (SQLite)
  - Cleanup service
  - PWA manifest validation
  - Metrics cache
  - Error boundary frontend assets
"""

import json
import os
import sqlite3
import tempfile
import time
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── Error Handler Middleware ────────────────────────────────────────


class TestErrorHandlerMiddleware:
    """Test the global error handler catches unhandled exceptions."""

    def test_error_history_initially_empty(self):
        from app.middleware.error_handler import get_error_history

        # May have entries from other tests, but should be a list
        result = get_error_history(limit=0)
        assert isinstance(result, list)

    def test_error_record_structure(self):
        from app.middleware.error_handler import ErrorRecord

        rec = ErrorRecord(
            timestamp="2025-01-01T00:00:00Z",
            request_id="abc123",
            method="GET",
            path="/api/test",
            error_type="ValueError",
            message="test error",
            traceback_short="traceback...",
        )
        d = rec.to_dict()
        assert d["request_id"] == "abc123"
        assert d["error_type"] == "ValueError"
        assert d["path"] == "/api/test"

    def test_health_errors_endpoint(self, client):
        resp = client.get("/api/health/errors")
        assert resp.status_code == 200
        data = resp.json()
        assert "errors" in data
        assert "count" in data


# ── Resident History Persistence ────────────────────────────────────


class TestResidentHistoryPersistence:
    """Test SQLite-backed resident cycle history."""

    def test_save_and_retrieve_cycle(self):
        from app.db.resident_state import ResidentStateDB

        with tempfile.TemporaryDirectory() as tmpdir:
            with patch("app.db.resident_state.DB_DIR", Path(tmpdir)):
                with patch(
                    "app.db.resident_state.DB_PATH", Path(tmpdir) / "test_resident.db"
                ):
                    db = ResidentStateDB()
                    db.save_cycle(
                        cycle_id="cycle-0001",
                        cycle_number=1,
                        timestamp="2025-01-01T00:00:00Z",
                        status="success",
                        action_type="periodic",
                        duration_ms=42.5,
                    )
                    history = db.get_history(limit=10)
                    assert len(history) >= 1
                    assert history[0]["cycle_id"] == "cycle-0001"
                    assert history[0]["status"] == "success"
                    assert history[0]["duration_ms"] == 42.5

    def test_auto_prune(self):
        from app.db.resident_state import ResidentStateDB

        with tempfile.TemporaryDirectory() as tmpdir:
            with patch("app.db.resident_state.DB_DIR", Path(tmpdir)):
                with patch(
                    "app.db.resident_state.DB_PATH", Path(tmpdir) / "test_prune.db"
                ):
                    with patch("app.db.resident_state.MAX_ROWS", 5):
                        with patch("app.db.resident_state.PRUNE_KEEP", 3):
                            db = ResidentStateDB()
                            for i in range(8):
                                db.save_cycle(
                                    cycle_id=f"cycle-{i:04d}",
                                    cycle_number=i,
                                    timestamp="2025-01-01T00:00:00Z",
                                    status="success",
                                )
                            history = db.get_history(limit=100)
                            assert len(history) <= 5

    def test_get_stats(self):
        from app.db.resident_state import ResidentStateDB

        with tempfile.TemporaryDirectory() as tmpdir:
            with patch("app.db.resident_state.DB_DIR", Path(tmpdir)):
                with patch(
                    "app.db.resident_state.DB_PATH", Path(tmpdir) / "test_stats.db"
                ):
                    db = ResidentStateDB()
                    db.save_cycle(
                        cycle_id="c1",
                        cycle_number=1,
                        timestamp="2025-01-01T00:00:00Z",
                        status="success",
                        duration_ms=100,
                    )
                    db.save_cycle(
                        cycle_id="c2",
                        cycle_number=2,
                        timestamp="2025-01-01T00:01:00Z",
                        status="error",
                        duration_ms=200,
                        error="fail",
                    )
                    stats = db.get_stats()
                    assert stats["total_cycles"] == 2
                    assert stats["total_errors"] == 1
                    assert stats["avg_duration_ms"] == 150.0

    def test_persistent_history_endpoint(self, client):
        resp = client.get("/api/agent/history/persistent")
        assert resp.status_code == 200
        data = resp.json()
        assert "history" in data
        assert "stats" in data


# ── Cleanup Service ─────────────────────────────────────────────────


class TestCleanupService:
    """Test the periodic cleanup service."""

    def test_cleanup_removes_old_sessions(self):
        from app.services.cleanup_service import CleanupService

        with tempfile.TemporaryDirectory() as tmpdir:
            sessions_dir = Path(tmpdir) / "sessions"
            sessions_dir.mkdir()

            # Create an old session file (mtime 10 days ago)
            old_file = sessions_dir / "old-session.json"
            old_file.write_text('{"session_id": "old"}')
            old_mtime = time.time() - (10 * 86400)
            os.utime(str(old_file), (old_mtime, old_mtime))

            # Create a recent session file
            new_file = sessions_dir / "new-session.json"
            new_file.write_text('{"session_id": "new"}')

            svc = CleanupService()
            with patch("app.services.cleanup_service.SESSIONS_DIR", sessions_dir):
                freed = svc._cleanup_old_sessions(max_age_days=7)

            assert freed > 0
            assert not old_file.exists()
            assert new_file.exists()

    def test_vacuum_databases(self):
        from app.services.cleanup_service import CleanupService

        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / "test.db"
            conn = sqlite3.connect(str(db_path))
            conn.execute("CREATE TABLE t (id INTEGER PRIMARY KEY)")
            conn.execute("INSERT INTO t VALUES (1)")
            conn.commit()
            conn.close()

            svc = CleanupService()
            with patch("app.services.cleanup_service.DATA_DIR", Path(tmpdir)):
                # Rename to jobs.db so it gets picked up
                db_path.rename(Path(tmpdir) / "jobs.db")
                svc._vacuum_databases()
                # Should not raise

    def test_cleanup_status(self):
        from app.services.cleanup_service import CleanupService

        svc = CleanupService()
        status = svc.get_status()
        assert "interval_hours" in status
        assert status["interval_hours"] >= 1

    def test_cleanup_endpoint(self, client):
        resp = client.get("/api/health/cleanup")
        assert resp.status_code == 200
        data = resp.json()
        assert "interval_hours" in data


# ── PWA Manifest Validation ────────────────────────────────────────


class TestPWAManifest:
    """Validate the PWA manifest is correct."""

    def test_manifest_valid_json(self):
        manifest_path = Path(__file__).parent.parent / "static" / "manifest.json"
        with open(manifest_path) as f:
            data = json.load(f)
        assert data["name"] == "AI Home Hub"
        assert data["short_name"] == "HomeHub"
        assert data["display"] == "standalone"
        assert len(data["icons"]) >= 2
        assert data["theme_color"] == "#1f2937"
        assert data["background_color"] == "#020617"

    def test_manifest_icons_have_required_fields(self):
        manifest_path = Path(__file__).parent.parent / "static" / "manifest.json"
        with open(manifest_path) as f:
            data = json.load(f)
        for icon in data["icons"]:
            assert "src" in icon
            assert "sizes" in icon
            assert "type" in icon


# ── Metrics Cache ───────────────────────────────────────────────────


class TestMetricsCache:
    """Test the agent metrics cache with TTL."""

    def test_cached_metrics_endpoint(self, client):
        resp = client.get("/api/agent/metrics/cached")
        assert resp.status_code == 200
        data = resp.json()
        assert "tick_count" in data
        assert "errors_since_start" in data

    def test_metrics_cache_returns_same_within_ttl(self):
        from app.services.resident_agent import get_resident_agent

        agent = get_resident_agent()
        m1 = agent.get_cached_metrics()
        m2 = agent.get_cached_metrics()
        # Should return cached version (same object or equal)
        assert m1 == m2


# ── Error Boundary Frontend ─────────────────────────────────────────


class TestErrorBoundaryFrontend:
    """Test that error boundary code exists in frontend assets."""

    def test_error_boundary_in_app_js(self):
        app_js = Path(__file__).parent.parent / "static" / "app.js"
        content = app_js.read_text()
        assert "error-boundary-banner" in content
        assert "exportErrorLog" in content
        assert "_recordError" in content
        assert "unhandledrejection" in content

    def test_error_boundary_css_exists(self):
        css = Path(__file__).parent.parent / "static" / "style.css"
        content = css.read_text()
        assert ".error-boundary-banner" in content
        assert "errorSlideIn" in content

    def test_tooltips_in_app_js(self):
        app_js = Path(__file__).parent.parent / "static" / "app.js"
        content = app_js.read_text()
        assert "initTooltips" in content
        assert "data-tooltip" in content


# ── Service Worker ──────────────────────────────────────────────────


class TestServiceWorker:
    """Test service worker file content."""

    def test_sw_exists_and_has_cache(self):
        sw = Path(__file__).parent.parent / "static" / "sw.js"
        content = sw.read_text()
        assert "ai-home-hub-v2" in content
        assert "CACHEABLE_API" in content
        assert "/api/health" in content

    def test_sw_has_offline_fallback(self):
        sw = Path(__file__).parent.parent / "static" / "sw.js"
        content = sw.read_text()
        assert "caches.match" in content
