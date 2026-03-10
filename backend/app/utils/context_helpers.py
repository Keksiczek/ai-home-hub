"""Shared context-enrichment helpers used by both chat and multimodal chat routers.

Delegates to context_utils.py for the core logic; this module provides
backward-compatible wrappers (enrich_message, MemoryContextResult).
"""

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from app.utils.context_utils import (
    get_kb_context,
    get_memory_context,
    MAX_MEMORY_DISTANCE,
)

logger = logging.getLogger(__name__)


@dataclass
class MemoryContextResult:
    """Result of a memory context search."""

    xml: str
    items: List[Dict[str, Any]]


async def _get_memory_context_with_items(message: str) -> MemoryContextResult:
    """Search shared memory and return both XML and item list."""
    empty = MemoryContextResult(xml="", items=[])
    try:
        from app.services.memory_service import get_memory_service
        svc = get_memory_service()
        if svc.collection.count() == 0:
            return empty

        results = await svc.search_memory(message, top_k=3)
        if not results:
            return empty

        notes = []
        items: List[Dict[str, Any]] = []
        for r in results:
            if r.distance is not None and r.distance > MAX_MEMORY_DISTANCE:
                continue
            notes.append(f'  <note importance="{r.importance}">{r.text}</note>')
            items.append({"id": r.id, "text": r.text, "importance": r.importance})

        if not notes:
            return empty

        xml = "<user_memory>\n" + "\n".join(notes) + "\n</user_memory>"
        return MemoryContextResult(xml=xml, items=items)

    except Exception as exc:
        logger.warning("Memory search failed: %s", exc, exc_info=True)
        return empty


async def enrich_message(
    message: str,
    use_kb: bool = True,
    use_memory: bool = True,
) -> tuple:
    """Enrich a user message with KB and memory context.

    Returns (llm_message, meta_patch) where meta_patch is a dict of meta
    fields to merge into the response meta.
    """
    llm_message = message
    meta: Dict[str, Any] = {
        "kb_context_used": False,
        "memory_context_used": False,
        "memory_used": False,
        "kb_used": False,
        "memory_context_items": [],
    }

    if use_kb:
        kb_ctx = await get_kb_context(message)
        if kb_ctx:
            llm_message = (
                f"{message}\n\n"
                f"# Relevant Context from Knowledge Base:\n{kb_ctx}"
            )
            meta["kb_context_used"] = True
            meta["kb_used"] = True

    if use_memory:
        mem_result = await _get_memory_context_with_items(message)
        if mem_result.xml:
            llm_message = f"{mem_result.xml}\n\n{llm_message}"
            meta["memory_context_used"] = True
            meta["memory_used"] = True
            meta["memory_context_items"] = mem_result.items

    return llm_message, meta
