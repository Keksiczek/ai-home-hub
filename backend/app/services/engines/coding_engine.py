"""Coding engines – dummy long task and LLM chunked processing."""
import asyncio
import logging
from typing import Any, Awaitable, Callable, Dict, Optional

from app.services.job_service import Job

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[float, Optional[Dict[str, Any]]], Awaitable[None]]


async def run_dummy_long_task(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """DummyLongTaskEngine – simulates a long-running job with 10 steps."""
    total_steps = job.payload.get("steps", 10)
    sleep_per_step = job.payload.get("sleep_seconds", 1.0)

    logger.info("DummyLongTask started: %d steps, %.1fs each", total_steps, sleep_per_step)

    for step in range(1, total_steps + 1):
        await asyncio.sleep(sleep_per_step)
        progress = (step / total_steps) * 100
        await progress_callback(progress, {
            "current_step": step,
            "total_steps": total_steps,
        })
        logger.debug("DummyLongTask step %d/%d (%.0f%%)", step, total_steps, progress)

    return {"message": f"Completed {total_steps} steps", "steps_done": total_steps}


async def run_long_llm_task(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """LongLLMTaskEngine – splits a prompt into chunks and calls LLM for each."""
    from app.services.llm_service import get_llm_service

    llm = get_llm_service()

    prompt = job.payload.get("prompt", "")
    model = job.payload.get("model")
    context = job.payload.get("context", "")
    chunk_size = job.payload.get("chunk_size", 500)

    if not prompt:
        raise ValueError("LongLLMTask requires a 'prompt' in payload")

    # Split prompt into chunks for multi-step processing
    words = prompt.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunks.append(" ".join(words[i : i + chunk_size]))

    if not chunks:
        chunks = [prompt]

    total = len(chunks)
    results = []

    for idx, chunk in enumerate(chunks, 1):
        message = chunk
        if context:
            message = f"Kontext: {context}\n\n{chunk}"

        await progress_callback(
            ((idx - 1) / total) * 100,
            {"current_step": idx, "total_steps": total, "status": "processing"},
        )

        try:
            reply, meta = await llm.generate(
                message=message,
                mode="general",
                model_override=model,
            )
            results.append({"chunk": idx, "reply": reply[:500], "meta": meta})
        except Exception as exc:
            logger.warning("LLM chunk %d/%d failed: %s", idx, total, exc)
            results.append({"chunk": idx, "error": str(exc)})

        await progress_callback(
            (idx / total) * 100,
            {"current_step": idx, "total_steps": total, "status": "done"},
        )

    return {
        "message": f"Processed {total} chunk(s)",
        "chunks_total": total,
        "results": results,
    }
