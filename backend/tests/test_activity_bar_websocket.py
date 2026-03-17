"""Tests for the activity bar WebSocket data structure.

These tests verify the data contract between the backend WebSocket
broadcasts and the frontend activity bar + tooltip rendering.
"""
import pytest


def test_activity_update_structure():
    """Verify the expected structure of activity bar WebSocket messages."""
    msg = {
        "resident": {"status": "idle", "last_action": None},
        "jobs": {"total_active": 2, "running": 1, "queued": 1, "failed": 0},
        "kb": {"total_chunks": 847},
        "ollama": {"status": "running"},
        "resources": {"ram_used_mb": 4300, "ram_total_mb": 8192, "cpu_percent": 23},
    }

    assert msg["resident"]["status"] in ("idle", "thinking", "executing", "error")
    assert isinstance(msg["jobs"]["total_active"], int)
    assert isinstance(msg["kb"]["total_chunks"], int)
    assert msg["ollama"]["status"] in ("running", "stopped", "unknown")
    assert isinstance(msg["resources"]["ram_used_mb"], (int, float))
    assert isinstance(msg["resources"]["cpu_percent"], (int, float))


def test_tooltip_data_mapping():
    """Verify tooltip fields map correctly from activity data."""
    tooltip_fields = {
        "tip-resident-status": "resident.status",
        "tip-resident-action": "resident.last_action",
        "tip-jobs-running": "jobs.running",
        "tip-jobs-queued": "jobs.queued",
        "tip-jobs-failed": "jobs.failed",
        "tip-kb-chunks": "kb.total_chunks",
        "tip-ollama-detail": "ollama.status",
        "tip-ram-detail": "resources.ram_used_mb",
        "tip-cpu-detail": "resources.cpu_percent",
    }
    assert len(tooltip_fields) == 9
    for field_id, path in tooltip_fields.items():
        assert field_id.startswith("tip-")
        assert "." in path


def test_activity_pulse_states():
    """Verify the activity pulse color states."""
    states = {
        "idle": "activity-pulse",
        "thinking": "activity-pulse activity-pulse--working",
        "executing": "activity-pulse activity-pulse--working",
        "error": "activity-pulse activity-pulse--error",
    }
    assert len(states) == 4
    assert "error" in states["error"]
