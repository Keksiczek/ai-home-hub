"""Resident Agent – pending action queue (get/approve/reject)."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List, Optional


class PendingActionsMixin:
    """Mixin providing pending actions queue for ResidentAgent."""

    def get_pending_actions(self) -> List[dict]:
        """Return list of pending actions waiting for user approval."""
        return list(self._pending_actions)

    def add_pending_action(
        self,
        action_type: str,
        description: str,
        params: Optional[dict] = None,
    ) -> dict:
        """Add a new pending action to the queue."""
        action = {
            "id": str(uuid.uuid4()),
            "action_type": action_type,
            "description": description,
            "params": params or {},
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._pending_actions.append(action)
        if len(self._pending_actions) > 50:
            self._pending_actions = self._pending_actions[-50:]
        return action

    def approve_action(self, action_id: str) -> Optional[dict]:
        """Approve a pending action. Returns the action dict or None if not found."""
        for action in self._pending_actions:
            if action["id"] == action_id and action["status"] == "pending":
                action["status"] = "approved"
                self._add_log("INFO", "pending_action_approved", action_id=action_id)
                return action
        return None

    def reject_action(self, action_id: str) -> Optional[dict]:
        """Reject a pending action. Returns the action dict or None if not found."""
        for action in self._pending_actions:
            if action["id"] == action_id and action["status"] == "pending":
                action["status"] = "rejected"
                self._add_log("INFO", "pending_action_rejected", action_id=action_id)
                return action
        return None
