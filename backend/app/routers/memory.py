"""Memory router – CRUD, search, and session summarization for shared long-term memory."""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import (
    AddMemoryRequest,
    AddMemoryResponse,
    SearchMemoryRequest,
    UpdateMemoryRequest,
    SummarizeSessionRequest,
)
from app.services.memory_service import get_memory_service
from app.utils.auth import verify_api_key

logger = logging.getLogger(__name__)

router = APIRouter(
    dependencies=[Depends(verify_api_key)],
)


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.post("/memory/add", response_model=AddMemoryResponse, tags=["memory"])
async def add_memory(request: AddMemoryRequest):
    """Add a new memory record."""
    svc = get_memory_service()
    try:
        memory_id = await svc.add_memory(
            text=request.text,
            tags=request.tags,
            source=request.source,
            importance=request.importance,
        )
        return AddMemoryResponse(memory_id=memory_id)
    except Exception as exc:
        logger.error("Failed to add memory: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/memory/search", tags=["memory"])
async def search_memory(request: SearchMemoryRequest):
    """Search memories by semantic similarity."""
    svc = get_memory_service()
    results = await svc.search_memory(
        query=request.query,
        top_k=request.top_k,
        filters=request.filters,
    )
    return {
        "results": [r.to_dict() for r in results],
        "count": len(results),
    }


@router.get("/memory/all", tags=["memory"])
async def get_all_memories(limit: int = 100):
    """List all memories."""
    svc = get_memory_service()
    memories = svc.get_all_memories(limit=limit)
    return {
        "memories": [m.to_dict() for m in memories],
        "count": len(memories),
    }


@router.delete("/memory/{memory_id}", tags=["memory"])
async def delete_memory(memory_id: str):
    """Delete a memory by ID."""
    svc = get_memory_service()
    deleted = svc.delete_memory(memory_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Memory {memory_id} not found")
    return {"memory_id": memory_id, "deleted": True}


@router.put("/memory/{memory_id}", tags=["memory"])
async def update_memory(memory_id: str, request: UpdateMemoryRequest):
    """Update an existing memory (text, tags, importance)."""
    svc = get_memory_service()
    updated = await svc.update_memory(
        memory_id=memory_id,
        new_text=request.text,
        new_tags=request.tags,
        new_importance=request.importance,
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Memory {memory_id} not found")
    return {"memory_id": memory_id, "updated": True}


@router.post("/memory/summarize-session", tags=["memory"])
async def summarize_session(request: SummarizeSessionRequest):
    """Summarize a chat session and auto-save key facts as memories."""
    from app.services.session_service import get_session_service
    from app.services.llm_service import get_llm_service

    session_svc = get_session_service()
    if not session_svc.session_exists(request.session_id):
        raise HTTPException(status_code=404, detail=f"Session {request.session_id} not found")

    messages = session_svc.load_history(request.session_id, limit=request.max_messages)
    if not messages:
        raise HTTPException(status_code=400, detail="No messages in session")

    # Format conversation for the LLM
    conversation_lines = []
    for m in messages:
        role = "User" if m["role"] == "user" else "Assistant"
        conversation_lines.append(f"{role}: {m['content']}")
    conversation_text = "\n".join(conversation_lines)

    prompt = (
        "Analyzuj tuto konverzaci a vyextrahuj klíčové fakta, preference a poznatky o uživateli.\n\n"
        "Formát odpovědi:\n"
        "- Každý fakt/preference na samostatný řádek\n"
        "- Stručně, max 1 věta per položka\n"
        "- Bez duplicit, jen nové/relevantní informace\n"
        "- Nezačínej řádky pomlčkou ani odrážkou, jen text\n\n"
        f"<conversation>\n{conversation_text}\n</conversation>\n\n"
        "Výstup (jeden fakt per řádek):"
    )

    llm_svc = get_llm_service()
    try:
        reply, _ = await llm_svc.generate(message=prompt, mode="general", profile="chat")
    except Exception as exc:
        logger.error("LLM summarization failed: %s", exc)
        raise HTTPException(status_code=500, detail="LLM summarization failed")

    # Parse facts from the LLM response
    facts = [
        line.lstrip("- ").lstrip("• ").strip()
        for line in reply.strip().splitlines()
        if line.strip() and len(line.strip()) > 3
    ]

    if not facts:
        return {"summary_count": 0, "memories_created": []}

    # Save each fact as a memory
    svc = get_memory_service()
    created_ids = []
    for fact in facts:
        try:
            mem_id = await svc.add_memory(
                text=fact,
                tags=["auto-summary", "session"],
                source=f"session_{request.session_id}",
                importance=7,
            )
            created_ids.append(mem_id)
        except Exception as exc:
            logger.warning("Failed to save summary memory: %s", exc)

    return {"summary_count": len(created_ids), "memories_created": created_ids}
