"""Tests for the notification service and API endpoints."""

import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# ── NotificationService unit tests ───────────────────────────────────────────


@pytest.mark.asyncio
async def test_notification_service_send_and_list(tmp_path, monkeypatch):
    """send() persists a notification; list_notifications() returns it."""
    monkeypatch.setenv("NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setattr(
        "app.services.notification_service.DB_PATH", tmp_path / "notif.db"
    )
    monkeypatch.setattr(
        "app.services.notification_service.DB_DIR", tmp_path
    )

    # Re-import to pick up monkeypatched paths
    from app.services.notification_service import NotificationService

    svc = NotificationService()
    broadcast_mock = AsyncMock()
    svc.set_broadcast(broadcast_mock)

    result = await svc.send(
        title="Test Title",
        body="Test body text",
        level="info",
        source="test",
        importance=7,
    )
    assert result is True

    # WS broadcast was called (importance 7 >= default threshold 6)
    assert broadcast_mock.call_count == 1
    msg = broadcast_mock.call_args[0][0]
    assert msg["type"] == "notification"
    assert msg["title"] == "Test Title"
    assert msg["body"] == "Test body text"
    assert msg["level"] == "info"

    # List should return the notification
    data = svc.list_notifications(limit=10)
    assert len(data["notifications"]) == 1
    assert data["notifications"][0]["title"] == "Test Title"
    assert data["unread_count"] == 1


@pytest.mark.asyncio
async def test_notification_service_mark_read(tmp_path, monkeypatch):
    """mark_read() sets read=1 for a notification."""
    monkeypatch.setenv("NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setattr(
        "app.services.notification_service.DB_PATH", tmp_path / "notif.db"
    )
    monkeypatch.setattr(
        "app.services.notification_service.DB_DIR", tmp_path
    )

    from app.services.notification_service import NotificationService

    svc = NotificationService()

    await svc.send(title="N1", body="Body1", level="info", source="test", importance=3)
    data = svc.list_notifications()
    notif_id = data["notifications"][0]["id"]

    assert svc.mark_read(notif_id) is True

    data = svc.list_notifications()
    assert data["unread_count"] == 0
    assert data["notifications"][0]["read"] is True


@pytest.mark.asyncio
async def test_notification_service_mark_all_read(tmp_path, monkeypatch):
    """mark_all_read() marks all notifications as read."""
    monkeypatch.setenv("NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setattr(
        "app.services.notification_service.DB_PATH", tmp_path / "notif.db"
    )
    monkeypatch.setattr(
        "app.services.notification_service.DB_DIR", tmp_path
    )

    from app.services.notification_service import NotificationService

    svc = NotificationService()

    await svc.send(title="N1", body="B1", level="info", source="test", importance=3)
    await svc.send(title="N2", body="B2", level="info", source="test", importance=3)

    count = svc.mark_all_read()
    assert count == 2

    data = svc.list_notifications()
    assert data["unread_count"] == 0


@pytest.mark.asyncio
async def test_notification_service_fifo_pruning(tmp_path, monkeypatch):
    """DB keeps max MAX_NOTIFICATIONS entries."""
    monkeypatch.setenv("NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setattr(
        "app.services.notification_service.DB_PATH", tmp_path / "notif.db"
    )
    monkeypatch.setattr(
        "app.services.notification_service.DB_DIR", tmp_path
    )
    monkeypatch.setattr(
        "app.services.notification_service.MAX_NOTIFICATIONS", 5
    )

    from app.services.notification_service import NotificationService

    svc = NotificationService()

    for i in range(8):
        await svc.send(
            title=f"N{i}", body=f"B{i}", level="info", source="test", importance=3
        )

    data = svc.list_notifications(limit=100)
    assert len(data["notifications"]) == 5


@pytest.mark.asyncio
async def test_notification_service_disabled(tmp_path, monkeypatch):
    """When NOTIFICATIONS_ENABLED=false, send() returns False."""
    monkeypatch.setattr(
        "app.services.notification_service.NOTIFICATIONS_ENABLED", False
    )
    monkeypatch.setattr(
        "app.services.notification_service.DB_PATH", tmp_path / "notif.db"
    )
    monkeypatch.setattr(
        "app.services.notification_service.DB_DIR", tmp_path
    )

    from app.services.notification_service import NotificationService

    svc = NotificationService()
    result = await svc.send(title="X", body="Y", importance=9)
    assert result is False


@pytest.mark.asyncio
async def test_notification_ws_not_sent_below_threshold(tmp_path, monkeypatch):
    """Notifications below NOTIFICATION_MIN_IMPORTANCE don't broadcast via WS."""
    monkeypatch.setenv("NOTIFICATIONS_ENABLED", "true")
    monkeypatch.setattr(
        "app.services.notification_service.DB_PATH", tmp_path / "notif.db"
    )
    monkeypatch.setattr(
        "app.services.notification_service.DB_DIR", tmp_path
    )
    monkeypatch.setattr(
        "app.services.notification_service.NOTIFICATION_MIN_IMPORTANCE", 6
    )

    from app.services.notification_service import NotificationService

    svc = NotificationService()
    broadcast_mock = AsyncMock()
    svc.set_broadcast(broadcast_mock)

    await svc.send(title="Low", body="low importance", importance=3)
    assert broadcast_mock.call_count == 0  # not broadcast

    await svc.send(title="High", body="high importance", importance=7)
    assert broadcast_mock.call_count == 1  # broadcast


@pytest.mark.asyncio
async def test_notification_agent_rate_limit(tmp_path, monkeypatch):
    """Agent rate limiting works correctly."""
    monkeypatch.setattr(
        "app.services.notification_service.DB_PATH", tmp_path / "notif.db"
    )
    monkeypatch.setattr(
        "app.services.notification_service.DB_DIR", tmp_path
    )
    monkeypatch.setattr(
        "app.services.notification_service.RESIDENT_MAX_NOTIFICATIONS_PER_HOUR", 2
    )

    from app.services.notification_service import NotificationService

    svc = NotificationService()

    assert svc.can_agent_notify() is True
    svc.record_agent_notification()
    assert svc.can_agent_notify() is True
    svc.record_agent_notification()
    assert svc.can_agent_notify() is False


# ── API endpoint tests ───────────────────────────────────────────────────────


def test_get_notifications_endpoint(client):
    """GET /api/notifications returns valid response."""
    resp = client.get("/api/notifications")
    assert resp.status_code == 200
    data = resp.json()
    assert "notifications" in data
    assert "unread_count" in data
    assert isinstance(data["notifications"], list)


def test_mark_all_read_endpoint(client):
    """POST /api/notifications/read-all returns ok."""
    resp = client.post("/api/notifications/read-all")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_mark_single_read_not_found(client):
    """POST /api/notifications/{id}/read returns 404 for unknown ID."""
    resp = client.post("/api/notifications/nonexistent-id/read")
    assert resp.status_code == 404
