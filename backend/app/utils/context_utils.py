"""Context utilities for injecting KB and memory context into LLM prompts.

Provides reusable async functions used by both chat.py and chat_multimodal.py
to fetch relevant memories and knowledge base chunks.
"""

import logging
from typing import Any, Dict, List, Optional

from app.services.settings_service import get_settings_service
from app.utils.constants import MIN_KB_SEARCH_SCORE

logger = logging.getLogger(__name__)

# Maximum cosine distance to consider a memory relevant for chat context
MAX_MEMORY_DISTANCE = 0.7


async def get_memory_context(message: str, session_id: str = "") -> str:
    """Fetch relevant memories and format them for injection.

    Args:
        message: The user message to search memories for.
        session_id: The current session ID (reserved for future per-session filtering).

    Returns:
        Formatted XML block of relevant memories, or empty string if none found.
    """
    try:
        from app.services.memory_service import get_memory_service

        svc = get_memory_service()
        if svc.collection.count() == 0:
            return ""

        results = await svc.search_memory(message, top_k=3)
        if not results:
            return ""

        notes = []
        for r in results:
            if r.distance is not None and r.distance > MAX_MEMORY_DISTANCE:
                continue
            notes.append(f'  <note importance="{r.importance}">{r.text}</note>')

        if not notes:
            return ""

        return "<user_memory>\n" + "\n".join(notes) + "\n</user_memory>"

    except Exception as exc:
        logger.warning("Memory search failed: %s", exc, exc_info=True)
        return ""


async def get_kb_context(message: str) -> str:
    """Fetch relevant KB chunks and format them for injection.

    Args:
        message: The user message to search the knowledge base for.

    Returns:
        Formatted context string from KB, or empty string if none found.
    """
    try:
        settings = get_settings_service().load()
        kb_enabled = settings.get("knowledge_base", {}).get("enabled", False)
        if not kb_enabled:
            return ""

        from app.services.vector_store_service import get_vector_store_service

        vector_store = get_vector_store_service()
        stats = vector_store.get_stats(detailed=False)

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
        logger.warning("KB search failed: %s", exc, exc_info=True)
        return ""


def build_system_prompt_with_context(
    base_prompt: str,
    memory_context: str,
    kb_context: str,
) -> str:
    """Combine system prompt with memory and KB context.

    Args:
        base_prompt: The base system prompt.
        memory_context: Formatted memory context (XML block).
        kb_context: Formatted KB context string.

    Returns:
        Combined system prompt with injected context.
    """
    parts = [base_prompt]
    if memory_context:
        parts.append(f"\n\n{memory_context}")
    if kb_context:
        parts.append(f"\n\n# Relevant Context from Knowledge Base:\n{kb_context}")
    return "".join(parts)
