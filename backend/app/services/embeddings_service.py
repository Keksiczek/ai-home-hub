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

    def __init__(self) -> None:
        self._cache: Dict[str, tuple] = {}  # {text_hash: (embedding, timestamp)}
        self._cache_max_size: int = 500
        self._cache_ttl_seconds: int = 3600  # 1 hour
        self._cache_hits: int = 0
        self._cache_misses: int = 0

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
        """Call Ollama embeddings API directly."""
        settings = get_settings_service().load()
        ollama_url = settings.get("llm", {}).get("ollama_url", "http://localhost:11434").rstrip("/")
        model = settings.get("llm", {}).get("embeddings_model", self.DEFAULT_MODEL)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{ollama_url}/api/embed",
                    json={"model": model, "prompt": text},
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("embedding")
        except Exception as exc:
            logger.error("Failed to generate embedding: %s", exc, exc_info=True)
            return None

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
