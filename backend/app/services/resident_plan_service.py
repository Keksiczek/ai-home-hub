"""Resident Plan Service – storage and management for Plan → Confirm → Execute flow.

Plans are stored as individual JSON files in data/resident_plans/{plan_id}.json,
following the same pattern as data/artifacts/ for agents.

Lifecycle:
    1. Reasoner generates plan → status = ``pending_approval``
    2. User reviews via API → ``approved`` or ``rejected``
    3. Tool executor picks up ``approved`` plans → ``running`` → ``executed``/``failed``
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from app.models.resident_models import ResidentPlan

logger = logging.getLogger(__name__)

PLANS_DIR = Path(__file__).parent.parent.parent / "data" / "resident_plans"


class ResidentPlanService:
    """CRUD operations for resident plans with JSON file persistence."""

    def __init__(self) -> None:
        PLANS_DIR.mkdir(parents=True, exist_ok=True)

    def _plan_path(self, plan_id: str) -> Path:
        # Sanitize plan_id to prevent path traversal
        safe_id = plan_id.replace("/", "").replace("..", "")
        return PLANS_DIR / f"{safe_id}.json"

    def save_plan(self, plan: ResidentPlan) -> ResidentPlan:
        """Persist a plan to disk."""
        path = self._plan_path(plan.plan_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(plan.model_dump(), f, indent=2, ensure_ascii=False)
        logger.info("Plan saved: %s (%s)", plan.plan_id, plan.status)
        return plan

    def get_plan(self, plan_id: str) -> Optional[ResidentPlan]:
        """Load a plan from disk. Returns None if not found."""
        path = self._plan_path(plan_id)
        if not path.exists():
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return ResidentPlan(**data)
        except (json.JSONDecodeError, Exception) as exc:
            logger.error("Failed to load plan %s: %s", plan_id, exc)
            return None

    def list_plans(
        self, limit: int = 20, status: Optional[str] = None
    ) -> List[ResidentPlan]:
        """List recent plans, sorted by created_at descending.

        If *status* is given, only plans with that status are returned.
        """
        plans: List[ResidentPlan] = []
        for path in sorted(
            PLANS_DIR.glob("*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        ):
            if len(plans) >= limit:
                break
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                plan = ResidentPlan(**data)
                if status and plan.status != status:
                    continue
                plans.append(plan)
            except Exception as exc:
                logger.debug("Skipping malformed plan file %s: %s", path.name, exc)
        return plans

    def approve_plan(self, plan_id: str) -> Optional[ResidentPlan]:
        """Mark a pending_approval plan as approved. Returns updated plan or None."""
        plan = self.get_plan(plan_id)
        if not plan:
            return None
        if plan.status != "pending_approval":
            logger.warning(
                "Cannot approve plan %s: status is %s (expected pending_approval)",
                plan_id,
                plan.status,
            )
            return None
        plan.status = "approved"
        plan.meta["approved_at"] = datetime.now(timezone.utc).isoformat()
        return self.save_plan(plan)

    def reject_plan(self, plan_id: str, reason: str = "") -> Optional[ResidentPlan]:
        """Mark a pending_approval plan as rejected. Returns updated plan or None."""
        plan = self.get_plan(plan_id)
        if not plan:
            return None
        if plan.status != "pending_approval":
            logger.warning(
                "Cannot reject plan %s: status is %s (expected pending_approval)",
                plan_id,
                plan.status,
            )
            return None
        plan.status = "rejected"
        plan.meta["rejected_at"] = datetime.now(timezone.utc).isoformat()
        if reason:
            plan.meta["rejection_reason"] = reason
        return self.save_plan(plan)

    def mark_executed(
        self, plan_id: str, result_summary: str = ""
    ) -> Optional[ResidentPlan]:
        """Mark an approved/running plan as executed (completed)."""
        plan = self.get_plan(plan_id)
        if not plan:
            return None
        if plan.status not in ("approved", "running"):
            logger.warning(
                "Cannot mark plan %s as executed: status is %s",
                plan_id,
                plan.status,
            )
            return None
        plan.status = "executed"
        plan.result_summary = result_summary
        plan.meta["executed_at"] = datetime.now(timezone.utc).isoformat()
        return self.save_plan(plan)

    def delete_plan(self, plan_id: str) -> bool:
        """Delete a plan file. Returns True if found and deleted."""
        path = self._plan_path(plan_id)
        if path.exists():
            path.unlink()
            logger.info("Plan deleted: %s", plan_id)
            return True
        return False


# Shared singleton
_plan_service = ResidentPlanService()


def get_resident_plan_service() -> ResidentPlanService:
    return _plan_service
