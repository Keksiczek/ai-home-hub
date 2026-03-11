"""Shared Memory service – long-term user memory backed by ChromaDB.

This is a lightweight memory layer separate from the Knowledge Base.
It stores user facts, preferences, and summaries (not full documents)
in a dedicated ChromaDB collection named "memory".
"""

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from typing import Any, Callable, Dict, List, Optional

import chromadb
from chromadb.config import Settings

from app.services.embeddings_service import get_embeddings_service
from app.services.vector_store_service import CHROMA_DIR, get_vector_write_lock

logger = logging.getLogger(__name__)


@dataclass
class MemoryRecord:
    """A single memory entry."""

    id: str
    text: str
    tags: List[str]
    source: str
    importance: int
    timestamp: str
    distance: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class MemoryService:
    """CRUD operations over a ChromaDB "memory" collection."""

    COLLECTION_NAME = "memory"

    def __init__(self) -> None:
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=str(CHROMA_DIR),
            settings=Settings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    async def _safe_write(
        self,
        operation: Callable[..., Any],
        *args: Any,
        **kwargs: Any,
    ) -> Any:
        """Execute a synchronous Chroma write under the global write lock."""
        lock = get_vector_write_lock()
        async with lock:
            return await asyncio.to_thread(operation, *args, **kwargs)

    async def add_memory(
        self,
        text: str,
        tags: Optional[List[str]] = None,
        source: str = "",
        importance: int = 5,
    ) -> str:
        """Add a new memory record. Returns the generated memory_id."""
        if tags is None:
            tags = []

        memory_id = f"mem_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.now(timezone.utc).isoformat()

        embeddings_svc = get_embeddings_service()
        embedding = await embeddings_svc.generate_embedding(text)
        if not embedding:
            raise ValueError("Failed to generate embedding for memory text")

        metadata = {
            "tags": ", ".join(tags) if tags else "",
            "source": source,
            "importance": importance,
            "timestamp": timestamp,
        }

        await self._safe_write(
            self.collection.add,
            ids=[memory_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata],
        )
        logger.info("Added memory %s (importance=%d)", memory_id, importance)
        return memory_id

    async def search_memory(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[MemoryRecord]:
        """Semantic search over memories. Returns sorted results."""
        embeddings_svc = get_embeddings_service()
        embedding = await embeddings_svc.generate_embedding(query)
        if not embedding:
            return []

        kwargs: Dict[str, Any] = {
            "query_embeddings": [embedding],
            "n_results": min(top_k, max(self.collection.count(), 1)),
        }

        if filters and "tags" in filters:
            tag_values = filters["tags"]
            if isinstance(tag_values, list) and len(tag_values) == 1:
                kwargs["where"] = {"tags": {"$contains": tag_values[0]}}
            elif isinstance(tag_values, list) and len(tag_values) > 1:
                kwargs["where"] = {
                    "$or": [{"tags": {"$contains": t}} for t in tag_values]
                }

        try:
            results = self.collection.query(**kwargs)
        except Exception as exc:
            logger.error("Memory search failed: %s", exc)
            return []

        records: List[MemoryRecord] = []
        if not results["ids"] or not results["ids"][0]:
            return records

        for doc_id, doc, meta, dist in zip(
            results["ids"][0],
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            tags_str = meta.get("tags", "")
            records.append(
                MemoryRecord(
                    id=doc_id,
                    text=doc,
                    tags=[t.strip() for t in tags_str.split(",") if t.strip()],
                    source=meta.get("source", ""),
                    importance=int(meta.get("importance", 5)),
                    timestamp=meta.get("timestamp", ""),
                    distance=dist,
                )
            )

        return records

    def get_all_memories(self, limit: int = 100) -> List[MemoryRecord]:
        """Return all memories up to limit."""
        count = self.collection.count()
        if count == 0:
            return []

        results = self.collection.get(
            limit=min(limit, count),
            include=["documents", "metadatas"],
        )

        records: List[MemoryRecord] = []
        for doc_id, doc, meta in zip(
            results["ids"],
            results["documents"],
            results["metadatas"],
        ):
            tags_str = meta.get("tags", "")
            records.append(
                MemoryRecord(
                    id=doc_id,
                    text=doc,
                    tags=[t.strip() for t in tags_str.split(",") if t.strip()],
                    source=meta.get("source", ""),
                    importance=int(meta.get("importance", 5)),
                    timestamp=meta.get("timestamp", ""),
                )
            )

        return records

    async def delete_memory(self, memory_id: str) -> bool:
        """Delete a memory by ID. Returns True if deleted."""
        try:
            existing = await asyncio.to_thread(
                self.collection.get, ids=[memory_id]
            )
            if not existing["ids"]:
                return False
            await self._safe_write(self.collection.delete, ids=[memory_id])
            logger.info("Deleted memory %s", memory_id)
            return True
        except Exception as exc:
            logger.error("Failed to delete memory %s: %s", memory_id, exc)
            return False

    async def store_agent_run(
        self,
        agent_id: str,
        agent_type: str,
        goal: str,
        result: str,
        status: str,
    ) -> str:
        """Uloží dokončený agent run jako memory entry. Returns memory entry ID."""
        memory_id = f"mem_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.now(timezone.utc).isoformat()
        content = f"[{agent_type}] Goal: {goal} | Status: {status} | Result: {result[:500]}"

        metadata = {
            "tags": "agent_run",
            "source": f"agent_{agent_id}",
            "importance": 5,
            "timestamp": timestamp,
            "category": "agent_run",
            "agent_id": agent_id,
            "agent_type": agent_type,
            "status": status,
        }

        embeddings_svc = get_embeddings_service()
        embedding = await embeddings_svc.generate_embedding(content)

        if not embedding:
            logger.warning("Failed to generate embedding for agent run %s", agent_id)
            await self._safe_write(
                self.collection.add,
                ids=[memory_id],
                documents=[content],
                metadatas=[metadata],
            )
        else:
            await self._safe_write(
                self.collection.add,
                ids=[memory_id],
                embeddings=[embedding],
                documents=[content],
                metadatas=[metadata],
            )

        logger.info("Stored agent run %s (type=%s, status=%s)", agent_id, agent_type, status)
        return memory_id

    async def store_system_event(self, event_type: str, content: str) -> str:
        """Uloží systémovou událost (resource warning, agent error, periodic check)."""
        memory_id = f"mem_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.now(timezone.utc).isoformat()

        metadata = {
            "tags": "system_event",
            "source": "system",
            "importance": 4,
            "timestamp": timestamp,
            "category": "system_event",
            "event_type": event_type,
        }

        embeddings_svc = get_embeddings_service()
        embedding = await embeddings_svc.generate_embedding(content)

        if not embedding:
            await self._safe_write(
                self.collection.add,
                ids=[memory_id],
                documents=[content],
                metadatas=[metadata],
            )
        else:
            await self._safe_write(
                self.collection.add,
                ids=[memory_id],
                embeddings=[embedding],
                documents=[content],
                metadatas=[metadata],
            )

        logger.info("Stored system event: %s", event_type)
        return memory_id

    async def search_agent_history(self, query: str, top_k: int = 5) -> List[MemoryRecord]:
        """Prohledá memory filtrovanou na category == 'agent_run'."""
        embeddings_svc = get_embeddings_service()
        embedding = await embeddings_svc.generate_embedding(query)
        if not embedding:
            return []

        kwargs: Dict[str, Any] = {
            "query_embeddings": [embedding],
            "n_results": min(top_k, max(self.collection.count(), 1)),
            "where": {"category": "agent_run"},
        }

        try:
            results = self.collection.query(**kwargs)
        except Exception as exc:
            logger.error("Agent history search failed: %s", exc)
            return []

        records: List[MemoryRecord] = []
        if not results["ids"] or not results["ids"][0]:
            return records

        for doc_id, doc, meta, dist in zip(
            results["ids"][0],
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            tags_str = meta.get("tags", "")
            records.append(
                MemoryRecord(
                    id=doc_id,
                    text=doc,
                    tags=[t.strip() for t in tags_str.split(",") if t.strip()],
                    source=meta.get("source", ""),
                    importance=int(meta.get("importance", 5)),
                    timestamp=meta.get("timestamp", ""),
                    distance=dist,
                )
            )

        return records

    def get_recent_events(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Vrátí posledních N system_event entries, seřazených podle timestamp DESC."""
        try:
            results = self.collection.get(
                where={"category": "system_event"},
                limit=limit,
                include=["documents", "metadatas"],
            )
        except Exception as exc:
            logger.error("Get recent events failed: %s", exc)
            return []

        events: List[Dict[str, Any]] = []
        if not results["ids"]:
            return events

        for doc_id, doc, meta in zip(
            results["ids"],
            results["documents"],
            results["metadatas"],
        ):
            events.append({
                "id": doc_id,
                "text": doc,
                "event_type": meta.get("event_type", ""),
                "timestamp": meta.get("timestamp", ""),
                "importance": int(meta.get("importance", 4)),
            })

        # Sort by timestamp DESC
        events.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
        return events[:limit]

    async def update_memory(
        self,
        memory_id: str,
        new_text: Optional[str] = None,
        new_tags: Optional[List[str]] = None,
        new_importance: Optional[int] = None,
    ) -> bool:
        """Update an existing memory. Returns True if updated."""
        try:
            existing = await asyncio.to_thread(
                self.collection.get,
                ids=[memory_id],
                include=["documents", "metadatas"],
            )
            if not existing["ids"]:
                return False

            current_doc = existing["documents"][0]
            current_meta = existing["metadatas"][0]

            updated_text = new_text if new_text is not None else current_doc
            updated_meta = dict(current_meta)

            if new_tags is not None:
                updated_meta["tags"] = ", ".join(new_tags)
            if new_importance is not None:
                updated_meta["importance"] = new_importance

            # Re-generate embedding if text changed
            embedding = None
            if new_text is not None and new_text != current_doc:
                embeddings_svc = get_embeddings_service()
                embedding = await embeddings_svc.generate_embedding(new_text)
                if not embedding:
                    return False

            update_kwargs: Dict[str, Any] = {
                "ids": [memory_id],
                "documents": [updated_text],
                "metadatas": [updated_meta],
            }
            if embedding:
                update_kwargs["embeddings"] = [embedding]

            await self._safe_write(self.collection.update, **update_kwargs)
            logger.info("Updated memory %s", memory_id)
            return True

        except Exception as exc:
            logger.error("Failed to update memory %s: %s", memory_id, exc)
            return False


# Singleton
_memory_service: Optional[MemoryService] = None


def get_memory_service() -> MemoryService:
    global _memory_service
    if _memory_service is None:
        _memory_service = MemoryService()
    return _memory_service
