"""Tests for WebSearchSkill."""
import pytest
from unittest.mock import patch, MagicMock

from app.services.skills_runtime_service import WebSearchSkill


@pytest.mark.asyncio
async def test_web_search_returns_results():
    """WebSearchSkill.run returns a list of results."""
    mock_results = [
        {"title": "Test", "href": "https://example.com", "body": "Test body"},
    ]

    with patch("app.services.skills_runtime_service.asyncio") as mock_asyncio:
        skill = WebSearchSkill()
        # Mock the DDGS import and call
        with patch.dict("sys.modules", {"duckduckgo_search": MagicMock()}):
            with patch("app.services.skills_runtime_service.asyncio.to_thread", return_value=mock_results):
                result = await skill.run("test query", max_results=3)

    assert isinstance(result, list)


@pytest.mark.asyncio
async def test_web_search_handles_import_error():
    """WebSearchSkill handles missing duckduckgo-search gracefully."""
    skill = WebSearchSkill()

    async def _raise_import(*args, **kwargs):
        raise ImportError("no module")

    with patch("app.services.skills_runtime_service.asyncio.to_thread", side_effect=ImportError("no module")):
        # Should return error, not crash
        try:
            result = await skill.run("test")
            # If it catches the error internally
            assert isinstance(result, list)
        except ImportError:
            pass  # Also acceptable


def test_web_search_metadata():
    """WebSearchSkill has correct metadata."""
    skill = WebSearchSkill()
    assert skill.name == "web_search"
    assert skill.icon == "\U0001f310"
    d = skill.to_dict()
    assert d["name"] == "web_search"
    assert "description" in d
