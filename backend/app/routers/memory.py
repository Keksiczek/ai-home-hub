"""Memory router – CRUD and search for shared long-term memory."""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.services.memory_service import get_memory_service
from app.utils.auth import verify_api_key

logger = logging.getLogger(__name__)

router = APIRouter(
    dependencies=[Depends(verify_api_key)],
)


# ── Request / Response schemas ───────────────────────────────────────────────


class AddMemoryRequest(BaseModel):
    text: str = Field(..., min_length=1)
    tags: List[str] = []
    source: str = ""
    importance: int = Field(default=5, ge=1, le=10)


class AddMemoryResponse(BaseModel):
    memory_id: str


class SearchMemoryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=50)
    filters: Dict[str, Any] = {}


class MemoryItem(BaseModel):
    id: str
    text: str
    tags: List[str]
    source: str
    importance: int
    timestamp: str
    distance: Optional[float] = None


class UpdateMemoryRequest(BaseModel):
    text: Optional[str] = None
    tags: Optional[List[str]] = None
    importance: Optional[int] = Field(default=None, ge=1, le=10)


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
