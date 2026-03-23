"""Background task supervisor with automatic restart and exponential backoff."""
import asyncio
import logging
from collections.abc import Callable
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

_MAX_RESTARTS = 3
_MAX_BACKOFF_S = 60

# Patchable sleep for testing
_sleep = asyncio.sleep


class _TaskEntry:
    __slots__ = (
        "name", "task", "restart_fn", "restart_count",
        "last_restart_delay_s", "final_status", "_pending_restart",
    )

    def __init__(
        self,
        name: str,
        task: asyncio.Task,
        restart_fn: Optional[Callable[[], asyncio.Task]],
    ) -> None:
        self.name = name
        self.task = task
        self.restart_fn = restart_fn
        self.restart_count: int = 0
        self.last_restart_delay_s: int = 0
        self.final_status: Optional[str] = None  # set once task will not be restarted
        self._pending_restart: Optional[asyncio.Task] = None


class TaskSupervisor:
    """Supervises asyncio background tasks, restarting them on failure with backoff."""

    def __init__(self) -> None:
        self._entries: dict[str, _TaskEntry] = {}

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def register(
        self,
        name: str,
        task: asyncio.Task,
        restart_fn: Optional[Callable[[], asyncio.Task]] = None,
    ) -> None:
        """Register a task under *name*.

        If *restart_fn* is provided and the task exits with a non-CancelledError
        exception, ``restart_fn()`` is called after an exponential backoff delay
        to obtain a fresh Task (up to ``_MAX_RESTARTS`` times).

        Backoff delays: 1s, 2s, 4s, 8s, 16s, 32s, capped at 60s.
        """
        entry = _TaskEntry(name, task, restart_fn)
        self._entries[name] = entry
        task.add_done_callback(self._make_done_callback(name))
        logger.debug("TaskSupervisor: registered task %r", name)

    async def stop_all(self, timeout: float = 10.0) -> None:
        """Cancel all supervised tasks (and pending restarts) within *timeout* seconds."""
        # Cancel any pending delayed-restart coroutines first
        for entry in self._entries.values():
            if entry._pending_restart and not entry._pending_restart.done():
                entry._pending_restart.cancel()

        tasks = [e.task for e in self._entries.values() if not e.task.done()]
        if not tasks:
            return

        for task in tasks:
            task.cancel()

        done, pending = await asyncio.wait(tasks, timeout=timeout)
        if pending:
            names = {t.get_name() for t in pending}
            logger.warning(
                "TaskSupervisor: %d task(s) did not finish within %.1fs: %s",
                len(pending),
                timeout,
                names,
            )

    def status(self) -> Dict[str, Dict[str, Any]]:
        """Return a mapping of task name → status dict.

        Each entry contains:
        - ``status``: ``"running"``, ``"done"``, ``"cancelled"``, or ``"error"``
        - ``restart_count``: number of restarts performed
        - ``last_restart_delay_s``: backoff delay used for most recent restart
        """
        result: Dict[str, Dict[str, Any]] = {}
        for name, entry in self._entries.items():
            task = entry.task
            if not task.done():
                state = "running"
            elif task.cancelled():
                state = "cancelled"
            elif task.exception() is not None:
                state = "error"
            else:
                state = "done"
            result[name] = {
                "status": state,
                "restart_count": entry.restart_count,
                "last_restart_delay_s": entry.last_restart_delay_s,
            }
        return result

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _make_done_callback(self, name: str) -> Callable[[asyncio.Task], None]:
        def _done(task: asyncio.Task) -> None:
            entry = self._entries.get(name)
            if entry is None:
                return

            if task.cancelled():
                logger.debug("TaskSupervisor: task %r was cancelled", name)
                return

            exc = task.exception()
            if exc is None:
                logger.debug("TaskSupervisor: task %r exited normally", name)
                return

            # Unexpected exception – attempt restart if possible
            logger.error(
                "TaskSupervisor: task %r raised %r",
                name,
                exc,
                exc_info=exc,
            )

            if entry.restart_fn is None:
                logger.error(
                    "TaskSupervisor: task %r has no restart_fn; leaving in error state",
                    name,
                )
                return

            if entry.restart_count >= _MAX_RESTARTS:
                logger.critical(
                    "TaskSupervisor: task %r has crashed %d times (max %d); "
                    "giving up – feature may be unavailable",
                    name,
                    entry.restart_count,
                    _MAX_RESTARTS,
                )
                return

            # Exponential backoff: 1s, 2s, 4s, …, capped at 60s
            delay = min(2 ** entry.restart_count, _MAX_BACKOFF_S)
            entry.last_restart_delay_s = delay
            logger.warning(
                "TaskSupervisor: task %r failed, restarting in %ds (attempt %d/%d)",
                name,
                delay,
                entry.restart_count + 1,
                _MAX_RESTARTS,
            )

            async def _delayed_restart() -> None:
                await _sleep(delay)
                if self._entries.get(name) is not entry:
                    return  # entry replaced, abort
                entry.restart_count += 1
                try:
                    new_task = entry.restart_fn()  # type: ignore[misc]
                except Exception as restart_exc:  # noqa: BLE001
                    logger.critical(
                        "TaskSupervisor: restart_fn for %r raised %r; giving up",
                        name,
                        restart_exc,
                    )
                    return
                entry.task = new_task
                new_task.add_done_callback(self._make_done_callback(name))

            try:
                loop = asyncio.get_running_loop()
                entry._pending_restart = loop.create_task(_delayed_restart())
            except RuntimeError:
                logger.error(
                    "TaskSupervisor: no running event loop to schedule restart for %r",
                    name,
                )

        return _done
