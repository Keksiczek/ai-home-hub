import asyncio
import contextlib
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class BackgroundService(ABC):
    """Base class for long-running asyncio daemon services."""

    def __init__(self, name: str) -> None:
        self._name = name
        self._stop_event = asyncio.Event()
        self._task: asyncio.Task | None = None

    @abstractmethod
    async def _tick(self) -> None:
        """Called repeatedly until stop is requested. Override in subclass."""

    async def _on_start(self) -> None:
        """Optional startup hook."""

    async def _on_stop(self) -> None:
        """Optional cleanup hook (called after loop exits)."""

    async def _run(self) -> None:
        await self._on_start()
        try:
            while not self._stop_event.is_set():
                await self._tick()
        except asyncio.CancelledError:
            pass
        finally:
            with contextlib.suppress(Exception):
                await self._on_stop()
            logger.info("%s stopped", self._name)

    def start(self) -> asyncio.Task:
        if self._task is None or self._task.done():
            self._stop_event.clear()
            self._task = asyncio.create_task(self._run(), name=self._name)
            logger.info("%s started", self._name)
        return self._task

    async def stop(self, timeout: float = 5.0) -> None:
        self._stop_event.set()
        if self._task and not self._task.done():
            self._task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await asyncio.wait_for(asyncio.shield(self._task), timeout=timeout)

    @property
    def is_running(self) -> bool:
        return self._task is not None and not self._task.done()
