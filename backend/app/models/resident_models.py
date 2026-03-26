"""Pydantic models for the Resident Agent brain orchestrator.

Covers autonomy modes, suggested actions, missions, reflections,
and tool-calling reasoning cycles.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional
import uuid

from pydantic import BaseModel, Field

# ── Autonomy Mode ────────────────────────────────────────────

ResidentMode = Literal["observer", "advisor", "autonomous"]


# ── Suggested Actions ────────────────────────────────────────


class SuggestedAction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str
    description: str = ""
    action_type: Literal[
        "kb_maintenance", "job_cleanup", "health_check", "analysis", "other"
    ] = "other"
    # Direct action name for dispatch (e.g. "git_status", "system_health")
    action: str = ""
    priority: Literal["low", "medium", "high"] = "medium"
    requires_confirmation: bool = True
    estimated_cost: str = ""
    steps: List[str] = []
    # Agent's internal reasoning / thought about why this action is proposed
    thought: str = ""
    # Optional params for direct dispatch
    params: Dict[str, Any] = Field(default_factory=dict)


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
    output: str = ""  # Final mission output / summary


class MissionCreateRequest(BaseModel):
    goal: str
    context: str = ""
    collection: str = ""


# ── Mission Chat ────────────────────────────────────────────


class MissionChatMessage(BaseModel):
    """A single chat message in a mission's chat history."""

    role: Literal["user", "assistant"]
    content: str
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


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


# ── Tool-calling reasoning cycles ───────────────────────────


# ── Resident Plan (Plan → Confirm → Execute) ───────────────


class PlanStep(BaseModel):
    """Single step in a resident plan."""

    id: str = Field(default_factory=lambda: f"step-{uuid.uuid4().hex[:6]}")
    title: str
    description: str = ""
    tool: Literal["agent", "script", "kb", "none"] = "none"
    params: Dict[str, Any] = Field(default_factory=dict)
    depends_on: List[str] = Field(default_factory=list)
    status: Literal["pending", "running", "completed", "failed", "skipped"] = "pending"
    result_summary: str = ""
    error: Optional[str] = None


class ResidentPlan(BaseModel):
    """Full resident plan with steps, stored as JSON file.

    Lifecycle:  draft → pending_approval → approved → running → completed/failed
                                         ↘ rejected

    The ``pending_approval`` state is the default after the reasoner generates
    a plan.  The plan must be explicitly approved via API before any tools
    execute its steps.  ``executed`` is an alias for ``completed`` kept for
    backward compatibility with code that checks ``plan.status == "executed"``.
    """

    plan_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal[
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "running",
        "completed",
        "failed",
        "executed",
    ] = "draft"
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    goal: str
    steps: List[PlanStep] = Field(default_factory=list)
    raw_markdown: str = ""
    meta: Dict[str, Any] = Field(default_factory=dict)
    approved_steps: Optional[List[str]] = None
    execution_mode: Literal["sequential", "parallel"] = "sequential"
    job_id: Optional[str] = None
    result_summary: str = ""
    impact_assessment: str = ""
    risk_level: Literal["low", "medium", "high"] = "low"


class PlanCreateRequest(BaseModel):
    """Request body for POST /resident/plan."""

    goal: str = Field(..., min_length=1, max_length=1000)
    context: Dict[str, Any] = Field(default_factory=dict)


class PlanApproveRequest(BaseModel):
    """Request body for POST /resident/plan/{plan_id}/approve."""

    approved_steps: Optional[List[str]] = None
    mode: Literal["sequential", "parallel"] = "sequential"


# ── Tool-calling reasoning cycles ───────────────────────────


class ToolCallRecord(BaseModel):
    """One tool invocation inside a reasoning cycle."""

    tool_name: str
    arguments: Dict[str, Any] = {}
    result: Dict[str, Any] = {}
    ok: bool = True
    duration_ms: int = 0


class ResidentReasoningCycle(BaseModel):
    """Complete record of one tool-augmented reasoning pass."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    context_summary: str = ""
    tools_used: List[str] = []
    tool_calls: List[ToolCallRecord] = []
    final_suggestions: List[SuggestedAction] = []
    model: str = ""
    total_duration_ms: int = 0


# ── Curiosity Backlog ───────────────────────────────────────


class CuriosityItem(BaseModel):
    """A single item in the resident agent's curiosity backlog."""

    id: str = Field(default_factory=lambda: f"cur-{uuid.uuid4().hex[:8]}")
    kind: Literal["question", "hypothesis", "anomaly", "idea"] = "question"
    source: str = (
        ""  # e.g. "job_failure", "lean_metrics", "kb_stats", "manual", "reasoner"
    )
    title: str = Field(..., max_length=120)
    detail: str = ""  # max ~500 chars
    dedup_key: str = ""  # e.g. "job_failure:anomaly:resident_task" for deduplication
    priority: Literal["medium", "high"] = "medium"
    status: Literal["open", "in_progress", "done", "dropped"] = "open"
    resolution_summary: str = ""  # brief summary when item is resolved
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    related_job_ids: List[str] = Field(default_factory=list)
    related_mission_ids: List[str] = Field(default_factory=list)
