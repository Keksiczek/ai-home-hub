"""Tests for multimodal image upload – validates base64 JSON contract and error handling."""
import base64

import pytest


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_tiny_png_base64() -> str:
    """Return a valid base64-encoded 1x1 white PNG (smallest valid PNG)."""
    # Minimal valid 1x1 white PNG
    import struct, zlib
    def _chunk(name: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + name + data + struct.pack(">I", zlib.crc32(name + data) & 0xFFFFFFFF)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = _chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    raw_row = b"\x00\xff\xff\xff"  # filter byte + RGB white
    idat = _chunk(b"IDAT", zlib.compress(raw_row))
    iend = _chunk(b"IEND", b"")
    return base64.b64encode(sig + ihdr + idat + iend).decode()


TINY_PNG = _make_tiny_png_base64()


# ── Tests ────────────────────────────────────────────────────────────────────

def test_valid_jpeg_upload(client, mock_ollama):
    """Valid base64 image with correct media_type should succeed."""
    resp = client.post("/api/chat/multimodal", json={
        "message": "Co je na obrázku?",
        "images": [{"data": TINY_PNG, "media_type": "image/png"}],
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["reply"] != ""
    assert data["session_id"]
    assert data["meta"]["images_count"] == 1


def test_unsupported_type_returns_400(client):
    """Unsupported media_type should return 400 with descriptive error."""
    resp = client.post("/api/chat/multimodal", json={
        "message": "test",
        "images": [{"data": TINY_PNG, "media_type": "image/bmp"}],
    })
    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert "unsupported type" in detail.lower() or "image/bmp" in detail


def test_invalid_base64_returns_400(client):
    """Invalid base64 data should return 400."""
    resp = client.post("/api/chat/multimodal", json={
        "message": "test",
        "images": [{"data": "not!valid!base64!!!", "media_type": "image/png"}],
    })
    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert "base64" in detail.lower()


def test_empty_data_returns_400(client):
    """Empty data string should return 400."""
    resp = client.post("/api/chat/multimodal", json={
        "message": "test",
        "images": [{"data": "", "media_type": "image/png"}],
    })
    assert resp.status_code == 400


def test_too_many_images_returns_400(client):
    """More than MAX_IMAGES_PER_MESSAGE should return 400."""
    images = [{"data": TINY_PNG, "media_type": "image/png"} for _ in range(6)]
    resp = client.post("/api/chat/multimodal", json={
        "message": "test",
        "images": images,
    })
    assert resp.status_code == 400
    assert "too many" in resp.json()["detail"].lower()


def test_no_images_falls_back_to_text(client, mock_ollama):
    """Request without images should behave like text chat."""
    resp = client.post("/api/chat/multimodal", json={
        "message": "Hello without images",
        "images": [],
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["meta"]["images_count"] == 0


def test_missing_media_type_returns_422(client):
    """Missing required field media_type should return 422 (Pydantic validation)."""
    resp = client.post("/api/chat/multimodal", json={
        "message": "test",
        "images": [{"data": TINY_PNG}],  # no media_type
    })
    assert resp.status_code == 422
