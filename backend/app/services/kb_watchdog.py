"""KB filesystem watchdog – watches configured directories and enqueues reindex jobs.

Uses watchdog's Observer (FSEvents on macOS, kqueue fallback elsewhere) to
detect file changes in ``knowledge_base.external_paths``.  Events are debounced
over DEBOUNCE_SECONDS to avoid flooding the job queue during large copy/git
operations.

Improvements over v1:
- Longer debounce window (30s default, configurable)
- Path-based deduplication: tracks changed files and deduplicates by path
- Ignores noisy/temporary files (.tmp, .swp, .DS_Store, __pycache__, .git)
- Resource-aware: only triggers ingest when resource policy allows
- Dirty-flag mode: marks changes as pending, actual ingest runs per policy
- Guard against re-processing: tracks mtime to avoid infinite loops
"""

import asyncio
import logging
import os
import time
from collections import defaultdict
from collections.abc import Awaitable, Callable
from pathlib import Path
from typing import Any, Optional

from app.services.resource_policy import TaskPriority, get_resource_policy

logger = logging.getLogger(__name__)

# A burst of FS events within this window is collapsed into a single callback.
DEBOUNCE_SECONDS: float = 30.0

# Minimum time between actual ingest triggers (prevents rapid re-triggering)
MIN_INGEST_INTERVAL_S: float = 120.0

# File patterns to ignore (noisy/temporary files)
IGNORE_PATTERNS: set[str] = {
    ".DS_Store",
    "Thumbs.db",
    ".swp",
    ".swo",
    ".tmp",
    "~",
    ".partial",
    ".crdownload",
}

IGNORE_DIR_PATTERNS: set[str] = {
    "__pycache__",
    ".git",
    "node_modules",
    ".venv",
    ".tox",
    ".mypy_cache",
}


def _should_ignore(path: str) -> bool:
    """Return True if this file path should be ignored."""
    name = os.path.basename(path)
    # Ignore hidden temp files
    for pattern in IGNORE_PATTERNS:
        if name.endswith(pattern) or name == pattern:
            return True
    # Ignore files in noisy directories
    parts = Path(path).parts
    for part in parts:
        if part in IGNORE_DIR_PATTERNS:
            return True
    return False


