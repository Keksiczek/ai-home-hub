"""Notifications API – list, read, and mark notifications."""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.notification_service import get_notification_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
) -> dict:
    """Return notifications list with unread count."""
    svc = get_notification_service()
    return svc.list_notifications(limit=limit, offset=offset, unread_only=unread_only)


@router.post("/{notif_id}/read")
async def mark_notification_read(notif_id: str) -> dict:
    """Mark a single notification as read."""
    svc = get_notification_service()
    success = svc.mark_read(notif_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "ok", "id": notif_id}


@router.post("/read-all")
async def mark_all_read() -> dict:
    """Mark all notifications as read."""
    svc = get_notification_service()
    count = svc.mark_all_read()
    return {"status": "ok", "marked_count": count}


@router.post("/test")
async def test_notification() -> dict:
    """Send a test notification via ntfy.sh to verify configuration."""
    svc = get_notification_service()
    success = await svc.send(
        title="AI Home Hub - Test",
        body="Testovací notifikace z AI Home Hub. Notifikace fungují správně!",
        level="info",
        source="test",
        importance=8,
        priority="default",
        tags=["white_check_mark", "test_tube"],
    )
    if success:
        return {"success": True, "message": "Test notification sent"}
    return {
        "success": False,
        "error": "Failed to send notification. Check ntfy settings.",
    }
