"""
Resource monitor – tracks RAM/CPU of backend process and Ollama.
Provides throttle signals to job worker and agent orchestrator.
"""

import asyncio
import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

import psutil

from app.services.metrics_service import ollama_memory_bytes

logger = logging.getLogger(__name__)

# Thresholds
RAM_WARN_PERCENT = 75  # % system RAM used → warn
RAM_BLOCK_PERCENT = 88  # % system RAM used → block new agents/jobs
CPU_WARN_PERCENT = 70  # % CPU (1s sample) → warn
OLLAMA_PROCESS_NAMES = {"ollama", "ollama_llama_server"}


def _find_ollama_processes() -> list[psutil.Process]:
    """Return all processes whose name or cmdline contains 'ollama'.

    Runs in a thread via asyncio.to_thread – never blocks the event loop.
    Silently skips processes that disappear or deny access.
    """
    result: list[psutil.Process] = []
    for p in psutil.process_iter(attrs=["pid", "name", "cmdline"]):
        try:
            name = (p.info.get("name") or "").lower()
            cmd = " ".join(p.info.get("cmdline") or []).lower()
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            continue
        if "ollama" in name or "ollama" in cmd:
            result.append(p)
    return result


@dataclass
class ResourceSnapshot:
    timestamp: str
    ram_used_percent: float
    ram_used_mb: float
    ram_total_mb: float
    cpu_percent: float
    backend_rss_mb: float
    ollama_rss_mb: float
    swap_used_mb: float
    swap_total_mb: float
    throttle: bool = False
    block: bool = False
    warnings: list[str] = field(default_factory=list)


class ResourceMonitor:
    def __init__(self) -> None:
        self._latest: Optional[ResourceSnapshot] = None
        self._task: Optional[asyncio.Task] = None
        self._process = psutil.Process(os.getpid())
        self._tick_count: int = 0
        self._broadcast_fn = None

    def set_broadcast(self, fn) -> None:
        """Register a coroutine for broadcasting WebSocket messages."""
        self._broadcast_fn = fn

    def start(self) -> asyncio.Task:
        """Start background monitoring loop. Call once at app startup.

        Returns the created Task so callers (e.g. TaskSupervisor) can track it.
        """
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._loop())
            logger.info("ResourceMonitor started")
        return self._task

    def stop(self) -> None:
        if self._task:
            self._task.cancel()

    async def _loop(self) -> None:
        from app.services.ws_manager import WS_EVENT_RESOURCE_UPDATE

        while True:
            try:
                self._tick_count += 1
                snap = await asyncio.to_thread(self._take_snapshot)
                self._latest = snap
                if snap.block:
                    logger.warning(
                        "RESOURCE BLOCK: RAM %s%% – new agents/jobs blocked",
                        snap.ram_used_percent,
                    )
                elif snap.throttle:
                    logger.warning("RESOURCE WARN: RAM %s%%", snap.ram_used_percent)

                # Broadcast resource update every 60s (every 4th tick)
                if self._tick_count % 4 == 0 and self._broadcast_fn:
                    try:
                        await self._broadcast_fn(
                            {"type": WS_EVENT_RESOURCE_UPDATE, **self.to_dict()}
                        )
                    except Exception as exc:
                        logger.debug("Resource broadcast failed: %s", exc)
            except Exception as exc:
                logger.debug("ResourceMonitor error: %s", exc)
            await asyncio.sleep(15)  # check every 15s

    def _take_snapshot(self) -> ResourceSnapshot:
        # interval=None returns the value computed since the last call (non-blocking).
        # The 15-second asyncio.sleep in _loop provides the measurement window.
        cpu = psutil.cpu_percent(interval=None)
        vm = psutil.virtual_memory()
        swap = psutil.swap_memory()
        try:
            backend_rss = self._process.memory_info().rss / 1024 / 1024
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            backend_rss = 0.0

        # Find Ollama process RSS using the robust helper (already in a thread)
        ollama_rss = 0.0
        for proc in _find_ollama_processes():
            try:
                ollama_rss += proc.memory_info().rss / 1024 / 1024
            except (psutil.AccessDenied, psutil.NoSuchProcess):
                pass
        ollama_memory_bytes.set(ollama_rss * 1024 * 1024)

        ram_pct = vm.percent
        warnings = []
        if ram_pct >= RAM_WARN_PERCENT:
            warnings.append(f"RAM at {ram_pct:.1f}%")
        if cpu >= CPU_WARN_PERCENT:
            warnings.append(f"CPU at {cpu:.1f}%")
        if swap.used > 0:
            warnings.append(f"Swap in use: {swap.used / 1024 / 1024:.0f} MB")

        return ResourceSnapshot(
            timestamp=datetime.now(timezone.utc).isoformat(),
            ram_used_percent=ram_pct,
            ram_used_mb=vm.used / 1024 / 1024,
            ram_total_mb=vm.total / 1024 / 1024,
            cpu_percent=cpu,
            backend_rss_mb=backend_rss,
            ollama_rss_mb=ollama_rss,
            swap_used_mb=swap.used / 1024 / 1024,
            swap_total_mb=swap.total / 1024 / 1024,
            throttle=ram_pct >= RAM_WARN_PERCENT or cpu >= CPU_WARN_PERCENT,
            block=ram_pct >= RAM_BLOCK_PERCENT,
            warnings=warnings,
        )

    def get_snapshot(self) -> Optional[ResourceSnapshot]:
        return self._latest

    def is_blocked(self) -> bool:
        """True = system overloaded, refuse new agents/jobs."""
        if self._latest is None:
            return False
        return self._latest.block

    def is_throttled(self) -> bool:
        if self._latest is None:
            return False
        return self._latest.throttle

    def to_dict(self) -> dict:
        if self._latest is None:
            return {"status": "no_data"}
        s = self._latest
        return {
            "timestamp": s.timestamp,
            "ram_used_percent": s.ram_used_percent,
            "ram_used_mb": round(s.ram_used_mb, 1),
            "ram_total_mb": round(s.ram_total_mb, 1),
            "cpu_percent": s.cpu_percent,
            "backend_rss_mb": round(s.backend_rss_mb, 1),
            "ollama_rss_mb": round(s.ollama_rss_mb, 1),
            "swap_used_mb": round(s.swap_used_mb, 1),
            "swap_total_mb": round(s.swap_total_mb, 1),
            "throttle": s.throttle,
            "block": s.block,
            "warnings": s.warnings,
        }


# Singleton
_monitor = ResourceMonitor()


def get_resource_monitor() -> ResourceMonitor:
    return _monitor
