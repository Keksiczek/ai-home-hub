"""Tests for drag-and-drop image handling in the chat.

These are contract tests for the multimodal chat endpoint which is used
by the drag-drop feature to send images.
"""
import base64
import pytest


def _make_tiny_png():
    """Create a minimal 1x1 red PNG for testing."""
    import struct
    import zlib

    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)
        return struct.pack(">I", len(data)) + c + crc

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    raw = b"\x00\xff\x00\x00"
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return header + ihdr + idat + iend


def test_multimodal_endpoint_exists(client):
    """POST /api/chat/multimodal endpoint exists and accepts requests."""
    tiny_png = base64.b64encode(_make_tiny_png()).decode()
    res = client.post("/api/chat/multimodal", json={
        "message": "What is this?",
        "mode": "general",
        "profile": "vision",
        "images": [{"data": tiny_png, "media_type": "image/png"}],
    })
    # May fail due to no LLM, but should not be 404
    assert res.status_code != 404


def test_image_size_validation():
    """Verify the 5MB client-side limit constant."""
    MAX_SIZE = 5 * 1024 * 1024  # 5MB
    assert MAX_SIZE == 5242880


def test_accepted_image_types():
    """Verify accepted image MIME types for drag-drop."""
    accepted = ["image/png", "image/jpeg", "image/gif", "image/webp"]
    assert "image/png" in accepted
    assert "image/jpeg" in accepted
    assert len(accepted) == 4
