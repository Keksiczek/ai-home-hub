"""Priority-aware LLM semaphore – ensures chat requests get priority over background work.

The semaphore has a configurable number of slots (default 1).  When a
higher-priority caller is waiting, lower-priority callers are NOT granted
the semaphore even if a slot becomes free — the high-priority waiter goes
first.

Priority levels match TaskPriority: 1 (chat) > 2 (resident) > 3 (background).
"""

import asyncio
import heapq
import logging
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import AsyncGenerator, Optional

from app.services.resource_policy import TaskPriority

logger = logging.getLogger(__name__)


@dataclass(order=True)
class _Waiter:
    """Heap-ordered waiter: lower priority number = higher priority."""

    priority: int
    timestamp: float = field(compare=True)
    event: asyncio.Event = field(compare=False, default_factory=asyncio.Event)
    cancelled: bool = field(compare=False, default=False)


class PrioritySemaphore:
    """Semaphore that grants access by priority order, not FIFO.

    Usage::

        sem = PrioritySemaphore(max_concurrent=1)
        async with sem.acquire(TaskPriority.CHAT, timeout=60):
            await do_llm_call()
    """

    def __init__(self, max_concurrent: int = 1) -> None:
        self._max = max_concurrent
        self._active = 0
        self._waiters: list[_Waiter] = []  # min-heap
        self._lock = asyncio.Lock()
        # Stats
        self._total_acquired = 0
        self._total_timeouts = 0
        self._total_by_priority: dict[int, int] = {}

    @asynccontextmanager
    async def acquire(
        self,
        priority: TaskPriority = TaskPriority.BACKGROUND,
        timeout: float = 120.0,
        label: str = "",
    ) -> AsyncGenerator[None, None]:
        """Async context manager that acquires a slot with priority.

        Raises asyncio.TimeoutError if the slot is not acquired within timeout.
        """
        acquired = False
        waiter: Optional[_Waiter] = None
        start = time.monotonic()

        try:
            async with self._lock:
                if self._active < self._max:
                    # Slot available — grant immediately
                    self._active += 1
                    acquired = True
                else:
                    # Must wait — add to priority queue
                    waiter = _Waiter(
                        priority=priority.value,
                        timestamp=time.monotonic(),
                    )
                    heapq.heappush(self._waiters, waiter)

            if not acquired and waiter is not None:
                try:
                    await asyncio.wait_for(waiter.event.wait(), timeout=timeout)
                    acquired = True
                except asyncio.TimeoutError:
                    waiter.cancelled = True
                    self._total_timeouts += 1
                    wait_s = time.monotonic() - start
                    logger.warning(
                        "PrioritySemaphore timeout: priority=%s label=%s waited=%.1fs",
                        priority.name,
                        label,
                        wait_s,
                        extra={
                            "event": "llm_semaphore_timeout",
                            "priority": priority.name,
                            "label": label,
                            "wait_seconds": round(wait_s, 1),
                        },
                    )
                    raise

            self._total_acquired += 1
            self._total_by_priority[priority.value] = (
                self._total_by_priority.get(priority.value, 0) + 1
            )

            wait_s = time.monotonic() - start
            if wait_s > 1.0:
                logger.info(
                    "PrioritySemaphore acquired: priority=%s label=%s waited=%.1fs",
                    priority.name,
                    label,
                    wait_s,
                )

            yield

        finally:
            if acquired:
                async with self._lock:
                    self._active -= 1
                    self._wake_next()

    def _wake_next(self) -> None:
        """Wake the highest-priority waiter (if any)."""
        while self._waiters and self._active < self._max:
            waiter = heapq.heappop(self._waiters)
            if waiter.cancelled:
                continue
            self._active += 1
            waiter.event.set()
            return

    @property
    def active_count(self) -> int:
        return self._active

    @property
    def waiting_count(self) -> int:
        return sum(1 for w in self._waiters if not w.cancelled)

    def has_higher_priority_waiting(self, than: TaskPriority) -> bool:
        """Check if there's a waiter with higher priority (lower number) than the given one."""
        for w in self._waiters:
            if not w.cancelled and w.priority < than.value:
                return True
        return False

    def stats(self) -> dict:
        return {
            "max_concurrent": self._max,
            "active": self._active,
            "waiting": self.waiting_count,
            "total_acquired": self._total_acquired,
            "total_timeouts": self._total_timeouts,
            "by_priority": {
                TaskPriority(k).name: v for k, v in self._total_by_priority.items()
            },
        }


# ── Singleton ───────────────────────────────────────────────────────────────

_semaphore: Optional[PrioritySemaphore] = None


def get_priority_semaphore() -> PrioritySemaphore:
    global _semaphore
    if _semaphore is None:
        from app.utils.constants import LLM_MAX_CONCURRENT_REQUESTS

        _semaphore = PrioritySemaphore(max_concurrent=LLM_MAX_CONCURRENT_REQUESTS)
    return _semaphore
