"""Job engines – backward-compatible re-export shim.

All engine implementations have been split into the engines/ subpackage:
  - engines/coding_engine.py  – run_dummy_long_task, run_long_llm_task
  - engines/research_engine.py – run_document_analysis
  - engines/media_engine.py   – run_media_ingest
  - engines/report_engine.py  – run_report_generation, _build_markdown_from_result

This module re-exports everything so existing imports continue to work unchanged.
"""
import logging
from typing import Any, Dict

from app.services.engines import (  # noqa: F401  (re-exported for backward compat)
    ProgressCallback,
    _build_markdown_from_result,
    run_document_analysis,
    run_dummy_long_task,
    run_long_llm_task,
    run_media_ingest,
    run_report_generation,
    run_kb_reindex,
    run_git_sweep,
    run_nightly_summary,
)
from app.services.job_service import Job

logger = logging.getLogger(__name__)

# ── Engine dispatcher ────────────────────────────────────────

_ENGINES = {
    "dummy_long_task": run_dummy_long_task,
    "long_llm_task": run_long_llm_task,
    "document_analysis": run_document_analysis,
    "media_ingest": run_media_ingest,
    "report_generation": run_report_generation,
    "kb_reindex": run_kb_reindex,
    "git_sweep": run_git_sweep,
    "nightly_summary": run_nightly_summary,
}


async def execute_job(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """Dispatch a job to the appropriate engine based on job.type."""
    engine_fn = _ENGINES.get(job.type)
    if engine_fn is None:
        logger.warning("Unknown job type: %s (job %s)", job.type, job.id)
        raise ValueError(f"Unknown job type: {job.type}")

    return await engine_fn(job, progress_callback)
