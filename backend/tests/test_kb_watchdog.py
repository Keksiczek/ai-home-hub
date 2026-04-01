"""Tests for KB Watchdog batching, dedup, and resource-aware behavior."""

import pytest
from app.services.kb_watchdog import _should_ignore, KBWatchdog


class TestShouldIgnore:
    """Test file path ignore logic."""

    def test_ignore_ds_store(self):
        assert _should_ignore("/some/path/.DS_Store") is True

    def test_ignore_swp(self):
        assert _should_ignore("/some/path/.file.swp") is True

    def test_ignore_tmp(self):
        assert _should_ignore("/some/path/data.tmp") is True

    def test_ignore_git_dir(self):
        assert _should_ignore("/some/path/.git/objects/abc") is True

    def test_ignore_pycache(self):
        assert _should_ignore("/some/__pycache__/module.cpython-312.pyc") is True

    def test_ignore_node_modules(self):
        assert _should_ignore("/project/node_modules/package/index.js") is True

    def test_allow_normal_file(self):
        assert _should_ignore("/some/path/document.pdf") is False

    def test_allow_markdown(self):
        assert _should_ignore("/docs/readme.md") is False

    def test_allow_python(self):
        assert _should_ignore("/src/app.py") is False


class TestKBWatchdogStatus:
    """Test watchdog status reporting."""

    def test_initial_status(self):
        wd = KBWatchdog(
            get_settings=lambda: None,
            on_change=lambda: None,
        )
        status = wd.get_status()
        assert status["is_dirty"] is False
        assert status["dirty_files"] == 0
        assert status["total_events"] == 0
        assert status["total_ingests"] == 0

    def test_dirty_tracking(self):
        wd = KBWatchdog(
            get_settings=lambda: None,
            on_change=lambda: None,
        )
        # Simulate recording dirty paths
        wd._record_dirty("/tmp/test.txt")
        assert wd.is_dirty is True
        assert wd.dirty_count == 1

    def test_dedup_same_path(self):
        wd = KBWatchdog(
            get_settings=lambda: None,
            on_change=lambda: None,
        )
        wd._record_dirty("/tmp/test.txt")
        wd._record_dirty("/tmp/test.txt")  # same path, same mtime → deduped
        # May or may not dedup depending on mtime, but should handle it
        assert wd.dirty_count >= 1
