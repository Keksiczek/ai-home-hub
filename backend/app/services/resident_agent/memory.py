"""Resident Agent – memory operations (search, store, clear)."""

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


class MemoryMixin:
    """Mixin providing memory operations for ResidentAgent."""

    async def get_agent_memory(self, limit: int = 50) -> List[dict]:
        """Retrieve agent memory entries from memory_service."""
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            records = await mem.search_memory("resident agent", top_k=limit)
            return [r.to_dict() for r in records]
        except Exception as exc:
            logger.debug("Failed to get agent memory: %s", exc)
            return []

    async def clear_agent_memory(self) -> dict:
        """Clear all resident agent memory entries."""
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            # Search for resident-tagged memories and delete them
            records = await mem.search_memory("resident", top_k=200)
            deleted = 0
            for r in records:
                if "resident" in r.tags:
                    try:
                        await mem.delete_memory(r.id)
                        deleted += 1
                    except Exception:
                        pass
            self._add_log("INFO", "memory_cleared", deleted=deleted)
            return {"status": "ok", "deleted": deleted}
        except Exception as exc:
            logger.debug("Failed to clear agent memory: %s", exc)
            return {"status": "error", "error": str(exc)}

    async def delete_agent_memory_by_id(self, memory_id: str) -> dict:
        """Delete a single agent memory entry by ID."""
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            deleted = await mem.delete_memory(memory_id)
            if not deleted:
                return {"status": "not_found", "memory_id": memory_id}
            self._add_log("INFO", "memory_item_deleted", memory_id=memory_id)
            return {"status": "ok", "memory_id": memory_id}
        except Exception as exc:
            logger.debug("Failed to delete agent memory %s: %s", memory_id, exc)
            return {"status": "error", "error": str(exc)}

    async def add_agent_memory_manual(
        self, content: str, tags: Optional[list] = None
    ) -> dict:
        """Manually add an entry to agent memory."""
        try:
            from app.services.memory_service import get_memory_service

            mem = get_memory_service()
            all_tags = list({"resident", "manual", *(tags or [])})
            memory_id = await mem.add_memory(
                text=content,
                tags=all_tags,
                source="manual",
                importance=5,
            )
            self._add_log("INFO", "memory_item_added_manual", memory_id=memory_id)
            return {"status": "ok", "memory_id": memory_id}
        except Exception as exc:
            logger.debug("Failed to add agent memory: %s", exc)
            return {"status": "error", "error": str(exc)}
