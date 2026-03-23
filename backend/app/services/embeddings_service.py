"""Embeddings service – generate embeddings via Ollama with LRU cache."""
import asyncio
import hashlib
import logging
import time
from typing import Any, Dict, List, Optional

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class EmbeddingsService:
    """Generate text embeddings using Ollama with an in-memory LRU cache."""

    DEFAULT_MODEL = "nomic-embed-text"
    FALLBACK_MODEL = "llama3.2"

    def __init__(self) -> None:
        self._cache: Dict[str, tuple] = {}  # {text_hash: (embedding, timestamp)}
        self._cache_max_size: int = 500
        self._cache_ttl_seconds: int = 3600  # 1 hour
        self._cache_hits: int = 0
        self._cache_misses: int = 0
        self._active_model: Optional[str] = None  # tracks which model is in use
        self._status: str = "unknown"  # "ok", "degraded", "unavailable"

    async def get_embedding(self, text: str) -> Optional[List[float]]:
        """Get embedding with cache support. Falls back to generate_embedding on miss."""
        if not text.strip():
            return None

        text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]

        # Cache hit check
        if text_hash in self._cache:
            embedding, cached_at = self._cache[text_hash]
            if time.time() - cached_at < self._cache_ttl_seconds:
                self._cache_hits += 1
                return embedding
            else:
                # Expired – remove stale entry
                del self._cache[text_hash]

        # Cache miss – fetch from Ollama
        self._cache_misses += 1
        embedding = await self._fetch_embedding_from_ollama(text)

        if embedding is not None:
            # Evict oldest if full
            if len(self._cache) >= self._cache_max_size:
                oldest_key = min(self._cache, key=lambda k: self._cache[k][1])
                del self._cache[oldest_key]

            self._cache[text_hash] = (embedding, time.time())

        return embedding

    async def _fetch_embedding_from_ollama(self, text: str) -> Optional[List[float]]:
        """Call Ollama embeddings API directly, with fallback to llama3.2."""
        settings = get_settings_service().load()
        ollama_url = settings.get("llm", {}).get("ollama_url", "http://localhost:11434").rstrip("/")
        primary_model = settings.get("llm", {}).get("embeddings_model", self.DEFAULT_MODEL)

        # Try primary model first, then fallback
        models_to_try = [primary_model]
        if self.FALLBACK_MODEL not in primary_model:
            models_to_try.append(self.FALLBACK_MODEL)

        last_error = None
        for model in models_to_try:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        f"{ollama_url}/api/embed",
                        json={"model": model, "input": text},
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    embedding = data.get("embeddings", [None])[0] or data.get("embedding")
                    if embedding:
                        if self._active_model != model:
                            self._active_model = model
                            if model != primary_model:
                                logger.warning(
                                    "Embeddings: primary model '%s' unavailable, using fallback '%s'",
                                    primary_model, model,
                                )
                                self._status = f"degraded: using fallback {model}"
                            else:
                                self._status = "ok"
                        return embedding
            except Exception as exc:
                last_error = exc
                logger.warning("Embedding model '%s' failed: %s", model, exc)
                continue

        logger.error("All embedding models failed. Last error: %s", last_error, exc_info=True)
        self._status = "unavailable"
        return None

    def get_status(self) -> str:
        """Return current embeddings status for health checks."""
        return self._status

    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for a single text (uses cache)."""
        return await self.get_embedding(text)

    async def generate_embeddings_batch(
        self, texts: List[str], concurrency: int = 8
    ) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts in parallel with caching."""
        semaphore = asyncio.Semaphore(concurrency)

        async def _limited(text: str) -> Optional[List[float]]:
            async with semaphore:
                return await self.get_embedding(text)

        return list(await asyncio.gather(*[_limited(t) for t in texts]))

    def get_cache_stats(self) -> Dict[str, Any]:
        """Return cache statistics."""
        total = self._cache_hits + self._cache_misses
        hit_rate = (self._cache_hits / total * 100) if total > 0 else 0.0
        return {
            "size": len(self._cache),
            "max_size": self._cache_max_size,
            "hits": self._cache_hits,
            "misses": self._cache_misses,
            "hit_rate_percent": round(hit_rate, 1),
        }

    def clear_cache(self) -> Dict[str, Any]:
        """Clear the embedding cache and return pre-clear stats."""
        stats = self.get_cache_stats()
        self._cache.clear()
        self._cache_hits = 0
        self._cache_misses = 0
        return stats


# Singleton
_embeddings_service: Optional[EmbeddingsService] = None


def get_embeddings_service() -> EmbeddingsService:
    global _embeddings_service
    if _embeddings_service is None:
        _embeddings_service = EmbeddingsService()
    return _embeddings_service
