"""Vector store service – ChromaDB persistence for document embeddings."""
import asyncio
import logging
import os
import subprocess
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

import chromadb
from chromadb.config import Settings

logger = logging.getLogger(__name__)

CHROMA_DIR = Path(__file__).parent.parent.parent / "data" / "chroma"
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Process-wide write lock – serialises all Chroma mutations so that concurrent
# asyncio tasks (ResidentAgent, NightScheduler, KB reindex, memory writes)
# never trigger SQLite "database is locked" errors.
# ---------------------------------------------------------------------------
_VECTOR_WRITE_LOCK: asyncio.Lock | None = None


def get_vector_write_lock() -> asyncio.Lock:
    global _VECTOR_WRITE_LOCK
    if _VECTOR_WRITE_LOCK is None:
        _VECTOR_WRITE_LOCK = asyncio.Lock()
    return _VECTOR_WRITE_LOCK


class VectorStoreService:
    """Manage document embeddings in ChromaDB."""

    COLLECTION_NAME = "knowledge_base"

    def __init__(self) -> None:
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
        """Execute a synchronous Chroma write under the global write lock.

        Runs the operation in a thread-pool so the event loop is not blocked,
        and acquires the process-wide write lock first to serialise mutations.
        """
        lock = get_vector_write_lock()
        async with lock:
            return await asyncio.to_thread(operation, *args, **kwargs)

    async def add_documents(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
    ) -> None:
        """Add documents to vector store."""
        try:
            # ChromaDB metadata values must be str, int, float, or bool
            safe_metadatas = [_sanitize_metadata(m) for m in metadatas]
            await self._safe_write(
                self.collection.add,
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=safe_metadatas,
            )
            logger.info("Added %d documents to vector store", len(ids))
        except Exception as exc:
            logger.error("Failed to add documents: %s", exc)
            raise

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Search for similar documents.

        Returns dict with ids, documents, metadatas, distances.
        """
        try:
            kwargs: Dict[str, Any] = {
                "query_embeddings": [query_embedding],
                "n_results": top_k,
            }
            if filter_metadata:
                kwargs["where"] = filter_metadata

            results = self.collection.query(**kwargs)

            return {
                "ids": results["ids"][0] if results["ids"] else [],
                "documents": results["documents"][0] if results["documents"] else [],
                "metadatas": results["metadatas"][0] if results["metadatas"] else [],
                "distances": results["distances"][0] if results["distances"] else [],
            }
        except Exception as exc:
            logger.error("Search failed: %s", exc)
            return {"ids": [], "documents": [], "metadatas": [], "distances": []}

    async def delete_by_file_path(self, file_path: str) -> int:
        """Delete all chunks for a specific file. Returns count of deleted chunks."""
        try:
            results = await asyncio.to_thread(
                self.collection.get, where={"file_path": file_path}
            )
            if results and results["ids"]:
                await self._safe_write(self.collection.delete, ids=results["ids"])
                logger.info("Deleted %d chunks for %s", len(results["ids"]), file_path)
                return len(results["ids"])
            return 0
        except Exception as exc:
            logger.error("Failed to delete file chunks: %s", exc)
            return 0

    def get_stats(self, detailed: bool = True, sample_limit: int = 10_000) -> Dict[str, Any]:
        """Get collection statistics.

        For large collections (>100k chunks), ``detailed=True`` analyses only
        the first *sample_limit* metadata records and sets ``sampled=True`` in
        the response so callers can warn the user.

        Args:
            detailed: When False return only lightweight counts (no metadata
                      scan).  When True also return ``file_types`` and
                      ``top_sources`` breakdowns.
            sample_limit: Maximum number of metadata records to analyse for
                          detailed breakdowns.  Has no effect when
                          ``detailed=False``.
        """
        LARGE_THRESHOLD = 50_000

        try:
            total_chunks = self.collection.count()
        except Exception as exc:
            logger.error("Failed to count collection: %s", exc)
            return {
                "total_chunks": 0,
                "collection_name": self.COLLECTION_NAME,
                "detailed": detailed,
            }

        base: Dict[str, Any] = {
            "total_chunks": total_chunks,
            "collection_name": self.COLLECTION_NAME,
            "detailed": detailed,
        }

        if not detailed:
            return base

        # --- detailed pass: fetch a bounded sample of metadatas ---
        sampled = total_chunks > LARGE_THRESHOLD
        fetch_limit = sample_limit if sampled else total_chunks

        try:
            result = self.collection.get(
                limit=fetch_limit,
                include=["metadatas"],
            )
            metadatas: List[Dict[str, Any]] = result.get("metadatas") or []
        except Exception as exc:
            logger.warning("Metadata fetch for stats failed: %s", exc)
            metadatas = []

        # file_types breakdown  (by extension)
        file_types: Dict[str, int] = {}
        source_chunks: Dict[str, int] = {}

        for meta in metadatas:
            file_path = meta.get("file_path", "")
            ext = Path(file_path).suffix.lower() if file_path else ""
            file_types[ext or "unknown"] = file_types.get(ext or "unknown", 0) + 1
            source_chunks[file_path] = source_chunks.get(file_path, 0) + 1

        unique_files = len(source_chunks)
        top_sources = sorted(source_chunks.items(), key=lambda x: x[1], reverse=True)[:20]

        base.update({
            "total_documents": unique_files,
            "file_types": file_types,
            "top_sources": [{"path": p, "chunks": c} for p, c in top_sources],
            "sample_size": len(metadatas),
            "sampled": sampled,
        })
        if sampled:
            base["warning"] = (
                f"Stats are based on a sample of {len(metadatas):,} / {total_chunks:,} chunks. "
                "Re-index to get exact file counts."
            )
        return base


def _sanitize_metadata(meta: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure all metadata values are ChromaDB-compatible (str, int, float, bool)."""
    sanitized = {}
    for key, value in meta.items():
        if isinstance(value, (str, int, float, bool)):
            sanitized[key] = value
        elif isinstance(value, (list, tuple)):
            sanitized[key] = ", ".join(str(v) for v in value)
        elif value is None:
            sanitized[key] = ""
        else:
            sanitized[key] = str(value)
    return sanitized


# Singleton
_vector_store_service = None


def get_vector_store_service() -> VectorStoreService:
    global _vector_store_service
    if _vector_store_service is None:
        _vector_store_service = VectorStoreService()
    return _vector_store_service
