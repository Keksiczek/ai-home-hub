"""Tests for WeatherSkill (Nymburk)."""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.skills_runtime_service import WeatherSkill


def test_weather_metadata():
    """WeatherSkill has correct metadata."""
    skill = WeatherSkill()
    assert skill.name == "weather"
    assert skill.DEFAULT_LAT == 50.18
    assert skill.DEFAULT_LON == 15.04


@pytest.mark.asyncio
async def test_weather_run_returns_dict():
    """WeatherSkill.run returns a dict with location, current, and daily."""
    skill = WeatherSkill()

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.raise_for_status.return_value = None
    mock_resp.json.return_value = {
        "current_weather": {"temperature": 15.2, "windspeed": 8.5},
        "daily": {"temperature_2m_max": [18, 19, 20]},
    }

    mock_client = AsyncMock()
    mock_client.get.return_value = mock_resp
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch(
        "app.services.skills_runtime_service.httpx.AsyncClient",
        return_value=mock_client,
    ):
        result = await skill.run("Nymburk")

    assert isinstance(result, dict)
    assert result["location"] == "Nymburk"
    assert "current" in result


@pytest.mark.asyncio
async def test_weather_handles_error():
    """WeatherSkill handles network errors gracefully."""
    skill = WeatherSkill()

    mock_client = AsyncMock()
    mock_client.get.side_effect = Exception("Network error")
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch(
        "app.services.skills_runtime_service.httpx.AsyncClient",
        return_value=mock_client,
    ):
        result = await skill.run()

    assert "error" in result
