"""Resident Plan Execution Engine – executes approved plan steps as a background job.

Follows the same pattern as resident_engine.py: receives a Job, reads plan from
ResidentPlanService, executes steps sequentially, broadcasts progress via WS.
"""

import logging
from typing import Any, Dict, List, Optional

from app.models.resident_models import PlanStep, ResidentPlan
from app.services.job_service import Job
from .coding_engine import ProgressCallback

logger = logging.getLogger(__name__)

# Tools that are allowed to actually execute something
_ALLOWED_TOOLS = frozenset({"agent", "script", "kb", "none"})

# Maximum steps per plan execution (guardrail)
_MAX_STEPS = 50

# Per-step timeout in seconds
_STEP_TIMEOUT_S = 300


async def run_resident_plan_execute(
    job: Job, progress_callback: ProgressCallback
) -> Dict[str, Any]:
    """Execute approved steps of a resident plan.

    Job payload must contain:
      - plan_id: str
      - approved_steps: list[str] | None (None = all)
      - session_id: str | None (for WS routing)
      - mode: "sequential" | "parallel" (default sequential)
    """
    from app.services.resident_plan_service import get_resident_plan_service
    from app.services.ws_manager import get_ws_manager

    plan_svc = get_resident_plan_service()
    ws = get_ws_manager()

    plan_id = job.payload.get("plan_id")
    if not plan_id:
        raise ValueError("Missing plan_id in job payload")

    plan = plan_svc.get_plan(plan_id)
    if plan is None:
        raise ValueError(f"Plan not found: {plan_id}")

    approved_step_ids: Optional[List[str]] = job.payload.get("approved_steps")
    session_id = job.payload.get("session_id")

    # Determine which steps to execute
    if approved_step_ids:
        steps_to_run = [s for s in plan.steps if s.id in approved_step_ids]
    else:
        steps_to_run = list(plan.steps)

    if not steps_to_run:
        raise ValueError("No steps to execute")

    # Guardrail: cap steps
    if len(steps_to_run) > _MAX_STEPS:
        logger.warning("Plan %s has %d steps, capping at %d", plan_id, len(steps_to_run), _MAX_STEPS)
        steps_to_run = steps_to_run[:_MAX_STEPS]

    # Mark plan as running
    plan.status = "running"
    plan.job_id = job.id
    plan_svc.save_plan(plan)

    total = len(steps_to_run)
    completed = 0
    failed_steps: List[str] = []

    async def _broadcast_plan_update(
        status: str,
        current_step: Optional[Dict[str, Any]] = None,
        result_summary: str = "",
    ) -> None:
        """Send a resident_plan_update WS message."""
        msg: Dict[str, Any] = {
            "type": "resident_plan_update",
            "plan_id": plan_id,
            "job_id": job.id,
            "status": status,
            "steps": [
                {"id": s.id, "title": s.title, "status": s.status}
                for s in plan.steps
            ],
        }
        if current_step:
            msg["current_step"] = current_step
        if result_summary:
            msg["result_summary"] = result_summary
        await ws.broadcast(msg)

    # Initial broadcast
    await _broadcast_plan_update("running")

    # Execute steps sequentially (stop_on_first_error=True)
    for i, step in enumerate(steps_to_run):
        # Validate tool
        if step.tool not in _ALLOWED_TOOLS:
            step.status = "failed"
            step.error = f"Nepovolený tool: {step.tool}"
            failed_steps.append(step.id)
            plan_svc.save_plan(plan)
            await _broadcast_plan_update(
                "running",
                current_step={"id": step.id, "status": "failed"},
            )
            break

        step.status = "running"
        plan_svc.save_plan(plan)

        progress_pct = (i / total) * 90 + 5  # 5–95%
        await progress_callback(progress_pct, f"Krok {i+1}/{total}: {step.title}")
        await _broadcast_plan_update(
            "running",
            current_step={"id": step.id, "status": "running"},
        )

        try:
            result = await _execute_step(step, plan)
            step.status = "completed"
            step.result_summary = str(result)[:500] if result else ""
            completed += 1
        except Exception as exc:
            step.status = "failed"
            step.error = str(exc)[:500]
            failed_steps.append(step.id)
            logger.error(
                "Plan %s step %s failed: %s", plan_id, step.id, exc, exc_info=True
            )
            plan_svc.save_plan(plan)
            await _broadcast_plan_update(
                "running",
                current_step={"id": step.id, "status": "failed"},
            )
            # stop_on_first_error
            break

        plan_svc.save_plan(plan)
        await _broadcast_plan_update(
            "running",
            current_step={"id": step.id, "status": "completed"},
        )

    # Final status
    if failed_steps:
        plan.status = "failed"
        plan.result_summary = f"Selhaly kroky: {', '.join(failed_steps)}"
    else:
        plan.status = "completed"
        plan.result_summary = f"Dokončeno {completed}/{total} kroků úspěšně."

    plan_svc.save_plan(plan)
    await progress_callback(100, plan.result_summary)

    # Final WS broadcast
    await _broadcast_plan_update(
        plan.status,
        result_summary=plan.result_summary,
    )

    return {
        "plan_id": plan_id,
        "status": plan.status,
        "completed_steps": completed,
        "total_steps": total,
        "failed_steps": failed_steps,
        "result_summary": plan.result_summary,
    }


