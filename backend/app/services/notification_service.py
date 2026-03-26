"""Notification service – in-app notifications with SQLite persistence and WS broadcast.

Also retains the original ntfy.sh push functionality for backward compatibility.
"""

import json
import logging
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

# ── Configuration from env vars ──────────────────────────────────────────────
NOTIFICATIONS_ENABLED = os.environ.get("NOTIFICATIONS_ENABLED", "true").lower() == "true"
NOTIFICATION_MIN_IMPORTANCE = int(os.environ.get("NOTIFICATION_MIN_IMPORTANCE", "6"))
RESIDENT_MAX_NOTIFICATIONS_PER_HOUR = int(
    os.environ.get("RESIDENT_MAX_NOTIFICATIONS_PER_HOUR", "3")
)

# SQLite storage
DB_DIR = Path(__file__).parent.parent.parent / "data"
DB_PATH = DB_DIR / "notifications.db"
MAX_NOTIFICATIONS = 100

_SCHEMA = """
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    level TEXT NOT NULL DEFAULT 'info',
    source TEXT NOT NULL DEFAULT 'system',
    action_url TEXT DEFAULT NULL,
    importance INTEGER NOT NULL DEFAULT 5,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(read);
"""


class NotificationService:
    """In-app notification service with SQLite persistence and WS broadcast."""

    def __init__(self) -> None:
        self._settings = get_settings_service()
        self._broadcast_fn = None
        DB_DIR.mkdir(parents=True, exist_ok=True)
        self._db_path = str(DB_PATH)
        self._init_schema()
        # Rate limit counter for agent-sent notifications
        self._agent_notifications_this_hour: int = 0
        self._agent_notifications_hour: int = -1

    def set_broadcast(self, fn) -> None:
        """Register the WS broadcast coroutine."""
        self._broadcast_fn = fn

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def _init_schema(self) -> None:
        try:
            conn = self._get_conn()
            conn.executescript(_SCHEMA)
            conn.close()
            logger.info("NotificationService DB initialized at %s", self._db_path)
        except Exception as exc:
            logger.error("Failed to init notifications DB: %s", exc)

    # ── Rate limiting for agent-sent notifications ───────────────────────────

    def _refresh_agent_rate_limit(self) -> None:
        current_hour = datetime.now(timezone.utc).hour
        if current_hour != self._agent_notifications_hour:
            self._agent_notifications_this_hour = 0
            self._agent_notifications_hour = current_hour

    def can_agent_notify(self) -> bool:
        """Check if the agent hasn't exceeded hourly notification limit."""
        self._refresh_agent_rate_limit()
        return self._agent_notifications_this_hour < RESIDENT_MAX_NOTIFICATIONS_PER_HOUR

    def record_agent_notification(self) -> None:
        """Record that the agent sent a notification."""
        self._refresh_agent_rate_limit()
        self._agent_notifications_this_hour += 1

    # ── Core send method ─────────────────────────────────────────────────────

    async def send(
        self,
        title: str,
        body: str = "",
        level: str = "info",
        source: str = "system",
        action_url: Optional[str] = None,
        importance: int = 5,
        # Legacy kwargs for backward compatibility with ntfy.sh callers
        message: str = "",
        priority: str = "default",
        tags: Optional[list] = None,
    ) -> bool:
        """Create a notification, persist to DB, and broadcast via WS.

        Backward compatible: accepts ``message`` as alias for ``body``,
        and ``priority``/``tags`` for ntfy.sh push.

        Returns True on success.
        """
        # Legacy compat: 'message' param maps to 'body'
        if message and not body:
            body = message

        if not NOTIFICATIONS_ENABLED:
            return False

        if level not in ("info", "warning", "alert", "insight"):
            level = "info"

        importance = max(1, min(10, importance))

        notif_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        # Always persist to DB
        try:
            conn = self._get_conn()
            conn.execute(
                """INSERT INTO notifications (id, title, body, level, source,
                   action_url, importance, read, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)""",
                (notif_id, title[:200], body[:1000], level, source[:100],
                 action_url, importance, created_at),
            )
            conn.commit()

            # FIFO pruning: keep only MAX_NOTIFICATIONS
            count_row = conn.execute(
                "SELECT COUNT(*) as cnt FROM notifications"
            ).fetchone()
            if count_row and count_row["cnt"] > MAX_NOTIFICATIONS:
                conn.execute(
                    """DELETE FROM notifications WHERE id NOT IN (
                        SELECT id FROM notifications ORDER BY created_at DESC LIMIT ?
                    )""",
                    (MAX_NOTIFICATIONS,),
                )
                conn.commit()

            conn.close()
        except Exception as exc:
            logger.error("Failed to persist notification: %s", exc)
            return False

        # Broadcast via WS only if importance >= threshold
        if importance >= NOTIFICATION_MIN_IMPORTANCE and self._broadcast_fn:
            try:
                await self._broadcast_fn({
                    "type": "notification",
                    "id": notif_id,
                    "title": title[:200],
                    "body": body[:1000],
                    "level": level,
                    "source": source[:100],
                    "action_url": action_url,
                    "importance": importance,
                    "read": False,
                    "created_at": created_at,
                })
            except Exception as exc:
                logger.debug("Notification WS broadcast failed: %s", exc)

        # Also push to ntfy.sh if configured (legacy)
        try:
            cfg = self._settings.get_notification_config()
            if cfg.get("enabled", False):
                ntfy_url = cfg.get("ntfy_url", "https://ntfy.sh").rstrip("/")
                topic = cfg.get("topic", "ai-home-hub")
                url = f"{ntfy_url}/{topic}"
                headers = {
                    "Title": title,
                    "Priority": priority,
                    "Content-Type": "text/plain",
                }
                if tags:
                    headers["Tags"] = ",".join(tags)
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(
                        url, content=(body or message).encode(), headers=headers
                    )
                    resp.raise_for_status()
        except Exception as exc:
            logger.debug("ntfy.sh push failed (non-critical): %s", exc)

        return True

    # ── Legacy convenience methods (backward compat) ─────────────────────────

    async def notify_task_complete(
        self, task_name: str, result: str = "completed"
    ) -> bool:
        return await self.send(
            title=f"Task {result}",
            body=f"'{task_name}' {result}",
            level="info",
            source="job_worker",
            importance=4,
            tags=["white_check_mark"],
        )

    async def notify_agent_complete(self, agent_id: str, agent_type: str) -> bool:
        return await self.send(
            title="Agent finished",
            body=f"{agent_type} agent {agent_id[:8]} completed",
            level="info",
            source="agent",
            importance=4,
            tags=["robot"],
        )

    async def notify_error(self, context: str, error: str) -> bool:
        return await self.send(
            title="Error",
            body=f"{context}: {error}",
            level="alert",
            source="system",
            importance=8,
            priority="high",
            tags=["x"],
        )

    # ── Query methods for REST API ───────────────────────────────────────────

    def list_notifications(
        self,
        limit: int = 50,
        offset: int = 0,
        unread_only: bool = False,
    ) -> Dict[str, Any]:
        """Return notifications list + unread count."""
        try:
            conn = self._get_conn()
            query = "SELECT * FROM notifications"
            params: list = []
            if unread_only:
                query += " WHERE read = 0"
            query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])

            rows = conn.execute(query, params).fetchall()

            unread_row = conn.execute(
                "SELECT COUNT(*) as cnt FROM notifications WHERE read = 0"
            ).fetchone()
            unread_count = unread_row["cnt"] if unread_row else 0

            conn.close()

            notifications = []
            for r in rows:
                notifications.append({
                    "id": r["id"],
                    "title": r["title"],
                    "body": r["body"],
                    "level": r["level"],
                    "source": r["source"],
                    "action_url": r["action_url"],
                    "importance": r["importance"],
                    "read": bool(r["read"]),
                    "created_at": r["created_at"],
                })

            return {"notifications": notifications, "unread_count": unread_count}
        except Exception as exc:
            logger.error("Failed to list notifications: %s", exc)
            return {"notifications": [], "unread_count": 0}

    def mark_read(self, notif_id: str) -> bool:
        """Mark a single notification as read."""
        try:
            conn = self._get_conn()
            cursor = conn.execute(
                "UPDATE notifications SET read = 1 WHERE id = ?", (notif_id,)
            )
            conn.commit()
            changed = cursor.rowcount > 0
            conn.close()
            return changed
        except Exception as exc:
            logger.error("Failed to mark notification read: %s", exc)
            return False

    def mark_all_read(self) -> int:
        """Mark all notifications as read. Returns count of updated rows."""
        try:
            conn = self._get_conn()
            cursor = conn.execute("UPDATE notifications SET read = 1 WHERE read = 0")
            conn.commit()
            count = cursor.rowcount
            conn.close()
            return count
        except Exception as exc:
            logger.error("Failed to mark all notifications read: %s", exc)
            return 0


# Singleton
_notification_service: Optional[NotificationService] = None


def get_notification_service() -> NotificationService:
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService()
    return _notification_service