class KBWatchdog:
    """Watch configured KB directories and call *on_change* after quiet periods.

    Parameters
    ----------
    get_settings:
        Callable (no args) that returns the app's SettingsService singleton.
    on_change:
        Async callable invoked (at most once per debounce window) when file
        changes are detected.  Only called when resource policy allows.
    """

    def __init__(
        self,
        get_settings: Callable[[], Any],
        on_change: Callable[[], Awaitable[None]],
    ) -> None:
        self._get_settings = get_settings
        self._on_change = on_change
        self._observer: Any = None  # watchdog Observer (lazy import)
        self._debounce_task: asyncio.Task | None = None

        # Dirty tracking
        self._dirty_paths: dict[str, float] = {}  # path -> mtime at detection
        self._is_dirty: bool = False
        self._last_ingest_ts: float = 0.0
        self._total_events: int = 0
        self._total_ingests: int = 0
        self._ignored_events: int = 0

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def start(self) -> asyncio.Task:
        """Start the watchdog and return the asyncio Task."""
        return asyncio.create_task(self._run(), name="kb_watchdog")

    async def stop(self) -> None:
        """Stop the debounce timer and the watchdog observer."""
        if self._debounce_task and not self._debounce_task.done():
            self._debounce_task.cancel()
            try:
                await self._debounce_task
            except asyncio.CancelledError:
                pass

        if self._observer is not None and self._observer.is_alive():
            await asyncio.to_thread(self._observer.stop)
            await asyncio.to_thread(self._observer.join)
            logger.info("KBWatchdog: observer stopped")

    @property
    def is_dirty(self) -> bool:
        return self._is_dirty

    @property
    def dirty_count(self) -> int:
        return len(self._dirty_paths)

    def get_status(self) -> dict:
        """Return watchdog status for health/status endpoints."""
        return {
            "is_dirty": self._is_dirty,
            "dirty_files": len(self._dirty_paths),
            "total_events": self._total_events,
            "total_ingests": self._total_ingests,
            "ignored_events": self._ignored_events,
            "last_ingest_ts": self._last_ingest_ts,
            "debounce_seconds": DEBOUNCE_SECONDS,
            "min_ingest_interval_s": MIN_INGEST_INTERVAL_S,
        }

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    async def _run(self) -> None:
        try:
            from watchdog.observers import Observer
            from watchdog.events import FileSystemEventHandler
        except ImportError:
            logger.error(
                "KBWatchdog: 'watchdog' package not installed. "
                "Add watchdog to requirements.txt."
            )
            return

        settings = self._get_settings().load()
        watched_paths: list[str] = settings.get("knowledge_base", {}).get(
            "external_paths", []
        )

        if not watched_paths:
            logger.info(
                "KBWatchdog: knowledge_base.external_paths is empty – "
                "nothing to watch. Configure paths in Settings → Knowledge Base."
            )
            return

        loop = asyncio.get_running_loop()

        # Inner handler – lives on the watchdog thread.
        class _Handler(FileSystemEventHandler):
            def __init__(self_h) -> None:  # noqa: N805
                super().__init__()

            def on_any_event(self_h, event) -> None:  # noqa: N805
                if event.is_directory:
                    return
                src = getattr(event, "src_path", "")
                if _should_ignore(src):
                    return
                # Thread-safe handoff to the asyncio event loop.
                loop.call_soon_threadsafe(_outer_schedule, src)

        # Closure so the inner class can call the outer method.
        def _outer_schedule(path: str) -> None:
            self._record_dirty(path)
            self._schedule_debounce()

        self._observer = Observer()
        handler = _Handler()
        scheduled = 0
        for path in watched_paths:
            try:
                self._observer.schedule(handler, str(path), recursive=True)
                logger.info("KBWatchdog: watching %s", path)
                scheduled += 1
            except Exception as exc:  # noqa: BLE001
                logger.warning("KBWatchdog: cannot watch %s: %s", path, exc)

        if scheduled == 0:
            logger.warning("KBWatchdog: no paths could be scheduled for watching")
            return

        await asyncio.to_thread(self._observer.start)
        logger.info("KBWatchdog started – %d path(s) monitored", scheduled)

        try:
            while True:
                # Periodically check if dirty work should be flushed
                await asyncio.sleep(60)
                if self._is_dirty:
                    await self._try_flush_dirty()
        except asyncio.CancelledError:
            pass
        finally:
            await self.stop()

    def _record_dirty(self, path: str) -> None:
        """Record a dirty path. Deduplicates by path."""
        self._total_events += 1
        try:
            mtime = os.path.getmtime(path)
        except OSError:
            mtime = time.time()

        prev_mtime = self._dirty_paths.get(path)
        if prev_mtime is not None and abs(mtime - prev_mtime) < 1.0:
            # Same file, same mtime — skip (guard against infinite re-processing)
            self._ignored_events += 1
            return

        self._dirty_paths[path] = mtime
        self._is_dirty = True

    def _schedule_debounce(self) -> None:
        """(Re-)arm the debounce timer.  Called from the asyncio thread only."""
        if self._debounce_task and not self._debounce_task.done():
            self._debounce_task.cancel()
        self._debounce_task = asyncio.create_task(
            self._debounce_fire(), name="kb_watchdog_debounce"
        )

    async def _debounce_fire(self) -> None:
        try:
            await asyncio.sleep(DEBOUNCE_SECONDS)
        except asyncio.CancelledError:
            return  # timer was reset by another event – do nothing
        await self._try_flush_dirty()

    async def _try_flush_dirty(self) -> None:
        """Attempt to trigger ingest for dirty files, respecting resource policy."""
        if not self._is_dirty or not self._dirty_paths:
            return

        # Check minimum interval between ingests
        now = time.time()
        if now - self._last_ingest_ts < MIN_INGEST_INTERVAL_S:
            logger.debug(
                "KBWatchdog: ingest cooldown (%.0fs remaining)",
                MIN_INGEST_INTERVAL_S - (now - self._last_ingest_ts),
            )
            return

        # Check resource policy — only trigger if background work is allowed
        policy = get_resource_policy()
        decision = policy.can_proceed(TaskPriority.BACKGROUND)
        if decision == "block":
            logger.info(
                "KBWatchdog: %d dirty files pending but resource tier %s blocks background work",
                len(self._dirty_paths),
                policy.tier.value,
                extra={
                    "event": "kb_watchdog_deferred",
                    "dirty_count": len(self._dirty_paths),
                    "resource_tier": policy.tier.value,
                },
            )
            return

        dirty_count = len(self._dirty_paths)
        logger.info(
            "KBWatchdog: flushing %d dirty file(s), resource tier=%s",
            dirty_count,
            policy.tier.value,
            extra={
                "event": "kb_watchdog_flush",
                "dirty_count": dirty_count,
                "resource_tier": policy.tier.value,
            },
        )

        try:
            await self._on_change()
            self._dirty_paths.clear()
            self._is_dirty = False
            self._last_ingest_ts = time.time()
            self._total_ingests += 1
        except Exception as exc:  # noqa: BLE001
            logger.error("KBWatchdog on_change callback raised: %s", exc)
