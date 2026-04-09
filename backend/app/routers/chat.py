"""Chat router – LLM chat with session persistence, knowledge base context, and shared memory."""

import json
import logging
import shutil
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, File, Form, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import get_llm_service, is_abliterated_model
from app.services.metrics_service import chat_latency_seconds, chat_requests_total
from app.services.resource_policy import get_resource_policy
from app.services.session_service import get_session_service
from app.utils.context_helpers import enrich_message

logger = logging.getLogger(__name__)
router = APIRouter()

_CHAT_UPLOADS_DIR = (
    Path(__file__).parent.parent.parent / "data" / "uploads" / "chat_tmp"
)


@router.websocket("/chat/stream")
async def chat_stream_ws(websocket: WebSocket) -> None:
    """Stream chat responses token-by-token over WebSocket.

    Client sends a JSON message identical to ChatRequest.
    Server responds with a sequence of:
      {"type": "chat_chunk", "delta": {"plain_text": "..."}, "is_final": false}
      {"type": "chat_chunk", "delta": {...}, "is_final": true, "meta": {...}}
    On error:
      {"type": "error", "message": "..."}
    """
    await websocket.accept()
    try:
        data = await websocket.receive_json()
    except WebSocketDisconnect:
        return
    except Exception as exc:
        logger.debug("Stream WS receive error: %s", exc)
        return

    llm_svc = get_llm_service()
    session_svc = get_session_service()

    message = data.get("message", "")
    mode = data.get("mode", "general")
    profile = data.get("profile")
    session_id = data.get("session_id")
    model_override = data.get("model")
    allow_uncensored = bool(data.get("allow_uncensored", False))

    # Record user activity so resident/background tasks back off
    get_resource_policy().record_user_activity()

    if not message.strip():
        await websocket.send_json({"type": "error", "message": "Empty message"})
        await websocket.close()
        return

    # Abliterated/uncensored model gate for streaming chat
    if model_override and is_abliterated_model(model_override):
        if not allow_uncensored:
            await websocket.send_json(
                {
                    "type": "error",
                    "message": (
                        "Model je abliterated/uncensored. "
                        "Pokud ho chceš použít vědomě, pošli allow_uncensored: true"
                    ),
                }
            )
            await websocket.close()
            return
        logger.warning(
            "WARNING: Uživatel vědomě zvolil abliterated model %s pro chat stream",
            model_override,
        )

    # Session management
    if not session_id or not session_svc.session_exists(session_id):
        session_id = session_svc.create_session()

    history = session_svc.get_history_for_llm(session_id, limit=20)

    # Enrich with KB + memory context
    llm_message, context_meta = await enrich_message(message)

    full_reply = []
    start = time.monotonic()

    try:
        async for token in llm_svc.generate_stream(
            message=llm_message,
            mode=mode,
            profile=profile,
            history=history,
            model_override=model_override,
        ):
            full_reply.append(token)
            # chat_chunk carries both a plain delta and a markdown delta
            # (same content for now; a future renderer can diff them)
            await websocket.send_json(
                {
                    "type": "chat_chunk",
                    "delta": {"plain_text": token, "markdown": token},
                    "is_final": False,
                }
            )
    except WebSocketDisconnect:
        logger.info("Client disconnected during streaming")
        return
    except Exception as exc:
        logger.error("Stream generation error: %s", exc, exc_info=True)
        await websocket.send_json({"type": "error", "message": str(exc)})
        await websocket.close()
        return

    elapsed_ms = int((time.monotonic() - start) * 1000)
    reply_text = "".join(full_reply)

    cfg = llm_svc._settings.get_llm_config(profile=profile)
    model_used = model_override or cfg.get("model", "llama3.2")

    # Sanitize the final assembled response
    from app.services.llm_service import sanitize_response

    reply_text, was_sanitized = sanitize_response(reply_text, model_used)

    # Prometheus instrumentation
    chat_requests_total.labels(profile=profile or "default", model=model_used).inc()
    chat_latency_seconds.labels(model=model_used).observe(time.monotonic() - start)

    meta: Dict[str, Any] = {
        "provider": "ollama",
        "model": model_used,
        "latency_ms": elapsed_ms,
        "mode": mode,
        "sanitized": was_sanitized,
        **context_meta,
    }

    # Persist both turns
    session_svc.save_message(session_id, "user", message)
    session_svc.save_message(session_id, "assistant", reply_text, meta)
    meta["session_id"] = session_id

    # Final chunk: full assembled content in structured form
    await websocket.send_json(
        {
            "type": "chat_chunk",
            "delta": {"plain_text": reply_text, "markdown": reply_text, "html": None},
            "is_final": True,
            "meta": meta,
        }
    )
    await websocket.close()


