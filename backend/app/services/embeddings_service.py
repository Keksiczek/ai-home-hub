"""Embeddings service – generate embeddings via Ollama with LRU cache."""

import asyncio
import hashlib
import logging
import time
from typing import Any, Dict, List, Optional

import httpx

from app.services.settings_service import get_settings_service
from app.utils.constants import LLM_TIMEOUT_EMBEDDING

logger = logging.getLogger(__name__)


class EmbeddingsService:
    """Generate text embeddings using Ollama with an in-memory LRU cache."""

    DEFAULT_MODEL = "nomic-embed-text"
    FALLBACK_MODEL = "llama3.2"
    # Ollama ≥0.4 uses /api/embed, older versions use /api/embeddings
    EMBED_ENDPOINT_PATHS = ["/api/embed", "/api/embeddings"]

    def __init__(self) -> None:
        self._cache: Dict[str, tuple] = {}  # {text_hash: (embedding, timestamp)}
        self._cache_max_size: int = 500
        self._cache_ttl_seconds: int = 3600  # 1 hour
        self._cache_hits: int = 0
        self._cache_misses: int = 0
        self._active_model: Optional[str] = None  # tracks which model is in use
        self._status: str = "unknown"  # "ok", "degraded", "unavailable"
        self._embedding_dim: Optional[int] = None  # detected dimension
        self._enabled: bool = True  # disabled when embed endpoint/model unavailable
        self._resolved_endpoint: Optional[str] = None  # cached working endpoint path

    @property
    def enabled(self) -> bool:
        return self._enabled

    async def get_embedding(self, text: str) -> Optional[List[float]]:
        """Get embedding with cache support. Returns None when service is disabled."""
        if not self._enabled:
            return None
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
        """Call Ollama embeddings API directly, with fallback to llama3.2.

        Auto-detects embedding dimension on first successful call and triggers
        a Chroma collection reset when the detected dimension differs from the
        one the collection was built with.

        Tries multiple endpoint paths (/api/embed, /api/embeddings) to cope
        with different Ollama versions.  When no endpoint/model works, the
        service is disabled so callers get a fast ``None`` instead of repeated
        HTTP errors.
        """
        settings = get_settings_service().load()
        ollama_url = (
            settings.get("llm", {})
            .get("ollama_url", "http://localhost:11434")
            .rstrip("/")
        )
        primary_model = settings.get("llm", {}).get(
            "embeddings_model", self.DEFAULT_MODEL
        )

        # Try primary model first, then fallback
        models_to_try = [primary_model]
        if self.FALLBACK_MODEL not in primary_model:
            models_to_try.append(self.FALLBACK_MODEL)

        # Determine which endpoint paths to try (prefer cached resolved one)
        if self._resolved_endpoint:
            endpoint_paths = [self._resolved_endpoint]
        else:
            endpoint_paths = list(self.EMBED_ENDPOINT_PATHS)

        last_error = None
        for model in models_to_try:
            for ep_path in endpoint_paths:
                try:
                    async with httpx.AsyncClient(
                        timeout=LLM_TIMEOUT_EMBEDDING
                    ) as client:
                        resp = await client.post(
                            f"{ollama_url}{ep_path}",
                            json={
                                "model": model,
                                "input": text,
                                "options": {"num_ctx": 2048},
                            },
                        )
                        if resp.status_code == 404:
                            logger.debug(
                                "Embed endpoint %s returned 404, trying next",
                                ep_path,
                            )
                            continue
                        resp.raise_for_status()
                        data = resp.json()
                        embedding = data.get("embeddings", [None])[0] or data.get(
                            "embedding"
                        )
                        if embedding:
                            new_dim = len(embedding)

                            # Cache the working endpoint path
                            if self._resolved_endpoint is None:
                                self._resolved_endpoint = ep_path
                                logger.info(
                                    "Embedding endpoint resolved: %s%s",
                                    ollama_url,
                                    ep_path,
                                )

                            # Auto-detect dimension and handle Chroma mismatch
                            if self._embedding_dim is None:
                                self._embedding_dim = new_dim
                                logger.info(
                                    "Embedding dim auto-detected: %d (model=%s)",
                                    new_dim,
                                    model,
                                )
                            elif self._embedding_dim != new_dim:
                                logger.warning(
                                    "Embedding dim changed: %d → %d (model=%s). "
                                    "Resetting Chroma collection.",
                                    self._embedding_dim,
                                    new_dim,
                                    model,
                                )
                                self._embedding_dim = new_dim
                                await self._reset_chroma_collection(new_dim)

                            if self._active_model != model:
                                self._active_model = model
                                if model != primary_model:
                                    logger.warning(
                                        "Embeddings: primary model '%s' unavailable, "
                                        "using fallback '%s'",
                                        primary_model,
                                        model,
                                    )
                                    self._status = f"degraded: using fallback {model}"
                                else:
                                    self._status = "ok"
                            return embedding
                except httpx.HTTPStatusError as exc:
                    last_error = exc
                    logger.warning(
                        "Embedding model '%s' on %s failed: %s", model, ep_path, exc
                    )
                    continue
                except (httpx.TimeoutException, httpx.ConnectError) as exc:
                    last_error = exc
                    logger.warning(
                        "Embedding model '%s' on %s failed: %s", model, ep_path, exc
                    )
                    continue
                except Exception as exc:
                    last_error = exc
                    logger.warning(
                        "Embedding model '%s' on %s failed: %s", model, ep_path, exc
                    )
                    continue

        logger.error(
            "All embedding models/endpoints failed – embeddings DISABLED. "
            "Last error: %s",
            last_error,
        )
        self._status = "unavailable"
        self._enabled = False
        return None

    async def _reset_chroma_collection(self, new_dim: int) -> None:
        """Drop and recreate the default Chroma collection when dimension changes."""
        try:
            from app.services.vector_store_service import (
                CHROMA_DIR,
                VectorStoreService,
                get_vector_store_service,
            )

            vs = get_vector_store_service()
            col_name = VectorStoreService.COLLECTION_NAME
            await asyncio.to_thread(vs.client.delete_collection, col_name)
            vs.collection = await asyncio.to_thread(
                vs.client.get_or_create_collection,
                col_name,
                metadata={"hnsw:space": "cosine", "embedding_dim": new_dim},
            )
            logger.warning(
                "Dropped old Chroma collection '%s', recreated for dim %d",
                col_name,
                new_dim,
            )
            # Invalidate the local embedding cache – old vectors are gone
            self._cache.clear()
        except Exception as exc:
            logger.error("Failed to reset Chroma collection: %s", exc, exc_info=True)

    def get_embedding_dim(self) -> Optional[int]:
        """Return the detected embedding dimension, or None if not yet known."""
        return self._embedding_dim

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
        if not self._enabled:
            return [None] * len(texts)

        semaphore = asyncio.Semaphore(concurrency)

        async def _limited(text: str) -> Optional[List[float]]:
            async with semaphore:
                return await self.get_embedding(text)

        return list(await asyncio.gather(*[_limited(t) for t in texts]))

    async def check_health(self) -> bool:
        """Probe embedding endpoint availability and update enabled flag.

        Called during startup to eagerly detect whether embeddings work.
        Runs a one-shot startup probe to determine the correct Ollama embed
        endpoint (/api/embed vs /api/embeddings), caches it for the entire
        runtime, and logs the result clearly.

        Also detects and resolves Chroma dimension mismatches (drop + recreate).
        """
        # Reset resolved endpoint so the probe tries both paths fresh
        self._resolved_endpoint = None

        result = await self._fetch_embedding_from_ollama("startup embed probe")
        if result is not None:
            self._enabled = True
            logger.info(
                "Ollama embed endpoint: %s (model=%s, dim=%s)",
                self._resolved_endpoint or "unknown",
                self._active_model or "unknown",
                self._embedding_dim,
            )
            # Verify Chroma collection dimension compatibility
            await self._verify_chroma_dim()
            return True
        # _fetch_embedding_from_ollama already sets _enabled = False
        logger.warning(
            "Embedding health check failed – embeddings DISABLED. "
            "Install an embedding model (e.g. `ollama pull %s`) and restart.",
            self.DEFAULT_MODEL,
        )
        return False

    async def _verify_chroma_dim(self) -> None:
        """Check that the existing Chroma collection dimension matches the model."""
        if self._embedding_dim is None:
            return
        try:
            from app.services.vector_store_service import get_vector_store_service

            vs = get_vector_store_service()
            col_meta = vs.collection.metadata or {}
            stored_dim = col_meta.get("embedding_dim")
            if stored_dim is not None and int(stored_dim) != self._embedding_dim:
                logger.warning(
                    "Chroma collection dim %s != model dim %d – dropping and recreating.",
                    stored_dim,
                    self._embedding_dim,
                )
                await self._reset_chroma_collection(self._embedding_dim)
        except Exception as exc:
            logger.warning("Chroma dimension verification failed: %s", exc)

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
