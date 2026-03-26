"""LLM Profile Configuration – per-profile model, context, temperature, timeout.

Each profile can be overridden via environment variables:
    LLM_MODEL_CHAT=qwen2.5:7b-instruct-q4_K_M
    LLM_CTX_CHAT=4096
    LLM_TEMP_CHAT=0.7
    LLM_TIMEOUT_CHAT=90

Profile names are uppercased for env var lookup (e.g. resident_reasoner → RESIDENT_REASONER).
"""

import logging
import os
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


@dataclass
class LLMProfile:
    """Configuration for a single LLM profile."""

    name: str
    model: str
    num_ctx: int
    temperature: float
    timeout_s: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "model": self.model,
            "num_ctx": self.num_ctx,
            "temperature": self.temperature,
            "timeout_s": self.timeout_s,
        }


# ── Default profiles ──────────────────────────────────────────────────────────

_DEFAULT_PROFILES: Dict[str, Dict[str, Any]] = {
    "chat": {
        "model": "qwen2.5:7b-instruct-q4_K_M",
        "num_ctx": 4096,
        "temperature": 0.7,
        "timeout_s": 90,
    },
    "resident_reasoner": {
        "model": "qwen2.5:7b-instruct-q4_K_M",
        "num_ctx": 3072,
        "temperature": 0.4,
        "timeout_s": 90,
    },
    "resident_reflection": {
        "model": "llama3.2:3b-instruct",
        "num_ctx": 2048,
        "temperature": 0.3,
        "timeout_s": 60,
    },
    "resident_mission_planner": {
        "model": "qwen2.5:7b-instruct-q4_K_M",
        "num_ctx": 4096,
        "temperature": 0.5,
        "timeout_s": 90,
    },
    "background_job": {
        "model": "llama3.2:3b-instruct",
        "num_ctx": 2048,
        "temperature": 0.3,
        "timeout_s": 60,
    },
    "general": {
        "model": "qwen2.5:7b-instruct-q4_K_M",
        "num_ctx": 4096,
        "temperature": 0.7,
        "timeout_s": 90,
    },
}


def _env_key(profile_name: str, param: str) -> str:
    """Build environment variable name for a profile parameter."""
    return f"LLM_{param}_{profile_name}".upper()


def _resolve_profile(name: str, defaults: Dict[str, Any]) -> LLMProfile:
    """Resolve a profile, applying environment variable overrides."""
    model = os.environ.get(_env_key(name, "MODEL"), defaults["model"])
    num_ctx = int(os.environ.get(_env_key(name, "CTX"), defaults["num_ctx"]))
    temperature = float(os.environ.get(_env_key(name, "TEMP"), defaults["temperature"]))
    timeout_s = int(os.environ.get(_env_key(name, "TIMEOUT"), defaults["timeout_s"]))
    return LLMProfile(
        name=name,
        model=model,
        num_ctx=num_ctx,
        temperature=temperature,
        timeout_s=timeout_s,
    )


class LLMProfileRegistry:
    """Registry of LLM profiles with env-var override support."""

    def __init__(self) -> None:
        self._profiles: Dict[str, LLMProfile] = {}
        self._user_overrides: Dict[str, Dict[str, Any]] = {}
        self._reload()

    def _reload(self) -> None:
        """Rebuild profiles from defaults + env overrides + user overrides."""
        self._profiles.clear()
        for name, defaults in _DEFAULT_PROFILES.items():
            merged = dict(defaults)
            # Apply user overrides (from settings)
            if name in self._user_overrides:
                merged.update(self._user_overrides[name])
            self._profiles[name] = _resolve_profile(name, merged)

    def get(self, profile_name: str) -> LLMProfile:
        """Get a profile by name, falling back to 'general'."""
        if profile_name not in self._profiles:
            return self._profiles.get("general", _resolve_profile("general", _DEFAULT_PROFILES["general"]))
        return self._profiles[profile_name]

    def list_all(self) -> Dict[str, LLMProfile]:
        """Return all profiles."""
        return dict(self._profiles)

    def list_all_dicts(self) -> list:
        """Return all profiles as a list of dicts."""
        return [p.to_dict() for p in self._profiles.values()]

    def update_user_overrides(self, overrides: Dict[str, Dict[str, Any]]) -> None:
        """Apply user overrides from settings and rebuild profiles."""
        self._user_overrides = overrides
        self._reload()
        logger.info("LLM profiles reloaded with user overrides for: %s", list(overrides.keys()))

    def get_profile_names(self) -> list:
        """Return list of profile names."""
        return list(self._profiles.keys())


# ── Singleton ─────────────────────────────────────────────────────────────────

_registry: Optional[LLMProfileRegistry] = None


def get_llm_profile_registry() -> LLMProfileRegistry:
    global _registry
    if _registry is None:
        _registry = LLMProfileRegistry()
    return _registry
