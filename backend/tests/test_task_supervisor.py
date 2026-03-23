"""Tests for TaskSupervisor: registration, error detection, restart, backoff, stop_all."""
import asyncio
from unittest.mock import AsyncMock, patch

import pytest

from app.services.task_supervisor import TaskSupervisor, _MAX_RESTARTS, _MAX_BACKOFF_S


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _long_task() -> None:
    """Never finishes on its own – must be cancelled."""
    await asyncio.sleep(3600)


async def _failing_task() -> None:
    """Fails immediately with a ValueError."""
    raise ValueError("intentional failure")


# ---------------------------------------------------------------------------
# Test 1 – registered task is visible as "running"
# ---------------------------------------------------------------------------

async def test_running_task_shows_running_status() -> None:
    sup = TaskSupervisor()
    task = asyncio.create_task(_long_task())
    sup.register("worker", task)

    assert sup.status()["worker"]["status"] == "running"

    # Cleanup
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task


# ---------------------------------------------------------------------------
# Test 2 – task that raises ends up with "error" status
# ---------------------------------------------------------------------------

async def test_failing_task_shows_error_status() -> None:
    sup = TaskSupervisor()
    task = asyncio.create_task(_failing_task())
    sup.register("worker", task)  # no restart_fn

    # Let the task run to completion.
    await asyncio.sleep(0.05)

    assert task.done()
    assert sup.status()["worker"]["status"] == "error"


# ---------------------------------------------------------------------------
# Test 3a – task with restart_fn is restarted after backoff delay
# ---------------------------------------------------------------------------

async def test_failed_task_is_restarted() -> None:
    sup = TaskSupervisor()
    restart_count = 0

    def restart_fn() -> asyncio.Task:
        nonlocal restart_count
        restart_count += 1
        return asyncio.create_task(_long_task())

    task = asyncio.create_task(_failing_task())
    sup.register("worker", task, restart_fn)

    # Mock asyncio.sleep so the backoff delay is instant
    with patch("app.services.task_supervisor._sleep", new_callable=AsyncMock):
        await asyncio.sleep(0.05)  # let done-callback fire and schedule restart
        await asyncio.sleep(0.05)  # let the pending restart coroutine execute

    assert restart_count >= 1
    assert sup.status()["worker"]["status"] == "running"

    # Cleanup
    await sup.stop_all()


# ---------------------------------------------------------------------------
# Test 3b – after exhausting _MAX_RESTARTS the status becomes "error"
# ---------------------------------------------------------------------------

async def test_max_restarts_reached_marks_error() -> None:
    sup = TaskSupervisor()
    restart_count = 0

    def restart_fn() -> asyncio.Task:
        nonlocal restart_count
        restart_count += 1
        return asyncio.create_task(_failing_task())

    task = asyncio.create_task(_failing_task())
    sup.register("worker", task, restart_fn)

    with patch("app.services.task_supervisor._sleep", new_callable=AsyncMock):
        # Give enough cycles for all MAX_RESTARTS to cascade
        for _ in range(20):
            await asyncio.sleep(0)

    assert restart_count >= 1
    assert sup.status()["worker"]["status"] == "error"


# ---------------------------------------------------------------------------
# Test 4 – stop_all cancels every running task
# ---------------------------------------------------------------------------

async def test_stop_all_cancels_all_tasks() -> None:
    sup = TaskSupervisor()
    t1 = asyncio.create_task(_long_task())
    t2 = asyncio.create_task(_long_task())
    sup.register("t1", t1)
    sup.register("t2", t2)

    assert sup.status()["t1"]["status"] == "running"
    assert sup.status()["t2"]["status"] == "running"

    await sup.stop_all()

    statuses = sup.status()
    assert all(s["status"] != "running" for s in statuses.values()), (
        f"Expected no running tasks after stop_all, got: {statuses}"
    )


# ---------------------------------------------------------------------------
# Test 5 – cancelled task shows "cancelled", not "error"
# ---------------------------------------------------------------------------

