"""Resident Curiosity Service – backlog of questions, hypotheses, anomalies and ideas.

The resident agent maintains a curiosity backlog: things it wants to investigate,
anomalies it noticed, or ideas for improvement.  Items are created by deterministic
hooks (job failures, metric anomalies, KB gaps) and consumed by ``_curiosity_tick``
in the agent core which turns them into safe analysis jobs.

Persistence: individual JSON files in ``data/resident_curiosity/{id}.json``,
following the same pattern as ``resident_plan_service``.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from app.models.resident_models import CuriosityItem

logger = logging.getLogger(__name__)

CURIOSITY_DIR = Path(__file__).parent.parent.parent / "data" / "resident_curiosity"


class CuriosityService:
    """CRUD operations for the curiosity backlog with JSON file persistence."""

    def __init__(self) -> None:
        CURIOSITY_DIR.mkdir(parents=True, exist_ok=True)

    def _item_path(self, item_id: str) -> Path:
        safe_id = item_id.replace("/", "").replace("..", "")
        return CURIOSITY_DIR / f"{safe_id}.json"

    # ── Create ──────────────────────────────────────────────────

    def create_item(
        self,
        title: str,
        kind: str = "question",
        source: str = "",
        detail: str = "",
        priority: str = "medium",
        related_job_ids: Optional[List[str]] = None,
        related_mission_ids: Optional[List[str]] = None,
    ) -> CuriosityItem:
        """Create and persist a new curiosity item."""
        item = CuriosityItem(
            kind=kind,
            source=source,
            title=title[:120],
            detail=detail[:500],
            priority=priority,
            related_job_ids=related_job_ids or [],
            related_mission_ids=related_mission_ids or [],
        )
        self._save(item)
        logger.info("Curiosity item created: %s [%s] %s", item.id, kind, title[:60])
        return item

    # ── Read ────────────────────────────────────────────────────

    def get_item(self, item_id: str) -> Optional[CuriosityItem]:
        """Load a single item by ID."""
        path = self._item_path(item_id)
        if not path.exists():
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                return CuriosityItem(**json.load(f))
        except Exception as exc:
            logger.error("Failed to load curiosity item %s: %s", item_id, exc)
            return None

    def list_items(
        self,
        status: Optional[str] = None,
        kind: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 50,
    ) -> List[CuriosityItem]:
        """List items sorted by priority (high first) then oldest updated_at first."""
        items: List[CuriosityItem] = []
        for path in CURIOSITY_DIR.glob("*.json"):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    item = CuriosityItem(**json.load(f))
                if status and item.status != status:
                    continue
                if kind and item.kind != kind:
                    continue
                if priority and item.priority != priority:
                    continue
                items.append(item)
            except Exception as exc:
                logger.debug("Skipping malformed curiosity file %s: %s", path.name, exc)

        # Sort: high > medium > low, then oldest updated_at first
        priority_order = {"high": 0, "medium": 1, "low": 2}
        items.sort(key=lambda i: (priority_order.get(i.priority, 9), i.updated_at))
        return items[:limit]

    def pick_next_open(self) -> Optional[CuriosityItem]:
        """Return the highest-priority, least-recently-touched open item."""
        items = self.list_items(status="open", limit=1)
        return items[0] if items else None

    # ── Update ──────────────────────────────────────────────────

    def update_item_status(self, item_id: str, status: str) -> Optional[CuriosityItem]:
        """Change an item's status and touch updated_at."""
        item = self.get_item(item_id)
        if not item:
            return None
        item.status = status
        item.updated_at = datetime.now(timezone.utc).isoformat()
        self._save(item)
        logger.info("Curiosity %s status → %s", item_id, status)
        return item

    def touch_item(self, item_id: str) -> Optional[CuriosityItem]:
        """Bump updated_at without changing status (push to back of queue)."""
        item = self.get_item(item_id)
        if not item:
            return None
        item.updated_at = datetime.now(timezone.utc).isoformat()
        self._save(item)
        return item

    # ── Persistence ─────────────────────────────────────────────

    def _save(self, item: CuriosityItem) -> None:
        path = self._item_path(item.id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(item.model_dump(), f, indent=2, ensure_ascii=False)

    # ── Duplicate guard ─────────────────────────────────────────

    def has_recent_similar(self, title_prefix: str, hours: int = 24) -> bool:
        """Check if an open/in_progress item with a similar title exists recently."""
        from datetime import timedelta

        cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
        for item in self.list_items(status="open", limit=200):
            if item.title.startswith(title_prefix) and item.created_at >= cutoff:
                return True
        for item in self.list_items(status="in_progress", limit=200):
            if item.title.startswith(title_prefix) and item.created_at >= cutoff:
                return True
        return False

    # ── Hook helpers (deterministic, no LLM) ────────────────────

    def hook_job_failure(self, job_id: str, job_type: str, error: str) -> Optional[CuriosityItem]:
        """Create a curiosity item when a resident job fails."""
        title_prefix = f"Selhání jobu typu {job_type}"
        if self.has_recent_similar(title_prefix, hours=12):
            return None  # already tracked

        return self.create_item(
            kind="anomaly",
            source="job_failure",
            title=f"{title_prefix}"[:120],
            detail=f"Job {job_id} selhal: {error[:300]}"[:500],
            priority="high",
            related_job_ids=[job_id],
        )

    def hook_low_success_rate(self, success_rate: float, failed_count: int) -> Optional[CuriosityItem]:
        """Create a curiosity item when job success rate drops below threshold."""
        title_prefix = "Nízká úspěšnost jobů"
        if self.has_recent_similar(title_prefix, hours=24):
            return None

        return self.create_item(
            kind="hypothesis",
            source="lean_metrics",
            title=f"Nízká úspěšnost jobů za posledních 24 h ({success_rate:.0%})"[:120],
            detail=(
                f"Success rate ~{success_rate:.0%}, "
                f"počet selhání: {failed_count}. "
                "Doporučeno zjistit příčiny."
            )[:500],
            priority="medium",
        )

    def hook_kb_gap(self, gap_description: str) -> Optional[CuriosityItem]:
        """Create a curiosity item when KB has gaps (few chunks, missing collection)."""
        title_prefix = "Rozšířit KB"
        if self.has_recent_similar(title_prefix, hours=48):
            return None

        return self.create_item(
            kind="idea",
            source="kb_stats",
            title=f"Rozšířit KB: {gap_description}"[:120],
            detail=f"Knowledge base má mezery: {gap_description}"[:500],
            priority="low",
        )


# ── Singleton ───────────────────────────────────────────────

_instance: Optional[CuriosityService] = None


def get_curiosity_service() -> CuriosityService:
    global _instance
    if _instance is None:
        _instance = CuriosityService()
    return _instance
