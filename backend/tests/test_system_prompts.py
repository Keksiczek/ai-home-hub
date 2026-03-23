"""Tests for system prompt hardening – correct prompts per profile and custom append."""

import json
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest


def test_general_prompt_contains_czech_rule():
    """General system prompt should contain the 'always answer in Czech' rule."""
    from app.services.settings_service import SettingsService

    svc = SettingsService()
    prompt = svc.get_system_prompt("general")
    assert "česky" in prompt.lower() or "cesky" in prompt.lower()


def test_powerbi_prompt_contains_dax():
    """PowerBI prompt should mention DAX."""
    from app.services.settings_service import SettingsService

    svc = SettingsService()
    prompt = svc.get_system_prompt("powerbi")
    assert "DAX" in prompt


def test_lean_prompt_contains_kaizen():
    """Lean prompt should mention Lean tools."""
    from app.services.settings_service import SettingsService

    svc = SettingsService()
    prompt = svc.get_system_prompt("lean")
    assert "Lean" in prompt or "Kaizen" in prompt


def test_unknown_mode_falls_back_to_general():
    """Unknown mode should return the general prompt."""
    from app.services.settings_service import SettingsService

    svc = SettingsService()
    general = svc.get_system_prompt("general")
    unknown = svc.get_system_prompt("nonexistent_mode")
    assert unknown == general


def test_custom_system_prompt_append():
    """custom_system_prompt_append should be appended to every prompt."""
    from app.services.settings_service import SettingsService, SETTINGS_FILE, DATA_DIR

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_settings = Path(tmpdir) / "settings.json"
        tmp_settings.write_text(
            json.dumps(
                {
                    "system_prompts": {
                        "general": "Base prompt.",
                    },
                    "custom_system_prompt_append": "Always mention bananas.",
                }
            )
        )

        with patch("app.services.settings_service.SETTINGS_FILE", tmp_settings):
            svc = SettingsService()
            prompt = svc.get_system_prompt("general")

    assert "Base prompt." in prompt
    assert "Always mention bananas." in prompt


def test_empty_custom_append_no_change():
    """Empty custom_system_prompt_append should not alter the prompt."""
    from app.services.settings_service import SettingsService

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_settings = Path(tmpdir) / "settings.json"
        tmp_settings.write_text(
            json.dumps(
                {
                    "system_prompts": {
                        "general": "Base prompt.",
                    },
                    "custom_system_prompt_append": "",
                }
            )
        )

        with patch("app.services.settings_service.SETTINGS_FILE", tmp_settings):
            svc = SettingsService()
            prompt = svc.get_system_prompt("general")

    assert prompt == "Base prompt."


def test_default_general_prompt_no_refusal_pattern():
    """Default general prompt should instruct to never refuse."""
    from app.services.settings_service import DEFAULT_SETTINGS

    prompt = DEFAULT_SETTINGS["system_prompts"]["general"]
    assert "neodmítej" in prompt.lower() or "nikdy" in prompt.lower()


def test_default_general_prompt_structured_response():
    """Default general prompt should mention structured response format."""
    from app.services.settings_service import DEFAULT_SETTINGS

    prompt = DEFAULT_SETTINGS["system_prompts"]["general"]
    assert "struktur" in prompt.lower() or "kroky" in prompt.lower()