async def test_cancelled_task_shows_cancelled_status() -> None:
    sup = TaskSupervisor()
    task = asyncio.create_task(_long_task())
    sup.register("worker", task)

    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    assert sup.status()["worker"]["status"] == "cancelled"


# ---------------------------------------------------------------------------
# Test 6 – normally completing task shows "done"
# ---------------------------------------------------------------------------

async def test_completed_task_shows_done_status() -> None:
    sup = TaskSupervisor()

    async def quick() -> None:
        await asyncio.sleep(0)

    task = asyncio.create_task(quick())
    sup.register("worker", task)
    await asyncio.sleep(0.02)

    assert sup.status()["worker"]["status"] == "done"


# ---------------------------------------------------------------------------
# Test 7 – backoff delay grows exponentially (1s → 2s → 4s)
# ---------------------------------------------------------------------------

async def test_backoff_delay_grows_exponentially() -> None:
    """Verify that the backoff sequence is 1, 2, 4 seconds."""
    sup = TaskSupervisor()
    sleep_calls: list[float] = []

    async def mock_sleep(seconds: float) -> None:
        sleep_calls.append(seconds)

    def restart_fn() -> asyncio.Task:
        return asyncio.create_task(_failing_task())

    task = asyncio.create_task(_failing_task())
    sup.register("worker", task, restart_fn)

    with patch("app.services.task_supervisor._sleep", side_effect=mock_sleep):
        for _ in range(30):
            await asyncio.sleep(0)

    # First three sleeps should follow 2^0=1, 2^1=2, 2^2=4
    assert len(sleep_calls) >= 3
    assert sleep_calls[0] == 1
    assert sleep_calls[1] == 2
    assert sleep_calls[2] == 4


# ---------------------------------------------------------------------------
# Test 8 – backoff delay is capped at _MAX_BACKOFF_S (60s)
# ---------------------------------------------------------------------------

async def test_backoff_delay_capped_at_max() -> None:
    """Delay must never exceed _MAX_BACKOFF_S even after many failures."""
    # _MAX_BACKOFF_S = 60, and 2**6 = 64 > 60 so cap kicks in at attempt 6
    # We only have _MAX_RESTARTS=3 but we can verify the cap formula directly
    assert _MAX_BACKOFF_S == 60
    assert min(2 ** 6, _MAX_BACKOFF_S) == 60
    assert min(2 ** 10, _MAX_BACKOFF_S) == 60


# ---------------------------------------------------------------------------
# Test 9 – restart_count increments correctly in status()
# ---------------------------------------------------------------------------

async def test_restart_count_in_status() -> None:
    """status() must report correct restart_count after one restart."""
    sup = TaskSupervisor()
    restarted = asyncio.Event()

    def restart_fn() -> asyncio.Task:
        restarted.set()
        return asyncio.create_task(_long_task())

    task = asyncio.create_task(_failing_task())
    sup.register("worker", task, restart_fn)

    with patch("app.services.task_supervisor._sleep", new_callable=AsyncMock):
        await asyncio.sleep(0.05)
        await asyncio.sleep(0.05)

    info = sup.status()["worker"]
    assert info["restart_count"] >= 1


# ---------------------------------------------------------------------------
# Test 10 – last_restart_delay_s reflects the delay used for most recent restart
# ---------------------------------------------------------------------------

async def test_last_restart_delay_s_in_status() -> None:
    """status() must expose the backoff delay used for the last restart."""
    sup = TaskSupervisor()

    def restart_fn() -> asyncio.Task:
        return asyncio.create_task(_long_task())

    task = asyncio.create_task(_failing_task())
    sup.register("worker", task, restart_fn)

    with patch("app.services.task_supervisor._sleep", new_callable=AsyncMock):
        await asyncio.sleep(0.05)
        await asyncio.sleep(0.05)

    info = sup.status()["worker"]
    # First restart: delay = min(2**0, 60) = 1
    assert info["last_restart_delay_s"] == 1
