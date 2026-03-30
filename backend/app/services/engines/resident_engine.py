"""Resident agent task engine."""

import asyncio
import json
import logging
import time
from typing import Any, Dict

from app.services.job_service import Job
from .coding_engine import ProgressCallback

logger = logging.getLogger(__name__)

# Tags that qualify for the post-action LLM reasoning loop
_REASONING_TAGS = frozenset({"resident_task", "curiosity_task"})

# Maximum time for the entire reasoning loop (tool call + LLM analysis + optional memory store)
_REASONING_LOOP_TIMEOUT_S = 60


async def _llm_reasoning_loop(
    job: Job,
    raw_result: Dict[str, Any],
    progress_callback: ProgressCallback,
) -> Dict[str, Any]:
    """Post-action LLM reasoning loop for resident_task / curiosity_task jobs.

    Takes the raw tool result, asks LLM to analyse it in context of the job goal,
    and optionally stores conclusions in memory.  Returns the enriched result dict.
    Falls back to raw_result if LLM is unavailable or times out.
    """
    from app.services.llm_service import get_llm_service, resolve_model

    llm_svc = get_llm_service()

    # Use the general model (not reasoner) for simple analysis
    model = resolve_model("general")

    goal = job.title or ""
    description = job.input_summary or job.payload.get("description", "")
    raw_str = json.dumps(raw_result, ensure_ascii=False, default=str)[:2000]

    analysis_prompt = (
        f"Jsi AI asistent. Právě byl proveden tool call jako součást úkolu.\n\n"
        f"## Úkol\nCíl: {goal}\nPopis: {description}\n\n"
        f"## Výsledek tool callu\n```json\n{raw_str}\n```\n\n"
        f"## Instrukce\n"
        f"1. Analyzuj výsledek tool callu v kontextu zadaného úkolu.\n"
        f"2. Shrň co výsledek znamená (max 3 věty).\n"
        f"3. Rozhodni zda je potřeba něco zapsat do paměti. Pokud ano, "
        f"vrať klíč 'memory_note' s textem k zapamatování.\n\n"
        f"Odpověz POUZE validním JSON:\n"
        f'{{"summary": "...", "conclusion": "...", "memory_note": "..." nebo null}}'
    )

    await progress_callback(50, "LLM analyzuje výsledek...")

    try:
        reply, meta = await llm_svc.generate(
            message=analysis_prompt,
            mode="general",
            profile="general",
            model_override=model,
        )
    except Exception as exc:
        logger.warning(
            "Reasoning loop LLM call failed for job %s, using raw result: %s",
            job.id, exc,
        )
        return {**raw_result, "_reasoning": "llm_unavailable"}

    # Parse LLM analysis
    analysis: Dict[str, Any] = {}
    try:
        # Try to extract JSON from reply
        text = reply.strip()
        brace_start = text.find("{")
        brace_end = text.rfind("}")
        if brace_start != -1 and brace_end != -1:
            analysis = json.loads(text[brace_start : brace_end + 1])
        else:
            analysis = {"summary": text[:500]}
    except (json.JSONDecodeError, ValueError):
        analysis = {"summary": reply[:500]}

    await progress_callback(80, "Ukládám závěry...")

    # Optional memory store if LLM recommends it
    memory_note = analysis.get("memory_note")
    if memory_note and isinstance(memory_note, str) and memory_note.strip():
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            await mem.add_memory(
                text=memory_note.strip(),
                tags=["resident", "job_reasoning", job.type],
                source="job_reasoning_loop",
                importance=5,
            )
            analysis["memory_stored"] = True
            logger.info("Reasoning loop stored memory for job %s", job.id)
        except Exception as exc:
            logger.warning("Failed to store memory from reasoning loop: %s", exc)
            analysis["memory_stored"] = False

    return {
        "tool_result": raw_result,
        "analysis": analysis,
        "_reasoning": "completed",
    }


async def run_resident_task(
    job: Job, progress_callback: ProgressCallback
) -> Dict[str, Any]:
    """
    Deleguje resident_task na ResidentAgent._execute_with_llm().
    Job.payload may contain: action_type, steps, mission_id, step_index, auto_executed, from_suggestion

    For jobs tagged as resident_task or curiosity_task, runs a post-action LLM
    reasoning loop that analyses the tool result and optionally stores conclusions
    in memory.
    """
    from app.services.resident_agent import get_resident_agent

    agent = get_resident_agent()

    task = {
        "job_id": job.id,
        "goal": job.title,
        "description": job.input_summary or "",
        **job.payload,
    }

    await progress_callback(10, "Resident agent zpracovává úkol...")
    result = await agent._execute_with_llm(task)
    await progress_callback(40, "Tool call dokončen")

    # Reasoning loop for qualifying job types
    job_tags = set()
    job_tags.add(job.type)  # e.g. "resident_task"
    job_tags.update(job.payload.get("tags", []))

    if job_tags & _REASONING_TAGS:
        try:
            async with asyncio.timeout(_REASONING_LOOP_TIMEOUT_S):
                result = await _llm_reasoning_loop(job, result, progress_callback)
        except asyncio.TimeoutError:
            logger.warning(
                "Reasoning loop timed out for job %s after %ds, using raw result",
                job.id, _REASONING_LOOP_TIMEOUT_S,
            )
            result = {**result, "_reasoning": "timeout"}
        except Exception as exc:
            logger.warning(
                "Reasoning loop failed for job %s: %s, using raw result",
                job.id, exc,
            )
            result = {**result, "_reasoning": "error"}

    await progress_callback(100, "Hotovo")
    return result


async def run_resident_mission(
    job: Job, progress_callback: ProgressCallback
) -> Dict[str, Any]:
    """
    Deleguje resident_mission na ResidentAgent._advance_mission().
    Fallback engine for manually triggered mission jobs.
    """
    from app.services.resident_agent import get_resident_agent
    from app.services.job_service import get_job_service

    agent = get_resident_agent()
    job_svc = get_job_service()

    await progress_callback(5, "Zpracovávám misi...")
    await agent._advance_mission(job, job_svc)
    await progress_callback(100, "Mise postoupena")
    return {"status": "mission_advanced", "job_id": job.id}
