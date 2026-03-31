"""LLM Provider abstraction – pluggable backends for Ollama, llama.cpp, Groq."""

from app.services.llm_providers.base import LLMProvider, ModelInfo

__all__ = ["LLMProvider", "ModelInfo"]