@router.post("/chat/stream/sse", tags=["chat"])
async def chat_stream_sse(request: ChatRequest):
    """Stream chat responses via Server-Sent Events.

    Alternative to WebSocket streaming for proxy-friendly environments.
    Returns ``text/event-stream`` with X-Accel-Buffering: no for nginx compat.
    Each event is ``data: {"type":"chat_chunk","delta":{"plain_text":"..."},"is_final":false}``
    """
    from fastapi.responses import StreamingResponse

    llm_svc = get_llm_service()
    session_svc = get_session_service()

    message = request.message
    if not message.strip():
        return JSONResponse(status_code=400, content={"error": "Empty message"})

    model_override = request.model
    if model_override and is_abliterated_model(model_override):
        if not request.allow_uncensored:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Model je abliterated/uncensored. Pošli allow_uncensored: true"
                },
            )

    session_id = request.session_id
    if not session_id or not session_svc.session_exists(session_id):
        session_id = session_svc.create_session()

    history = session_svc.get_history_for_llm(session_id, limit=20)

    from app.utils.context_helpers import enrich_message

    llm_message, context_meta = await enrich_message(message)

    async def event_generator():
        full_reply = []
        start = time.monotonic()
        try:
            async for token in llm_svc.generate_stream(
                message=llm_message,
                mode=request.mode,
                profile=request.profile,
                history=history,
                model_override=model_override,
            ):
                full_reply.append(token)
                chunk = json.dumps(
                    {
                        "type": "chat_chunk",
                        "delta": {"plain_text": token, "markdown": token},
                        "is_final": False,
                    }
                )
                yield f"data: {chunk}\n\n"
        except Exception as exc:
            logger.error("SSE stream error: %s", exc, exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
            return

        elapsed_ms = int((time.monotonic() - start) * 1000)
        reply_text = "".join(full_reply)

        cfg = llm_svc._settings.get_llm_config(profile=request.profile)
        model_used = model_override or cfg.get("model", "llama3.2")

        from app.services.llm_service import sanitize_response

        reply_text, was_sanitized = sanitize_response(reply_text, model_used)

        session_svc.save_message(session_id, "user", message)
        session_svc.save_message(session_id, "assistant", reply_text)

        meta = {
            "provider": "ollama",
            "model": model_used,
            "latency_ms": elapsed_ms,
            "mode": request.mode,
            "sanitized": was_sanitized,
            "session_id": session_id,
            **context_meta,
        }
        final = json.dumps(
            {
                "type": "chat_chunk",
                "delta": {
                    "plain_text": reply_text,
                    "markdown": reply_text,
                    "html": None,
                },
                "is_final": True,
                "meta": meta,
            }
        )
        yield f"data: {final}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat", tags=["chat"])
async def chat(request: ChatRequest) -> JSONResponse:
    """
    Enqueue a chat request for async processing.

    Returns **202 Accepted** immediately with a ``job_id``.  The LLM runs in the
    background via the job worker; when the response is ready it is pushed to all
    connected WebSocket clients as a ``chat_result`` event containing the full
    structured content plus the original ``job_id`` so the frontend can match it.

    Use ``GET /jobs/{job_id}`` to poll status, or listen on ``/ws`` for the push.
    """
    from app.services.job_service import get_job_service

    session_svc = get_session_service()
    job_svc = get_job_service()

    # Session management – create a new session when none is provided / stale
    session_id = request.session_id
    if not session_id or not session_svc.session_exists(session_id):
        session_id = session_svc.create_session()

    # Resolve model override: request.model > session override > profile default
    model_override = request.model
    if not model_override:
        model_override = session_svc.get_model_override(session_id)

    # Abliterated/uncensored model gate for chat
    if model_override and is_abliterated_model(model_override):
        if not request.allow_uncensored:
            return JSONResponse(
                status_code=400,
                content={
                    "error": (
                        "Model je abliterated/uncensored. "
                        "Pokud ho chceš použít vědomě, pošli allow_uncensored: true"
                    ),
                    "model": model_override,
                },
            )
        logger.warning(
            "WARNING: Uživatel vědomě zvolil abliterated model %s pro chat session",
            model_override,
        )

    # Enqueue the chat job (high priority so it runs before background jobs)
    job = job_svc.create_job(
        type="chat_task",
        title=f"Chat: {request.message[:60]}{'…' if len(request.message) > 60 else ''}",
        input_summary=request.message[:200],
        payload={
            "message": request.message,
            "mode": request.mode,
            "profile": request.profile,
            "session_id": session_id,
            "model_override": model_override,
            "allow_uncensored": request.allow_uncensored,
            "context_file_ids": request.context_file_ids,
        },
        priority="high",
    )

    logger.info(
        "Chat job enqueued: job_id=%s session_id=%s profile=%s",
        job.id,
        session_id,
        request.profile,
    )

    return JSONResponse(
        status_code=202,
        content={
            "status": "accepted",
            "job_id": job.id,
            "session_id": session_id,
            "message": "Chat job accepted and is being processed",
        },
    )


