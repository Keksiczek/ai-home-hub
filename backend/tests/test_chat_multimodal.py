"""Tests for POST /api/chat/multimodal."""

import base64

import pytest

# ── Helpers ──────────────────────────────────────────────────────────────────

_ENDPOINT = "/api/chat/multimodal"

# Minimal valid PNG header – content doesn't matter, only base64 length does.
_SMALL_B64 = base64.b64encode(b"\x89PNG\r\n\x1a\n" + b"\x00" * 16).decode()


def _image(data: str = _SMALL_B64, media_type: str = "image/png") -> dict:
    return {"data": data, "media_type": media_type}


def _req(message: str = "hello", images: list | None = None) -> dict:
    return {"message": message, "images": images or []}


# ── Tests ────────────────────────────────────────────────────────────────────


def test_multimodal_chat_no_images_calls_chat_endpoint(client, mock_ollama):
    """Without images the endpoint must delegate to Ollama /api/chat."""
    resp = client.post(_ENDPOINT, json=_req())

    assert resp.status_code == 200
    data = resp.json()
    assert data["reply"] == "mocked chat reply"

    # With memory/KB context enrichment, there may be an embeddings call too
    chat_calls = [c for c in mock_ollama["calls"] if "/api/chat" in c["url"]]
    assert len(chat_calls) == 1, "Expected exactly one /api/chat call"


def test_multimodal_chat_with_images_calls_generate_endpoint(client, mock_ollama):
    """With images the endpoint must delegate to Ollama /api/generate
    and the request payload must include an ``images`` list."""
    resp = client.post(_ENDPOINT, json=_req(message="describe this", images=[_image()]))

    assert resp.status_code == 200
    data = resp.json()
    assert data["reply"] == "mocked vision reply"

    generate_calls = [c for c in mock_ollama["calls"] if "/api/generate" in c["url"]]
    # There may be an additional unload call (keep_alive=0, empty prompt) after inference
    inference_calls = [c for c in generate_calls if c["json"].get("images")]
    assert (
        len(inference_calls) == 1
    ), "Expected exactly one /api/generate inference call"

    payload = inference_calls[0]["json"]
    assert "images" in payload, "Ollama generate payload must contain 'images' key"
    assert len(payload["images"]) == 1


def test_multimodal_chat_rejects_too_many_images(client):
    """Sending more than MAX_IMAGES_PER_MESSAGE (5) images must return 400."""
    images = [_image() for _ in range(6)]
    resp = client.post(_ENDPOINT, json=_req(images=images))

    assert resp.status_code == 400
    assert "Too many images" in resp.json()["detail"]


def test_multimodal_chat_rejects_invalid_mime_type(client):
    """An image with an unsupported MIME type must return 400."""
    resp = client.post(
        _ENDPOINT, json=_req(images=[_image(media_type="image/svg+xml")])
    )

    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert "svg+xml" in detail


def test_multimodal_chat_rejects_oversized_image(client, monkeypatch):
    """An image whose decoded size exceeds MAX_IMAGE_SIZE_BYTES must return 400.

    We monkeypatch MAX_IMAGE_SIZE_BYTES to 10 bytes so the test payload
    stays tiny while still exercising the size-check branch.
    """
    monkeypatch.setattr("app.routers.chat_multimodal.MAX_IMAGE_SIZE_BYTES", 10)

    # 20 base64 chars → approx_bytes = 20 * 3 // 4 = 15 > 10
    oversized_data = "A" * 20
    resp = client.post(_ENDPOINT, json=_req(images=[_image(data=oversized_data)]))

    assert resp.status_code == 400
    assert "exceeds" in resp.json()["detail"]
