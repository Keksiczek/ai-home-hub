"""Shared context-enrichment helpers used by both chat and multimodal chat routers.

These functions search the Knowledge Base and Shared Memory for relevant context
and return structured data that can be injected into the LLM prompt.
"""

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from app.services.settings_service import get_settings_service
from app.utils.constants import MIN_KB_SEARCH_SCORE

logger = logging.getLogger(__name__)

# Maximum cosine distance to consider a memory relevant for chat context
MAX_MEMORY_DISTANCE = 0.7


@dataclass
class MemoryContextResult:
    """Result of a memory context search."""

    xml: str
    items: List[Dict[str, Any]]


async def get_kb_context(message: str) -> str:
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
        context_parts = []
        for doc, metadata, distance in zip(
            search_results["documents"],
            search_results["metadatas"],
            search_results["distances"],
        ):
            if (1 - distance) < MIN_KB_SEARCH_SCORE:
                continue
            file_name = metadata.get("file_name", "Unknown")
            context_parts.append(f"[From {file_name}]\n{doc}")

        return "\n\n---\n\n".join(context_parts)

    except Exception as exc:
        logger.warning("KB search failed: %s", exc)
        return ""


async def get_memory_context(message: str) -> MemoryContextResult:
    """Search shared memory for relevant user notes/preferences.

    Returns a MemoryContextResult with:
      - xml: the formatted <user_memory> block (empty string if no matches)
      - items: list of dicts with id/text/importance for each matched memory
    """
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
        logger.warning("Memory search failed: %s", exc)
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
        "memory_context_items": [],
    }

    if use_kb:
        kb_context = await get_kb_context(message)
        if kb_context:
            llm_message = (
                f"{message}\n\n"
                f"# Relevant Context from Knowledge Base:\n{kb_context}"
            )
            meta["kb_context_used"] = True

    if use_memory:
        mem_result = await get_memory_context(message)
        if mem_result.xml:
            llm_message = f"{mem_result.xml}\n\n{llm_message}"
            meta["memory_context_used"] = True
            meta["memory_context_items"] = mem_result.items

    return llm_message, meta
