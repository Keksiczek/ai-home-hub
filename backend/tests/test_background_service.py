"""Tests for BackgroundService base class lifecycle management."""

import asyncio

import pytest

from app.services.background_service import BackgroundService

# ---------------------------------------------------------------------------
# Minimal concrete implementation used across all tests
# ---------------------------------------------------------------------------


class _FakeService(BackgroundService):
    """Counts how many times _tick has been called."""

    def __init__(self) -> None:
        super().__init__("fake_service")
        self.counter: int = 0

    async def _tick(self) -> None:
        self.counter += 1
        # Yield to the event loop so the loop doesn't spin without giving
        # other tasks CPU time, and so the stop event has a chance to be seen.
        await asyncio.sleep(0)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


async def test_start_creates_running_task() -> None:
    svc = _FakeService()
    task = svc.start()

    assert svc.is_running
    assert not task.done()

    await svc.stop()
    assert task.done()


async def test_tick_increments_counter() -> None:
    svc = _FakeService()
    svc.start()

    # Give the loop a few iterations to execute at least one tick.
    await asyncio.sleep(0.02)

    assert svc.counter > 0

    await svc.stop()


async def test_stop_sets_is_running_false() -> None:
    svc = _FakeService()
    svc.start()
    await asyncio.sleep(0.01)

    await svc.stop()

    assert not svc.is_running


async def test_task_is_done_after_stop() -> None:
    svc = _FakeService()
    task = svc.start()

    await svc.stop()

    # Task must be in a terminal state – no "task was destroyed but pending" warning.
    assert task.done()


async def test_double_start_returns_same_task() -> None:
    """Calling start() twice must not spawn a second task."""
    svc = _FakeService()
    t1 = svc.start()
    t2 = svc.start()

    assert t1 is t2

    await svc.stop()


async def test_restart_after_stop() -> None:
    """After stop(), start() must create a fresh running task."""
    svc = _FakeService()
    svc.start()
    await svc.stop()

    assert not svc.is_running

    svc.start()
    assert svc.is_running

    await svc.stop()
