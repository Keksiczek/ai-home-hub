"""KB filesystem watchdog – watches configured directories and enqueues reindex jobs.

Uses watchdog's Observer (FSEvents on macOS, kqueue fallback elsewhere) to
detect file changes in ``knowledge_base.external_paths``.  Events are debounced
over DEBOUNCE_SECONDS to avoid flooding the job queue during large copy/git
operations.  When the debounce timer fires, ``on_change`` is called; the caller
decides whether to set a dirty flag or enqueue a job.

Actual reindexing is NOT done here – that is handled by NightScheduler / the
existing ``kb_reindex`` night job.
"""
import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import Any

logger = logging.getLogger(__name__)

# A burst of FS events within this window is collapsed into a single callback.
DEBOUNCE_SECONDS: float = 10.0


class KBWatchdog:
    """Watch configured KB directories and call *on_change* after quiet periods.

    Parameters
    ----------
    get_settings:
        Callable (no args) that returns the app's SettingsService singleton.
        Called once at startup to read ``knowledge_base.external_paths``.
    on_change:
        Async callable invoked (at most once per debounce window) when any
        file change is detected in a watched directory.
    """

    def __init__(
        self,
        get_settings: Callable[[], Any],
        on_change: Callable[[], Awaitable[None]],
    ) -> None:
        self._get_settings = get_settings
        self._on_change = on_change
        self._observer: Any = None          # watchdog Observer (lazy import)
        self._debounce_task: asyncio.Task | None = None

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
        watched_paths: list[str] = (
            settings.get("knowledge_base", {}).get("external_paths", [])
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
                # Thread-safe handoff to the asyncio event loop.
                loop.call_soon_threadsafe(_outer_schedule)

        # Closure so the inner class can call the outer method.
        def _outer_schedule() -> None:
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
                await asyncio.sleep(60)
        except asyncio.CancelledError:
            pass
        finally:
            await self.stop()

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
        logger.info(
            "KBWatchdog: file change detected (debounce %.0fs elapsed), "
            "invoking on_change callback",
            DEBOUNCE_SECONDS,
        )
        try:
            await self._on_change()
        except Exception as exc:  # noqa: BLE001
            logger.error("KBWatchdog on_change callback raised: %s", exc)
