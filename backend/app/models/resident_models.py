"""Pydantic models for the Resident Agent brain orchestrator.

Covers autonomy modes, suggested actions, missions, and reflections.
"""
from datetime import datetime, timezone
from typing import List, Literal, Optional
import uuid

from pydantic import BaseModel, Field


# ── Autonomy Mode ────────────────────────────────────────────

ResidentMode = Literal["observer", "advisor", "autonomous"]


# ── Suggested Actions ────────────────────────────────────────

class SuggestedAction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str
    description: str
    action_type: Literal[
        "kb_maintenance", "job_cleanup", "health_check", "analysis", "other"
    ]
    priority: Literal["low", "medium", "high"]
    requires_confirmation: bool = True
    estimated_cost: str = ""
    steps: List[str] = []


class ResidentSuggestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    mode: ResidentMode
    actions: List[SuggestedAction] = []
    context_summary: str = ""
    executed_action_ids: List[str] = Field(default_factory=list)


# ── Missions ─────────────────────────────────────────────────

class MissionStep(BaseModel):
    title: str
    description: str = ""
    status: Literal["pending", "running", "succeeded", "failed", "skipped"] = "pending"
    result_summary: str = ""
    job_id: Optional[str] = None


class MissionPlan(BaseModel):
    goal: str
    steps: List[MissionStep] = []
    current_step: int = 0
    status: Literal["planned", "in_progress", "done", "error"] = "planned"


class MissionCreateRequest(BaseModel):
    goal: str
    context: str = ""
    collection: str = ""


# ── Reflections ──────────────────────────────────────────────

class ResidentReflection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    job_id: str
    job_type: str
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    points: List[str] = []
    useful: Optional[bool] = None
    recommendation: str = ""
