"""Adaptive Keep-Alive Manager – automatically releases Ollama models from RAM
based on current memory pressure.

Monitors RAM every 30 s and adjusts the keep_alive value returned to callers.
When pressure increases, it proactively evicts the LRU model by sending a
keep_alive=0 generate request to Ollama so the model is unloaded immediately.

Pressure levels (thresholds configurable via env):
    normal      RAM < RAM_THRESHOLD_REDUCED  (default 60 %)  → keep_alive "10m"
    reduced     RAM 60–75 %                                  → keep_alive "2m"
    aggressive  RAM 75–85 %                                  → keep_alive "30s"
    critical    RAM > 85 %                                   → keep_alive "0"
"""

import asyncio
import logging
import os
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple

import httpx

logger = logging.getLogger(__name__)

# ── Default thresholds (% system RAM used) ────────────────────────────────────
_THRESHOLD_REDUCED = int(os.environ.get("RAM_THRESHOLD_REDUCED", "60"))
_THRESHOLD_AGGRESSIVE = int(os.environ.get("RAM_THRESHOLD_AGGRESSIVE", "75"))
_THRESHOLD_CRITICAL = int(os.environ.get("RAM_THRESHOLD_CRITICAL", "85"))

# keep_alive values per pressure level
_KEEP_ALIVE_MAP: Dict[str, str] = {
    "normal": "10m",
    "reduced": "2m",
    "aggressive": "30s",
    "critical": "0",
}

# Eviction priority order: evict leftmost first (cheapest to reload last)
# Format: exact Ollama model name substrings used for matching
_EVICTION_PRIORITY: Tuple[str, ...] = (
    "llava",  # llava:7b  – largest, lowest reuse
    "llama3.2",  # llama3.2:3b-instruct
    "qwen2.5",  # qwen2.5:7b-instruct-q4_K_M
)


def _pressure_level(ram_pct: float) -> str:
    """Map a RAM percentage to a pressure level string."""
    if ram_pct >= _THRESHOLD_CRITICAL:
        return "critical"
    if ram_pct >= _THRESHOLD_AGGRESSIVE:
        return "aggressive"
    if ram_pct >= _THRESHOLD_REDUCED:
        return "reduced"
    return "normal"


