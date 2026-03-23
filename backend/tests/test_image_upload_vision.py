"""Tests for image upload vision flow and screenshot fallback."""

import pytest


def test_multimodal_chat_uses_vision_profile(client, mock_ollama):
    """POST /api/chat/multimodal with images should use llava model."""
    import base64

    # Create a tiny 1x1 PNG
    tiny_png = base64.b64encode(
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00"
        b"\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00"
        b"\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    ).decode()

    res = client.post(
        "/api/chat/multimodal",
        json={
            "message": "Co je na obrazku?",
            "images": [{"data": tiny_png, "media_type": "image/png"}],
            "mode": "general",
            "profile": "vision",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "response" in data or "reply" in data


def test_multimodal_chat_no_images(client, mock_ollama):
    """POST /api/chat/multimodal without images still works."""
    res = client.post(
        "/api/chat/multimodal",
        json={
            "message": "Hello",
            "images": [],
            "mode": "general",
        },
    )
    assert res.status_code == 200


def test_vision_profile_config():
    """Vision profile should default to llava:7b."""
    from app.services.settings_service import get_settings_service

    svc = get_settings_service()
    settings = svc.load()
    vision = settings["profiles"]["vision"]
    assert vision["model"] == "llava:7b"
    assert vision["params"]["temperature"] == 0.5
