"""Vector store service – ChromaDB persistence for document embeddings."""
import logging
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

    def get_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        try:
            count = self.collection.count()
            return {
                "total_chunks": count,
                "collection_name": self.COLLECTION_NAME,
            }
        except Exception as exc:
            logger.error("Failed to get stats: %s", exc)
            return {"total_chunks": 0, "collection_name": self.COLLECTION_NAME}


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