async def _execute_step(step: PlanStep, plan: ResidentPlan) -> Any:
    """Execute a single plan step based on its tool type.

    Validates tool+params before execution to prevent unsafe operations.
    """
    if step.tool == "none":
        logger.info("Step %s (none): skipping – %s", step.id, step.title)
        return {"action": "skipped", "reason": "tool=none, informational step"}

    if step.tool == "agent":
        return await _execute_agent_step(step, plan)

    if step.tool == "script":
        return await _execute_script_step(step, plan)

    if step.tool == "kb":
        return await _execute_kb_step(step, plan)

    raise ValueError(f"Unknown tool type: {step.tool}")


async def _execute_agent_step(step: PlanStep, plan: ResidentPlan) -> Dict[str, Any]:
    """Spawn a sub-agent to handle this step."""
    from app.services.agent_orchestrator import get_agent_orchestrator

    orchestrator = get_agent_orchestrator()

    agent_type = step.params.get("agent_type", "general")
    task_description = step.description or step.title

    # Validate agent_type
    from app.services.agent_orchestrator import AGENT_TYPES

    if agent_type not in AGENT_TYPES:
        agent_type = "general"

    agent_id = await orchestrator.spawn_agent(
        agent_type=agent_type,
        task={"goal": task_description, "plan_step_id": step.id},
        workspace=step.params.get("workspace", "default"),
    )

    # Wait for agent completion (poll with timeout)
    import asyncio

    agent_record: Optional[Dict[str, Any]] = None
    for _ in range(_STEP_TIMEOUT_S // 5):
        await asyncio.sleep(5)
        agent_record = orchestrator.get_agent(agent_id)
        if agent_record is None:
            raise RuntimeError(f"Agent {agent_id} not found")
        if agent_record.get("status") in ("completed", "failed", "interrupted"):
            break
    else:
        raise TimeoutError(f"Agent {agent_id} did not complete within {_STEP_TIMEOUT_S}s")

    if agent_record and agent_record.get("status") == "failed":
        raise RuntimeError(
            f"Agent failed: {agent_record.get('error') or 'unknown error'}"
        )

    output = (agent_record or {}).get("output", "")
    return {
        "agent_id": agent_id,
        "status": (agent_record or {}).get("status", "unknown"),
        "output": output[:500] if output else "",
    }


async def _execute_script_step(step: PlanStep, plan: ResidentPlan) -> Dict[str, Any]:
    """Execute a script step using resident_tools.

    Only whitelisted tool names from resident_tools are allowed.
    Direct shell execution is NOT supported.
    """
    from app.services.resident_tools import execute_tool_call, TOOLS_REGISTRY

    tool_name = step.params.get("tool_name", "")
    tool_args = step.params.get("arguments", {})

    # Validate tool exists in registry
    known_tools = {t.name for t in TOOLS_REGISTRY}
    if tool_name not in known_tools:
        raise ValueError(
            f"Tool '{tool_name}' not found in resident_tools registry. "
            f"Available: {sorted(known_tools)}"
        )

    tool_call = {
        "type": "function",
        "function": {"name": tool_name, "arguments": tool_args},
    }
    result = await execute_tool_call(tool_call, {})

    if not result.get("ok", False):
        raise RuntimeError(f"Tool {tool_name} failed: {result.get('error', 'unknown')}")

    return {
        "tool": tool_name,
        "ok": result.get("ok"),
        "data": result.get("data"),
    }


async def _execute_kb_step(step: PlanStep, plan: ResidentPlan) -> Dict[str, Any]:
    """Execute a KB-related step (search or store)."""
    from app.services.resident_tools import execute_tool_call

    action = step.params.get("action", "search")
    if action == "store":
        tool_call = {
            "type": "function",
            "function": {
                "name": "kb_store",
                "arguments": {
                    "content": step.params.get("content", step.description),
                    "tags": step.params.get("tags", ["resident_plan"]),
                },
            },
        }
    else:
        tool_call = {
            "type": "function",
            "function": {
                "name": "kb_search",
                "arguments": {
                    "query": step.params.get("query", step.title),
                    "top_k": step.params.get("top_k", 5),
                },
            },
        }

    result = await execute_tool_call(tool_call, {})
    return {
        "action": action,
        "ok": result.get("ok"),
        "data": result.get("data"),
    }