class AdaptiveKeepAliveManager:
    """Singleton service that dynamically manages Ollama keep_alive values.

    Usage
    -----
    - Call ``get_keep_alive(profile)`` before each LLM request.
    - Wrap each Ollama call with ``track_request_start(model)`` /
      ``track_request_end(model)`` so active requests are never evicted.
    - Call ``start()`` once at application startup to begin the background loop.
    """

    def __init__(self) -> None:
        self._level: str = "normal"
        self._ram_pct: float = 0.0
        self._task: Optional[asyncio.Task] = None

        # {model_name: datetime} – updated on each LLM request
        self._last_used_at: Dict[str, datetime] = {}
        # {model_name: int} – how many requests are currently in flight
        self._concurrent_requests: Dict[str, int] = {}

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    def start(self) -> asyncio.Task:
        """Start the background monitoring loop. Call once at app startup."""
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._loop())
            logger.info("AdaptiveKeepAliveManager started")
        return self._task

    def stop(self) -> None:
        """Cancel the background loop."""
        if self._task:
            self._task.cancel()

    # ── Public API ────────────────────────────────────────────────────────────

    def get_keep_alive(self, profile: str) -> str:
        """Return the current keep_alive string for *profile*.

        Currently the same value is returned for all profiles; the method
        signature accepts *profile* for future per-profile tuning.
        """
        return _KEEP_ALIVE_MAP[self._level]

    def track_request_start(self, model: str) -> None:
        """Record that a new request for *model* has started."""
        self._concurrent_requests[model] = self._concurrent_requests.get(model, 0) + 1
        self._last_used_at[model] = datetime.now(timezone.utc)

    def track_request_end(self, model: str) -> None:
        """Record that a request for *model* has finished."""
        if self._concurrent_requests.get(model, 0) > 0:
            self._concurrent_requests[model] -= 1
        # Update last_used timestamp on completion too
        self._last_used_at[model] = datetime.now(timezone.utc)

    def get_status(self) -> dict:
        """Return a snapshot suitable for the /api/system/ram-pressure endpoint."""
        lru = self._lru_model()
        return {
            "level": self._level,
            "ram_pct": round(self._ram_pct, 1),
            "keep_alive": _KEEP_ALIVE_MAP[self._level],
            "lru_model": lru,
            "concurrent_requests": dict(self._concurrent_requests),
        }

    # ── Background loop ───────────────────────────────────────────────────────

    async def _loop(self) -> None:
        """Check RAM every 30 s and react to pressure level transitions."""
        previous_level = "normal"

        while True:
            try:
                ram_pct = self._read_ram_pct()
                self._ram_pct = ram_pct
                new_level = _pressure_level(ram_pct)

                if new_level != previous_level:
                    evicted = None
                    # Escalating pressure → proactively evict LRU model
                    if self._is_escalation(previous_level, new_level):
                        evicted = await self._evict_lru_model()
                    logger.info(
                        "AdaptiveKeepAlive: %s → %s | RAM %.1f%% | evicted=%s",
                        previous_level,
                        new_level,
                        ram_pct,
                        evicted or "none",
                    )
                    previous_level = new_level

                self._level = new_level
            except Exception as exc:
                logger.debug("AdaptiveKeepAliveManager loop error: %s", exc)

            await asyncio.sleep(30)

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _read_ram_pct() -> float:
        """Read current system RAM % from resource_monitor (no extra psutil call)."""
        try:
            from app.services.resource_monitor import get_resource_monitor

            snap = get_resource_monitor().get_snapshot()
            if snap is not None:
                return snap.ram_used_percent
        except Exception:
            pass
        # Fallback: direct psutil read (only if monitor is not yet ready)
        try:
            import psutil

            return psutil.virtual_memory().percent
        except Exception:
            return 0.0

    @staticmethod
    def _is_escalation(old_level: str, new_level: str) -> bool:
        """Return True when pressure is increasing (not decreasing)."""
        order = ["normal", "reduced", "aggressive", "critical"]
        return order.index(new_level) > order.index(old_level)

    def _lru_model(self) -> Optional[str]:
        """Return the least-recently-used model name, respecting eviction priority."""
        for substring in _EVICTION_PRIORITY:
            # Find all tracked models whose name matches this priority tier
            candidates = [m for m in self._last_used_at if substring in m.lower()]
            if not candidates:
                continue
            # Pick the one that was used the longest ago
            candidates.sort(key=lambda m: self._last_used_at[m])
            return candidates[0]
        # Fallback: any tracked model sorted by last_used
        if self._last_used_at:
            return min(self._last_used_at, key=lambda m: self._last_used_at[m])
        return None

    async def _evict_lru_model(self) -> Optional[str]:
        """Send keep_alive=0 to Ollama for the LRU idle model.

        Skips models with active (in-flight) requests.
        Returns the evicted model name, or None if nothing was evicted.
        """
        for substring in _EVICTION_PRIORITY:
            candidates = [m for m in self._last_used_at if substring in m.lower()]
            if not candidates:
                continue
            candidates.sort(key=lambda m: self._last_used_at[m])
            for model in candidates:
                if self._concurrent_requests.get(model, 0) > 0:
                    logger.debug("Skipping eviction of %s – active requests", model)
                    continue
                success = await self._force_unload(model)
                if success:
                    return model
        return None

    @staticmethod
    async def _force_unload(model: str) -> bool:
        """Issue a minimal generate request with keep_alive=0 to unload *model*.

        Ollama interprets keep_alive=0 on /api/generate as "unload now".
        The prompt is deliberately minimal – we don't actually want output.
        """
        try:
            from app.services.settings_service import (
                LOCAL_LLM_BASE_URL,
                get_settings_service,
            )

            cfg = get_settings_service().get_llm_config()
            ollama_url = cfg.get("ollama_url", LOCAL_LLM_BASE_URL).rstrip("/")
        except Exception:
            from app.services.settings_service import LOCAL_LLM_BASE_URL as _url

            ollama_url = _url

        payload = {
            "model": model,
            "prompt": "",
            "keep_alive": 0,
            "stream": False,
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(f"{ollama_url}/api/generate", json=payload)
                resp.raise_for_status()
            logger.info("AdaptiveKeepAlive: force-unloaded %s", model)
            return True
        except Exception as exc:
            logger.debug("AdaptiveKeepAlive: failed to unload %s: %s", model, exc)
            return False


# ── Singleton ─────────────────────────────────────────────────────────────────
_manager = AdaptiveKeepAliveManager()


def get_adaptive_keep_alive_manager() -> AdaptiveKeepAliveManager:
    """Return the application-wide AdaptiveKeepAliveManager singleton."""
    return _manager
