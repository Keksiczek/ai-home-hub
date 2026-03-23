"""Mode audit service – tracks resident agent mode changes in a ring buffer."""

from collections import deque
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Optional


@dataclass
class ModeChangeRecord:
    timestamp: str
    from_mode: str
    to_mode: str
    changed_by: str  # "user" | "system" | "api"
    reason: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


class ModeAuditService:
    """Holds an in-memory ring buffer of the last 50 mode changes."""

    _MAX_HISTORY = 50

    def __init__(self) -> None:
        self._history: deque = deque(maxlen=self._MAX_HISTORY)

    def record_change(
        self,
        from_mode: str,
        to_mode: str,
        changed_by: str = "api",
        reason: str = "",
    ) -> None:
        """Append a new mode change record."""
        record = ModeChangeRecord(
            timestamp=datetime.now(timezone.utc).isoformat(),
            from_mode=from_mode,
            to_mode=to_mode,
            changed_by=changed_by,
            reason=reason,
        )
        self._history.append(record)

    def get_history(self, limit: int = 20) -> list:
        """Return the last *limit* mode changes as dicts (oldest first)."""
        items = list(self._history)
        return [r.to_dict() for r in items[-limit:]]


# ── Singleton ─────────────────────────────────────────────────────────────────

_mode_audit_service: Optional[ModeAuditService] = None


def get_mode_audit_service() -> ModeAuditService:
    global _mode_audit_service
    if _mode_audit_service is None:
        _mode_audit_service = ModeAuditService()
    return _mode_audit_service
