"""Vector store service – ChromaDB persistence for document embeddings."""
import logging
import os
import subprocess
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import chromadb
from chromadb.config import Settings

logger = logging.getLogger(__name__)

CHROMA_DIR = Path(__file__).parent.parent.parent / "data" / "chroma"
CHROMA_DIR.mkdir(parents=True, exist_ok=True)


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

    def add_documents(
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
            self.collection.add(
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

    def delete_by_file_path(self, file_path: str) -> int:
        """Delete all chunks for a specific file. Returns count of deleted chunks."""
        try:
            results = self.collection.get(where={"file_path": file_path})
            if results and results["ids"]:
                self.collection.delete(ids=results["ids"])
                logger.info("Deleted %d chunks for %s", len(results["ids"]), file_path)
                return len(results["ids"])
            return 0
        except Exception as exc:
            logger.error("Failed to delete file chunks: %s", exc)
            return 0

    def get_file_metadata(self, source_path: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a specific file stored in the vector DB."""
        try:
            results = self.collection.get(where={"file_path": source_path})
            if not results or not results["ids"]:
                return None
            metadatas = results["metadatas"] or []
            indexed_at = ""
            file_mtime = ""
            for m in metadatas:
                if m.get("indexed_at"):
                    indexed_at = m["indexed_at"]
                if m.get("file_mtime"):
                    file_mtime = m["file_mtime"]
            return {
                "indexed_at": indexed_at,
                "file_mtime": file_mtime,
                "chunk_count": len(results["ids"]),
            }
        except Exception as exc:
            logger.error("Failed to get file metadata for %s: %s", source_path, exc)
            return None

    def get_all_file_paths(self) -> List[str]:
        """Get all unique file paths stored in the collection."""
        try:
            all_data = self.collection.get(include=["metadatas"])
            paths = set()
            for meta in (all_data.get("metadatas") or []):
                if meta and meta.get("file_path"):
                    paths.add(meta["file_path"])
            return sorted(paths)
        except Exception as exc:
            logger.error("Failed to get file paths: %s", exc)
            return []

    def get_stats(self) -> Dict[str, Any]:
        """Get detailed collection statistics."""
        try:
            count = self.collection.count()

            # Get all metadata for aggregation
            all_data = self.collection.get(include=["metadatas"])
            metadatas = all_data.get("metadatas") or []

            # Aggregate by file type
            file_paths: Dict[str, int] = Counter()
            file_types: Dict[str, int] = Counter()
            last_indexed_at = ""

            for meta in metadatas:
                if not meta:
                    continue
                fp = meta.get("file_path", "")
                if fp:
                    file_paths[fp] += 1
                    ext = Path(fp).suffix.lower().lstrip(".")
                    if ext:
                        file_types[ext] += 1
                ia = meta.get("indexed_at", "")
                if ia and ia > last_indexed_at:
                    last_indexed_at = ia

            # Top sources by chunk count
            top_sources = [
                {"path": path, "chunks": cnt}
                for path, cnt in file_paths.most_common(20)
            ]

            # Calculate storage size
            storage_size_mb = self._get_storage_size_mb()

            return {
                "total_documents": len(file_paths),
                "total_chunks": count,
                "total_embeddings": count,
                "storage_size_mb": storage_size_mb,
                "indexed_files_by_type": dict(file_types),
                "last_indexed_at": last_indexed_at or None,
                "top_sources": top_sources,
                "collection_name": self.COLLECTION_NAME,
            }
        except Exception as exc:
            logger.error("Failed to get stats: %s", exc)
            return {
                "total_documents": 0,
                "total_chunks": 0,
                "total_embeddings": 0,
                "storage_size_mb": 0,
                "indexed_files_by_type": {},
                "last_indexed_at": None,
                "top_sources": [],
                "collection_name": self.COLLECTION_NAME,
            }

    def _get_storage_size_mb(self) -> float:
        """Calculate ChromaDB storage directory size in MB."""
        try:
            total = 0
            for dirpath, _dirnames, filenames in os.walk(CHROMA_DIR):
                for f in filenames:
                    total += os.path.getsize(os.path.join(dirpath, f))
            return round(total / (1024 * 1024), 2)
        except Exception:
            return 0.0

    def get_export_metadata(self) -> List[Dict[str, Any]]:
        """Get metadata for all files for CSV export."""
        try:
            all_data = self.collection.get(include=["metadatas"])
            metadatas = all_data.get("metadatas") or []

            file_info: Dict[str, Dict[str, Any]] = {}
            for meta in metadatas:
                if not meta:
                    continue
                fp = meta.get("file_path", "")
                if not fp:
                    continue
                if fp not in file_info:
                    ext = Path(fp).suffix.lower().lstrip(".")
                    file_info[fp] = {
                        "source_path": fp,
                        "source_type": ext,
                        "chunk_count": 0,
                        "indexed_at": meta.get("indexed_at", ""),
                        "file_size_kb": 0,
                        "last_modified": "",
                    }
                file_info[fp]["chunk_count"] += 1
                # Update indexed_at if newer
                ia = meta.get("indexed_at", "")
                if ia > file_info[fp]["indexed_at"]:
                    file_info[fp]["indexed_at"] = ia

            # Try to get file stats from disk
            for fp, info in file_info.items():
                try:
                    stat = os.stat(fp)
                    info["file_size_kb"] = round(stat.st_size / 1024, 1)
                    info["last_modified"] = datetime.fromtimestamp(
                        stat.st_mtime, tz=timezone.utc
                    ).isoformat()
                except (OSError, ValueError):
                    pass

            return sorted(file_info.values(), key=lambda x: x["chunk_count"], reverse=True)
        except Exception as exc:
            logger.error("Failed to get export metadata: %s", exc)
            return []


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
