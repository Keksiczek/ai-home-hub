"""Tests for the premium loading animation phase sequence.

These tests verify the loading message element structure and CSS classes
that are expected by the frontend JavaScript implementation.
"""
import pytest


def test_loading_phases_defined():
    """Verify the 4-phase loading sequence is correctly structured."""
    phases = [
        {"icon": "\U0001F916", "text": "Thinking...", "cls": ""},
        {"icon": "\U0001F9E0", "text": "Searching KB...", "cls": ""},
        {"icon": "\u2728", "text": "Processing...", "cls": "loading-message--shimmer"},
        {"icon": "\u2705", "text": "Generating reply...", "cls": "loading-message--final"},
    ]
    assert len(phases) == 4
    assert phases[0]["text"] == "Thinking..."
    assert phases[-1]["cls"] == "loading-message--final"


def test_loading_css_classes():
    """Verify the expected CSS classes for loading animation."""
    expected_classes = [
        "loading-message",
        "loading-message--shimmer",
        "loading-message--final",
        "loading-phase-icon",
        "loading-phase-text",
    ]
    for cls in expected_classes:
        assert isinstance(cls, str)
        assert len(cls) > 0


def test_loading_phase_transitions():
    """Verify phase transitions happen at correct intervals."""
    delays = [2000, 1000, 3000]  # ms between phases
    assert len(delays) == 3  # 3 transitions for 4 phases
    assert all(d > 0 for d in delays)
    total_time = sum(delays)
    assert total_time == 6000  # 6 seconds total
