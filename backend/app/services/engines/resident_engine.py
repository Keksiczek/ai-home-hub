"""Resident agent task engine."""

import logging
from typing import Any, Dict

from app.services.job_service import Job
from .coding_engine import ProgressCallback

logger = logging.getLogger(__name__)


async def run_resident_task(
    job: Job, progress_callback: ProgressCallback
) -> Dict[str, Any]:
    """
    Deleguje resident_task na ResidentAgent._execute_with_llm().
    Job.payload may contain: action_type, steps, mission_id, step_index, auto_executed, from_suggestion
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
