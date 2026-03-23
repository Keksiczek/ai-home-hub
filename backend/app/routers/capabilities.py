"""Capabilities API – manage system-access capabilities, approvals, audit, and killswitch."""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.capabilities import get_capability_registry
from app.services.sandbox_executor import get_sandbox_executor
from app.db.audit_log import get_audit_log_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/capabilities", tags=["capabilities"])


# ── Request models ───────────────────────────────────────────


class CapabilityExecuteRequest(BaseModel):
    capability: str = Field(..., min_length=1, max_length=50)
    params: Dict[str, Any] = {}


class ApprovalActionRequest(BaseModel):
    action: str = Field(..., pattern=r"^(approve|deny)$")


class KillswitchRequest(BaseModel):
    action: str = Field(..., pattern=r"^(stop|resume)$")
    reason: str = ""


# ── Registry endpoints ───────────────────────────────────────


@router.get("/registry")
async def get_registry() -> dict:
    """Get the full capability registry with current state."""
    registry = get_capability_registry()
    return registry.to_dict()


@router.get("/registry/{cap_name}")
async def get_capability(cap_name: str) -> dict:
    """Get a single capability definition."""
    registry = get_capability_registry()
    cap = registry.get(cap_name)
    if cap is None:
        raise HTTPException(404, f"Capability '{cap_name}' not found")
    return {
        "capability": cap.to_dict(),
        "requires_approval": registry.requires_approval(cap_name),
    }


# ── Execution endpoint ──────────────────────────────────────


@router.post("/execute")
async def execute_capability(req: CapabilityExecuteRequest) -> dict:
    """Execute a capability through the sandbox executor.

    Low-risk actions execute immediately.
    Medium-risk actions execute with notification.
    High-risk actions require prior approval.
    """
    executor = get_sandbox_executor()
    result = executor.execute(req.capability, req.params)

    if result.status == "blocked":
        raise HTTPException(403, result.error)

    return result.to_dict()


# ── Approval management ─────────────────────────────────────


@router.get("/approvals")
async def get_pending_approvals() -> dict:
    """List pending high-risk capability approval requests."""
    registry = get_capability_registry()
    pending = registry.get_pending_approvals()
    return {"approvals": pending, "count": len(pending)}


@router.post("/approvals/{approval_id}")
async def handle_approval(approval_id: str, req: ApprovalActionRequest) -> dict:
    """Approve or deny a pending capability request."""
    registry = get_capability_registry()
    audit = get_audit_log_db()

    if req.action == "approve":
        ok = registry.approve(approval_id)
        if not ok:
            raise HTTPException(404, "Approval not found or already processed")
        audit.log(
            capability="approval_system",
            action="approve",
            result_status="ok",
            result_summary=f"Approved: {approval_id}",
            approved_by="user",
        )
        return {"status": "approved", "approval_id": approval_id}
    else:
        ok = registry.deny(approval_id)
        if not ok:
            raise HTTPException(404, "Approval not found or already processed")
        audit.log(
            capability="approval_system",
            action="deny",
            result_status="ok",
            result_summary=f"Denied: {approval_id}",
            approved_by="user",
        )
        return {"status": "denied", "approval_id": approval_id}


# ── Audit trail ──────────────────────────────────────────────


@router.get("/audit")
async def get_audit_trail(
    limit: int = Query(default=50, ge=1, le=500),
    capability: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> dict:
    """Get recent audit log entries."""
    audit = get_audit_log_db()
    entries = audit.get_entries(
        limit=limit, capability=capability, result_status=status
    )
    return {"entries": entries, "count": len(entries)}


@router.get("/audit/stats")
async def get_audit_stats() -> dict:
    """Get audit log statistics."""
    audit = get_audit_log_db()
    return audit.get_stats()


# ── Killswitch ───────────────────────────────────────────────


@router.post("/killswitch")
async def killswitch(req: KillswitchRequest) -> dict:
    """Emergency stop or resume all capabilities."""
    registry = get_capability_registry()
    executor = get_sandbox_executor()
    audit = get_audit_log_db()

    if req.action == "stop":
        # Kill running processes
        killed = executor.kill_all()
        # Block registry
        registry.emergency_stop(reason=req.reason)
        audit.log(
            capability="killswitch",
            action="emergency_stop",
            result_status="ok",
            result_summary=f"Emergency stop activated. Killed {killed} processes. Reason: {req.reason}",
            risk_tier="high",
            approved_by="user",
        )
        logger.warning(
            "KILLSWITCH ACTIVATED: %s (killed %d processes)", req.reason, killed
        )
        return {
            "status": "stopped",
            "killed_processes": killed,
            "reason": req.reason,
            "message": "All capabilities blocked. Use resume to re-enable.",
        }
    else:
        registry.resume()
        audit.log(
            capability="killswitch",
            action="resume",
            result_status="ok",
            result_summary="Capabilities resumed",
            approved_by="user",
        )
        logger.info("Killswitch released – capabilities resumed")
        return {"status": "resumed", "message": "Capabilities re-enabled."}


@router.get("/killswitch/status")
async def killswitch_status() -> dict:
    """Get current killswitch state."""
    registry = get_capability_registry()
    return {
        "enabled": registry.is_enabled,
        "blocked": registry.is_blocked,
    }


# ── System info (for autonomous goal generation) ─────────────


@router.get("/system-state")
async def get_system_state() -> dict:
    """Get current system state for autonomous goal generation."""
    executor = get_sandbox_executor()
    result = executor.execute("system_monitor", {})
    return {
        "system": result.metadata if result.status == "ok" else {},
        "status": result.status,
        "error": result.error,
    }
