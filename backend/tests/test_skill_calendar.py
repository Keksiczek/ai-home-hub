"""Tests for CalendarSkill."""
import pytest
from unittest.mock import patch, MagicMock
from app.services.skills_runtime_service import CalendarSkill


def test_calendar_metadata():
    """CalendarSkill has correct metadata."""
    skill = CalendarSkill()
    assert skill.name == "calendar"
    assert "\U0001f4c5" in skill.icon


@pytest.mark.asyncio
async def test_calendar_get_today_returns_dict():
    """CalendarSkill.get_today returns a dict with expected keys."""
    skill = CalendarSkill()
    # Mock subprocess to avoid requiring macOS/Calendar
    mock_result = MagicMock()
    mock_result.stdout = "Meeting 1 | 2026-03-17 09:00\nMeeting 2 | 2026-03-17 14:00\n"
    mock_result.returncode = 0

    with patch("app.services.skills_runtime_service.asyncio.to_thread", return_value=mock_result):
        result = await skill.get_today()

    assert isinstance(result, dict)
    assert "events" in result
    assert "date" in result


@pytest.mark.asyncio
async def test_calendar_add_event_not_implemented():
    """CalendarSkill.add_event returns not_implemented."""
    skill = CalendarSkill()
    result = await skill.add_event("Test", "2026-03-17", 60)
    assert result.get("status") == "not_implemented"
