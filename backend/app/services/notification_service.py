"""Notification service – push notifications via ntfy.sh."""
import logging
from typing import Optional

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self) -> None:
        self._settings = get_settings_service()

    async def send(
        self,
        title: str,
        message: str,
        priority: str = "default",
        tags: Optional[list] = None,
    ) -> bool:
        """
        Send a push notification via ntfy.sh.

        Returns True on success, False on failure (silently degrades).
        """
        cfg = self._settings.get_notification_config()
        if not cfg.get("enabled", False):
            return False

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

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(url, content=message.encode(), headers=headers)
                resp.raise_for_status()
                return True
        except Exception as exc:
            logger.warning("Notification failed: %s", exc)
            return False

    async def notify_task_complete(self, task_name: str, result: str = "completed") -> bool:
        return await self.send(
            title=f"Task {result}",
            message=f"'{task_name}' {result}",
            tags=["white_check_mark"],
        )

    async def notify_agent_complete(self, agent_id: str, agent_type: str) -> bool:
        return await self.send(
            title="Agent finished",
            message=f"{agent_type} agent {agent_id[:8]} completed",
            tags=["robot"],
        )

    async def notify_error(self, context: str, error: str) -> bool:
        return await self.send(
            title="Error",
            message=f"{context}: {error}",
            priority="high",
            tags=["x"],
        )


_notification_service: Optional[NotificationService] = None


def get_notification_service() -> NotificationService:
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService()
    return _notification_service
