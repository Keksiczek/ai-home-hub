"""Tests for TaskSupervisor: registration, error detection, restart, stop_all."""
import asyncio

import pytest

from app.services.task_supervisor import TaskSupervisor, _MAX_RESTARTS


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

    assert sup.status()["worker"] == "running"

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
    assert sup.status()["worker"] == "error"


# ---------------------------------------------------------------------------
# Test 3a – task with restart_fn is restarted at least once on failure
# ---------------------------------------------------------------------------

async def test_failed_task_is_restarted() -> None:
    sup = TaskSupervisor()
    restart_count = 0

    def restart_fn() -> asyncio.Task:
        nonlocal restart_count
        restart_count += 1
        # Stable replacement – runs indefinitely until cancelled.
        return asyncio.create_task(_long_task())

    task = asyncio.create_task(_failing_task())
    sup.register("worker", task, restart_fn)

    # Give done-callback time to fire and restart_fn to be called.
    await asyncio.sleep(0.05)

    assert restart_count >= 1
    assert sup.status()["worker"] == "running"

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
        # Replacement also fails immediately → cascades until limit.
        return asyncio.create_task(_failing_task())

    task = asyncio.create_task(_failing_task())
    sup.register("worker", task, restart_fn)

    # All _MAX_RESTARTS (3) restarts complete in a handful of event-loop ticks.
    await asyncio.sleep(0.1)

    # At least one restart was attempted.
    assert restart_count >= 1
    # Final status is "error" because the last restart also failed and the
    # supervisor gave up.
    assert sup.status()["worker"] == "error"


# ---------------------------------------------------------------------------
# Test 4 – stop_all cancels every running task
# ---------------------------------------------------------------------------

async def test_stop_all_cancels_all_tasks() -> None:
    sup = TaskSupervisor()
    t1 = asyncio.create_task(_long_task())
    t2 = asyncio.create_task(_long_task())
    sup.register("t1", t1)
    sup.register("t2", t2)

    assert sup.status()["t1"] == "running"
    assert sup.status()["t2"] == "running"

    await sup.stop_all()

    statuses = sup.status()
    assert all(s != "running" for s in statuses.values()), (
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

    assert sup.status()["worker"] == "cancelled"


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

    assert sup.status()["worker"] == "done"
