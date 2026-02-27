"""Embeddings service – generate embeddings via Ollama."""
import logging
from typing import List, Optional

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class EmbeddingsService:
    """Generate text embeddings using Ollama."""

    DEFAULT_MODEL = "nomic-embed-text"

    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """
        Generate embedding for a single text.

        Returns:
            List of floats (embedding vector) or None on error.
        """
        if not text.strip():
            return None

        settings = get_settings_service().load()
        ollama_url = settings.get("llm", {}).get("ollama_url", "http://localhost:11434").rstrip("/")
        model = settings.get("llm", {}).get("embeddings_model", self.DEFAULT_MODEL)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{ollama_url}/api/embeddings",
                    json={"model": model, "prompt": text},
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("embedding")

        except Exception as exc:
            logger.error("Failed to generate embedding: %s", exc)
            return None

    async def generate_embeddings_batch(
        self, texts: List[str]
    ) -> List[Optional[List[float]]]:
        """
        Generate embeddings for multiple texts.

        Returns:
            List of embeddings (None for failed items).
        """
        embeddings = []
        for text in texts:
            emb = await self.generate_embedding(text)
            embeddings.append(emb)
        return embeddings


# Singleton
_embeddings_service = None


def get_embeddings_service() -> EmbeddingsService:
    global _embeddings_service
    if _embeddings_service is None:
        _embeddings_service = EmbeddingsService()
    return _embeddings_service
