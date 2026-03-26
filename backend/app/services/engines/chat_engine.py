"""Chat engine – processes async chat_task jobs from the job queue.

Flow:
  1. POST /chat creates a job (type="chat_task") and immediately returns 202 + job_id.
  2. JobWorker picks up the job and calls run_chat_task().
  3. run_chat_task() enriches the message, calls the LLM via generate_rich(), persists
     both turns to the session, then broadcasts the structured result to all WebSocket
     clients using WS_EVENT_CHAT_RESULT.

WebSocket payload on success:
  {
    "type": "chat_result",
    "job_id": "<uuid>",
    "status": "completed",
    "session_id": "<session_uuid>",
    "content": {
      "plain_text": "...",
      "markdown": "...",
      "html": null
    },
    "meta": {
      "model": "llama3.2:latest",
      "duration_ms": 1234,
      "kb_chunks_used": 2,
      ...
    }
  }

WebSocket payload on error:
  {
    "type": "chat_result",
    "job_id": "<uuid>",
    "status": "error",
    "session_id": "<session_uuid>",
    "error": {
      "code": "llm_error" | "timeout" | "internal",
      "message": "..."
    }
  }
"""

import logging
import time
from typing import Any, Dict

from app.services.job_service import Job
from app.services.engines.coding_engine import ProgressCallback

logger = logging.getLogger(__name__)


async def run_chat_task(
    job: Job, progress_callback: ProgressCallback
) -> Dict[str, Any]:
    """Process a chat_task job: call LLM, persist session, broadcast result via WS.

    All heavy imports are done inside the function to avoid import-time circular
    dependencies (the engine package is loaded before all services are wired up).
    """
    # ── Lazy imports ──────────────────────────────────────────────────────────
    from app.services.llm_service import get_llm_service
    from app.services.session_service import get_session_service
    from app.services.ws_manager import get_ws_manager, WS_EVENT_CHAT_RESULT
    from app.utils.context_helpers import enrich_message

    # ── Unpack job payload ────────────────────────────────────────────────────
    payload = job.payload
    message: str = payload.get("message", "")
    mode: str = payload.get("mode", "general")
    profile: str | None = payload.get("profile")
    session_id: str | None = payload.get("session_id")
    model_override: str | None = payload.get("model_override")
    context_file_ids: list = payload.get("context_file_ids", [])

    llm_svc = get_llm_service()
    session_svc = get_session_service()
    ws_manager = get_ws_manager()

    await progress_callback(10.0, {"stage": "enriching"})

    # ── Enrich message with KB + shared memory context ────────────────────────
    try:
        llm_message, context_meta = await enrich_message(message)
    except Exception as exc:
        logger.warning("Context enrichment failed (non-critical): %s", exc)
        llm_message = message
        context_meta = {}

    # ── Load session history ──────────────────────────────────────────────────
    history = []
    if session_id and session_svc.session_exists(session_id):
        history = session_svc.get_history_for_llm(session_id, limit=20)

    await progress_callback(20.0, {"stage": "generating"})

    # ── Call LLM ─────────────────────────────────────────────────────────────
    start_mono = time.monotonic()
    try:
        llm_response, meta = await llm_svc.generate_rich(
            message=llm_message,
            mode=mode,
            profile=profile,
            context_file_ids=context_file_ids,
            history=history,
            model_override=model_override,
        )
    except Exception as exc:
        duration_ms = int((time.monotonic() - start_mono) * 1000)
        logger.error("Chat task LLM error (job=%s): %s", job.id, exc, exc_info=True)

        error_code = "timeout" if "timeout" in str(exc).lower() else "llm_error"
        await ws_manager.broadcast(
            {
                "type": WS_EVENT_CHAT_RESULT,
                "job_id": job.id,
                "status": "error",
                "session_id": session_id,
                "error": {"code": error_code, "message": str(exc)},
                "meta": {"duration_ms": duration_ms},
            }
        )
        raise  # let JobWorker mark the job as failed

    duration_ms = int((time.monotonic() - start_mono) * 1000)

    # Merge context meta into LLM meta
    meta.update(context_meta)
    meta["duration_ms"] = duration_ms

    await progress_callback(80.0, {"stage": "persisting"})

    # ── Persist both turns to session ─────────────────────────────────────────
    if session_id and session_svc.session_exists(session_id):
        session_svc.save_message(session_id, "user", message)
        session_svc.save_message(session_id, "assistant", llm_response.text, meta)

    await progress_callback(95.0, {"stage": "broadcasting"})

    # ── Check for LLM-level errors (circuit breaker / unavailable) ────────────
    if meta.get("status") == "llm_unavailable" or meta.get("provider") == "error":
        error_msg = meta.get("message", llm_response.text)
        await ws_manager.broadcast(
            {
                "type": WS_EVENT_CHAT_RESULT,
                "job_id": job.id,
                "status": "error",
                "session_id": session_id,
                "error": {"code": "llm_error", "message": error_msg},
                "meta": {"model": meta.get("model"), "duration_ms": duration_ms},
            }
        )
        return {
            "reply": llm_response.text,
            "session_id": session_id,
            "model": meta.get("model", "unknown"),
            "duration_ms": duration_ms,
            "error": error_msg,
        }

    # ── Broadcast success result ──────────────────────────────────────────────
    ws_payload: Dict[str, Any] = {
        "type": WS_EVENT_CHAT_RESULT,
        "job_id": job.id,
        "status": "completed",
        "session_id": session_id,
        "content": llm_response.as_dict(),
        "meta": {
            "model": meta.get("model", "unknown"),
            "duration_ms": duration_ms,
            "latency_ms": meta.get("latency_ms", duration_ms),
            "tokens_estimated": meta.get("tokens_estimated"),
            "history_trimmed": meta.get("history_trimmed", False),
            "keep_alive": meta.get("keep_alive"),
            **{k: v for k, v in context_meta.items()},
        },
    }
    await ws_manager.broadcast(ws_payload)

    await progress_callback(100.0, {"stage": "done"})

    return {
        "reply": llm_response.text,
        "session_id": session_id,
        "model": meta.get("model", "unknown"),
        "duration_ms": duration_ms,
    }
