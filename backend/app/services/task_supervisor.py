"""Background task supervisor with automatic restart and health reporting."""
import asyncio
import logging
from collections.abc import Callable
from typing import Optional

logger = logging.getLogger(__name__)

_MAX_RESTARTS = 3


class _TaskEntry:
    __slots__ = ("name", "task", "restart_fn", "restart_count", "final_status")

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
        self.final_status: Optional[str] = None  # set once task will not be restarted


class TaskSupervisor:
    """Supervises asyncio background tasks, restarting them on unexpected failure."""

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
        exception, ``restart_fn()`` is called to obtain a fresh Task which is
        then re-registered (up to ``_MAX_RESTARTS`` times).
        """
        entry = _TaskEntry(name, task, restart_fn)
        self._entries[name] = entry
        task.add_done_callback(self._make_done_callback(name))
        logger.debug("TaskSupervisor: registered task %r", name)

    async def stop_all(self, timeout: float = 10.0) -> None:
        """Cancel all supervised tasks and wait up to *timeout* seconds.

        Tasks that do not finish in time are logged at WARNING level.
        """
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

    def status(self) -> dict[str, str]:
        """Return a mapping of task name → state string.

        Possible states: ``"running"``, ``"done"``, ``"cancelled"``, ``"error"``.
        """
        result: dict[str, str] = {}
        for name, entry in self._entries.items():
            task = entry.task
            if not task.done():
                result[name] = "running"
            elif task.cancelled():
                result[name] = "cancelled"
            elif task.exception() is not None:
                result[name] = "error"
            else:
                result[name] = "done"
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

            entry.restart_count += 1
            logger.warning(
                "TaskSupervisor: restarting task %r (attempt %d/%d)",
                name,
                entry.restart_count,
                _MAX_RESTARTS,
            )
            try:
                new_task = entry.restart_fn()
            except Exception as restart_exc:  # noqa: BLE001
                logger.critical(
                    "TaskSupervisor: restart_fn for %r raised %r; giving up",
                    name,
                    restart_exc,
                )
                return

            entry.task = new_task
            new_task.add_done_callback(self._make_done_callback(name))

        return _done