@router.post("/chat/with-files", tags=["chat"])
async def chat_with_files(
    message: str = Form(...),
    mode: str = Form("general"),
    profile: str = Form(None),
    session_id: str = Form(None),
    files: List[UploadFile] = File(default=[]),
) -> Dict[str, Any]:
    """Chat with file attachments. Files are analyzed and injected as context.

    Each uploaded file is processed via FileHandlerService in ``analyze`` mode
    and its preview + filename are prepended to the message for LLM context.
    Temp files are cleaned up after the response is generated.
    """
    from app.services.file_handler_service import (
        get_file_handler_service,
        SUPPORTED_EXTENSIONS,
    )

    llm_svc = get_llm_service()
    session_svc = get_session_service()
    handler = get_file_handler_service()

    _CHAT_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    temp_paths: List[Path] = []
    file_contexts: List[str] = []
    attachment_names: List[str] = []

    try:
        # Process each uploaded file
        for upload in files:
            fname = upload.filename or "file"
            suffix = Path(fname).suffix.lower()
            if suffix not in SUPPORTED_EXTENSIONS:
                file_contexts.append(f"[Soubor {fname}: nepodporovaný formát {suffix}]")
                attachment_names.append(fname)
                continue

            dest = _CHAT_UPLOADS_DIR / f"{uuid.uuid4()}{suffix}"
            with dest.open("wb") as f:
                shutil.copyfileobj(upload.file, f)
            temp_paths.append(dest)

            result = await handler.process_file(str(dest), "analyze")
            preview = result.get("text_preview", result.get("summary", ""))
            if preview:
                file_contexts.append(f"Soubor {fname}:\n{preview}")
            else:
                file_contexts.append(f"[Soubor {fname}: nepodařilo se extrahovat text]")
            attachment_names.append(fname)

        # Build enriched message with file context
        file_context_str = ""
        if file_contexts:
            file_context_str = (
                "\n\n".join(
                    f'<attachment name="{n}">{ctx}</attachment>'
                    for n, ctx in zip(attachment_names, file_contexts)
                )
                + "\n\n"
            )

        full_message = file_context_str + message

        # Session management
        if not session_id or not session_svc.session_exists(session_id):
            session_id = session_svc.create_session()

        history = session_svc.get_history_for_llm(session_id, limit=20)
        llm_message, context_meta = await enrich_message(full_message)

        reply, meta = await llm_svc.generate(
            message=llm_message,
            mode=mode,
            profile=profile,
            history=history,
        )
        meta.update(context_meta)
        meta["attachments"] = attachment_names

        # Persist
        user_display = message
        if attachment_names:
            user_display = (
                " ".join(f"[📎 {n}]" for n in attachment_names) + " " + message
            )
        session_svc.save_message(session_id, "user", user_display)
        session_svc.save_message(session_id, "assistant", reply, meta)

        meta["session_id"] = session_id
        return {"reply": reply, "meta": meta, "session_id": session_id}

    finally:
        # Clean up temp files
        for p in temp_paths:
            try:
                p.unlink(missing_ok=True)
            except Exception:
                pass


@router.get("/chat/sessions", tags=["chat"])
async def list_sessions() -> Dict[str, Any]:
    """List all conversation sessions."""
    session_svc = get_session_service()
    sessions = session_svc.list_sessions()
    return {"sessions": sessions, "count": len(sessions)}


@router.get("/chat/sessions/{session_id}", tags=["chat"])
async def get_session(session_id: str) -> Dict[str, Any]:
    """Get full conversation history for a session."""
    from fastapi import HTTPException

    session_svc = get_session_service()
    if not session_svc.session_exists(session_id):
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    messages = session_svc.load_history(session_id)
    return {"session_id": session_id, "messages": messages}


@router.patch("/chat/sessions/{session_id}", tags=["chat"])
async def rename_session(session_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Rename a conversation session."""
    from fastapi import HTTPException

    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    session_svc = get_session_service()
    success = session_svc.rename_session(session_id, name)
    if not success:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    return {"session_id": session_id, "name": name}


@router.delete("/chat/sessions/{session_id}", tags=["chat"])
async def delete_session(session_id: str) -> Dict[str, Any]:
    """Delete a conversation session."""
    from fastapi import HTTPException

    session_svc = get_session_service()
    success = session_svc.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    return {"session_id": session_id, "deleted": True}


# ── Session management endpoints (4G) ────────────────────────


@router.get("/sessions", tags=["sessions"])
async def list_all_sessions() -> Dict[str, Any]:
    """List all session IDs with metadata (created_at, message_count, last_activity)."""
    session_svc = get_session_service()
    sessions = session_svc.list_sessions_detailed()
    return {"sessions": sessions, "count": len(sessions)}


@router.get("/sessions/stats", tags=["sessions"])
async def session_stats() -> Dict[str, Any]:
    """Get session stats: count, total size, oldest/newest session."""
    session_svc = get_session_service()
    return session_svc.get_session_stats()


@router.delete("/sessions/cleanup", tags=["sessions"])
async def cleanup_sessions(older_than_days: int = 30) -> Dict[str, Any]:
    """Delete sessions older than N days."""
    session_svc = get_session_service()
    return session_svc.cleanup_old_sessions(older_than_days)
