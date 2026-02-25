"""Chat router – LLM chat with session persistence."""
from typing import Any, Dict, List

from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import get_llm_service
from app.services.session_service import get_session_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Send a message to the LLM with optional file context and session persistence.

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

    # Generate response
    reply, meta = await llm_svc.generate(
        message=request.message,
        mode=request.mode,
        context_file_ids=request.context_file_ids,
        history=history,
    )

    # Persist both turns
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
