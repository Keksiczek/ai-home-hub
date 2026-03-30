"""KB Search Service – semantic search, tag filtering, query processing.

Extracted from routers/knowledge.py to separate search logic from HTTP handlers.
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional

from app.services.embeddings_service import get_embeddings_service
from app.services.vector_store_service import get_vector_store_service
from app.utils.constants import MIN_KB_SEARCH_SCORE

logger = logging.getLogger(__name__)


async def search_kb(query: str, top_k: int = 5) -> Dict[str, Any]:
    """Basic semantic search in the default knowledge base collection."""
    embeddings_svc = get_embeddings_service()
    vector_store = get_vector_store_service()

    query_embedding = await embeddings_svc.generate_embedding(query)
    if not query_embedding:
        model = embeddings_svc._active_model or embeddings_svc.DEFAULT_MODEL
        return {"error": f"Embedding model unavailable: {model}", "results": []}

    search_results = vector_store.search(
        query_embedding=query_embedding,
        top_k=top_k,
    )

    results = []
    for doc, metadata, distance in zip(
        search_results["documents"],
        search_results["metadatas"],
        search_results["distances"],
    ):
        score = round(1 - distance, 4)
        if score < MIN_KB_SEARCH_SCORE:
            continue
        results.append(
            {
                "text": doc,
                "file_name": metadata.get("file_name", ""),
                "file_path": metadata.get("file_path", ""),
                "score": score,
                "metadata": metadata,
            }
        )

    return {"results": results, "query": query}


async def search_kb_with_filters(
    q: str = "",
    collection: Optional[str] = None,
    tag: Optional[str] = None,
    top_k: int = 5,
) -> Dict[str, Any]:
    """Semantic search with optional collection and tag filtering."""
    vector_store = get_vector_store_service()

    # Tag-only search (no embedding needed)
    if tag and not q.strip():
        col_name = collection or vector_store.COLLECTION_NAME
        results = await vector_store.search_by_tag(collection=col_name, tag=tag)
        items = [
            {"text": doc, "metadata": meta, "score": None}
            for doc, meta in zip(results["documents"], results["metadatas"])
        ][:top_k]
        return {"results": items, "query": q, "collection": col_name, "tag": tag}

    # Semantic search requires query
    if not q.strip():
        return {"error": "'q' or 'tag' parameter is required", "results": []}

    embeddings_svc = get_embeddings_service()
    query_embedding = await embeddings_svc.generate_embedding(q)
    if not query_embedding:
        model = embeddings_svc._active_model or embeddings_svc.DEFAULT_MODEL
        return {
            "error": f"Embedding model unavailable: {model}. Run: ollama pull {model}",
            "results": [],
        }

    col_name = collection or vector_store.COLLECTION_NAME
    if col_name == vector_store.COLLECTION_NAME:
        col_obj = vector_store.collection
    else:
        try:
            col_obj = await asyncio.to_thread(
                vector_store.client.get_collection, col_name
            )
        except Exception:
            return {"error": f"Collection '{col_name}' not found", "results": []}

    # Guard: ChromaDB raises if n_results > collection size or collection is empty
    col_count = await asyncio.to_thread(col_obj.count)
    if col_count == 0:
        return {
            "results": [],
            "query": q,
            "collection": col_name,
            "tag": tag,
            "total": 0,
            "message": "Znalostní báze je prázdná – nejprve přidej dokumenty.",
        }

    kwargs: Dict[str, Any] = {
        "query_embeddings": [query_embedding],
        "n_results": min(top_k, col_count),
    }
    try:
        raw = await asyncio.to_thread(col_obj.query, **kwargs)
    except Exception as exc:
        logger.warning(
            "KB search query failed (collection=%s, count=%d): %s",
            col_name, col_count, exc,
        )
        return {
            "results": [],
            "query": q,
            "collection": col_name,
            "tag": tag,
            "total": 0,
        }

    docs = raw["documents"][0] if raw.get("documents") else []
    metas = raw["metadatas"][0] if raw.get("metadatas") else []
    dists = raw["distances"][0] if raw.get("distances") else []

    results = []
    for doc, meta, dist in zip(docs, metas, dists):
        score = round(1 - dist, 4)
        if score < MIN_KB_SEARCH_SCORE:
            continue
        if tag:
            doc_tags = json.loads((meta or {}).get("tags", "[]"))
            if tag not in doc_tags:
                continue
        results.append(
            {
                "text": doc,
                "file_name": (meta or {}).get("file_name", ""),
                "file_path": (meta or {}).get("file_path", ""),
                "score": score,
                "metadata": meta,
            }
        )

    return {"results": results, "query": q, "collection": col_name, "tag": tag}
