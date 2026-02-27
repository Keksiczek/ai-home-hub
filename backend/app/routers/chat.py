"""Chat router – LLM chat with session persistence and knowledge base context."""
import logging
from typing import Any, Dict, List

from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import get_llm_service
from app.services.session_service import get_session_service
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)
router = APIRouter()


async def _get_kb_context(message: str) -> str:
    """Search knowledge base for relevant context. Returns formatted context or empty string."""
    try:
        settings = get_settings_service().load()
        kb_enabled = settings.get("knowledge_base", {}).get("enabled", False)
        if not kb_enabled:
            return ""

        from app.services.vector_store_service import get_vector_store_service
        vector_store = get_vector_store_service()
        stats = vector_store.get_stats()

        if stats["total_chunks"] == 0:
            return ""

        from app.services.embeddings_service import get_embeddings_service
        embeddings_svc = get_embeddings_service()
        query_embedding = await embeddings_svc.generate_embedding(message)

        if not query_embedding:
            return ""

        search_results = vector_store.search(
            query_embedding=query_embedding,
            top_k=3,
        )

        if not search_results["documents"]:
            return ""

        # Filter out low-quality matches (cosine similarity threshold)
        MIN_SCORE = 0.3
        context_parts = []
        for doc, metadata, distance in zip(
            search_results["documents"],
            search_results["metadatas"],
            search_results["distances"],
        ):
            if (1 - distance) < MIN_SCORE:
                continue
            file_name = metadata.get("file_name", "Unknown")
            context_parts.append(f"[From {file_name}]\n{doc}")

        return "\n\n---\n\n".join(context_parts)

    except Exception as exc:
        logger.warning("KB search failed: %s", exc)
        return ""


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

    # Load conversation history for multi-turn support
    history = session_svc.get_history_for_llm(session_id, limit=20)

    # Search knowledge base for relevant context
    kb_context = await _get_kb_context(request.message)

    # Build the message with KB context if available
    llm_message = request.message
    if kb_context:
        llm_message = (
            f"{request.message}\n\n"
            f"# Relevant Context from Knowledge Base:\n{kb_context}"
        )

    # Generate response
    reply, meta = await llm_svc.generate(
        message=llm_message,
        mode=request.mode,
        context_file_ids=request.context_file_ids,
        history=history,
    )

    # Flag whether KB context was used
    meta["kb_context_used"] = bool(kb_context)

    # Persist both turns (store original message, not the one with KB context)
    session_svc.save_message(session_id, "user", request.message)
    session_svc.save_message(session_id, "assistant", reply, meta)

    meta["session_id"] = session_id
    return ChatResponse(reply=reply, meta=meta, session_id=session_id)


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
