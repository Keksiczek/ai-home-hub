"""Chat router – LLM chat with session persistence, knowledge base context, and shared memory."""

import json
import logging
import shutil
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, File, Form, UploadFile, WebSocket, WebSocketDisconnect

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import get_llm_service
from app.services.metrics_service import chat_latency_seconds, chat_requests_total
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
      {"type": "token", "content": "..."}
      {"type": "done", "meta": {...}}
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

    if not message.strip():
        await websocket.send_json({"type": "error", "message": "Empty message"})
        await websocket.close()
        return

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
            await websocket.send_json({"type": "token", "content": token})
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

    # Prometheus instrumentation
    chat_requests_total.labels(profile=profile or "default", model=model_used).inc()
    chat_latency_seconds.labels(model=model_used).observe(time.monotonic() - start)

    meta: Dict[str, Any] = {
        "provider": "ollama",
        "model": model_used,
        "latency_ms": elapsed_ms,
        "mode": mode,
        **context_meta,
    }

    # Persist both turns
    session_svc.save_message(session_id, "user", message)
    session_svc.save_message(session_id, "assistant", reply_text, meta)
    meta["session_id"] = session_id

    await websocket.send_json({"type": "done", "meta": meta})
    await websocket.close()


@router.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Send a message to the LLM with optional file context, KB context, and session persistence.

    - Pass session_id to continue an existing conversation (history injected automatically).
    - Omit session_id to start a new session (ID is returned in the response meta).
    """
    llm_svc = get_llm_service()
    session_svc = get_session_service()

    # Session management
    session_id = request.session_id
    if not session_id or not session_svc.session_exists(session_id):
        session_id = session_svc.create_session()

    # Load conversation history (with summarization if needed)
    all_messages = session_svc.load_history(session_id)
    history = session_svc.get_history_for_llm(session_id, limit=20)
    history_summarized = any(
        m.get("role") == "system"
        and "Summary of earlier conversation:" in m.get("content", "")
        for m in history
    )

    # Enrich message with KB + memory context
    llm_message, context_meta = await enrich_message(request.message)

    # Resolve model override: request.model > session override > profile default
    model_override = request.model
    if not model_override:
        model_override = session_svc.get_model_override(session_id)

    # Generate response
    reply, meta = await llm_svc.generate(
        message=llm_message,
        mode=request.mode,
        profile=request.profile,
        context_file_ids=request.context_file_ids,
        history=history,
        model_override=model_override,
    )

    # Merge context meta flags
    meta.update(context_meta)
    meta["history_summarized"] = history_summarized
    meta["history_total_messages"] = len(all_messages)
    meta["history_sent_messages"] = len(history)

    # Mark timeout errors explicitly for frontend UX
    if meta.get("provider") == "timeout":
        meta["error"] = True
        meta["error_type"] = "timeout"

    # Prometheus instrumentation
    model_used = meta.get("model", "unknown")
    chat_requests_total.labels(
        profile=request.profile or "default", model=model_used
    ).inc()
    chat_latency_seconds.labels(model=model_used).observe(
        meta.get("latency_ms", 0) / 1000
    )

    # Persist both turns (store original message, not the one with KB context)
    session_svc.save_message(session_id, "user", request.message)
    session_svc.save_message(session_id, "assistant", reply, meta)

    meta["session_id"] = session_id
    return ChatResponse(reply=reply, meta=meta, session_id=session_id)


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
