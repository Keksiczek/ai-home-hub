"""Abstract base class for LLM providers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Dict, List, Optional


@dataclass
class ModelInfo:
    """Descriptor for an available model."""

    name: str
    size_gb: float = 0.0
    is_embedding: bool = False
    extra: Dict[str, Any] = field(default_factory=dict)


class LLMProvider(ABC):
    """Pluggable LLM backend.

    Implementations must provide generate, generate_stream, get_models,
    get_embeddings, and health_check.
    """

    @abstractmethod
    async def generate(
        self,
        messages: List[Dict[str, str]],
        model: str,
        options: Dict[str, Any],
        *,
        keep_alive: int | str | None = None,
        timeout: float = 180.0,
    ) -> tuple[str, Dict[str, Any]]:
        """Non-streaming generation.  Returns (reply_text, metadata)."""
        ...

    @abstractmethod
    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        model: str,
        options: Dict[str, Any],
        *,
        keep_alive: int | str | None = None,
        timeout: float = 90.0,
    ) -> AsyncIterator[str]:
        """Yield tokens as they arrive from the backend."""
        ...

    @abstractmethod
    async def get_models(self) -> List[ModelInfo]:
        """List available models."""
        ...

    @abstractmethod
    async def get_embeddings(
        self,
        text: str,
        model: str,
        *,
        num_ctx: int = 512,
    ) -> List[float]:
        """Return embedding vector for *text*."""
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Return True when the backend is reachable and ready."""
        ...
