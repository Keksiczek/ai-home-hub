"""Tests for priority-aware LLM semaphore."""

import asyncio
import pytest
from app.services.priority_semaphore import PrioritySemaphore
from app.services.resource_policy import TaskPriority


@pytest.fixture
def sem():
    return PrioritySemaphore(max_concurrent=1)


@pytest.mark.asyncio
async def test_basic_acquire_release(sem):
    """Single acquire and release should work."""
    async with sem.acquire(TaskPriority.CHAT, timeout=5):
        assert sem.active_count == 1
    assert sem.active_count == 0


@pytest.mark.asyncio
async def test_chat_priority_over_background(sem):
    """Chat should get the semaphore before background when both are waiting."""
    order = []

    # Hold the semaphore with a background task
    async with sem.acquire(TaskPriority.BACKGROUND, timeout=5, label="holder"):
        # Queue a background and a chat waiter
        async def bg_waiter():
            async with sem.acquire(TaskPriority.BACKGROUND, timeout=5, label="bg"):
                order.append("bg")

        async def chat_waiter():
            # Small delay so bg_waiter queues first
            await asyncio.sleep(0.01)
            async with sem.acquire(TaskPriority.CHAT, timeout=5, label="chat"):
                order.append("chat")

        bg_task = asyncio.create_task(bg_waiter())
        chat_task = asyncio.create_task(chat_waiter())
        # Let both queue up
        await asyncio.sleep(0.05)

    # After release, both should complete
    await asyncio.gather(bg_task, chat_task)
    # Chat (priority 1) should run before background (priority 3)
    assert order[0] == "chat"
    assert order[1] == "bg"


@pytest.mark.asyncio
async def test_timeout(sem):
    """Semaphore should raise TimeoutError when timeout expires."""
    async with sem.acquire(TaskPriority.CHAT, timeout=5, label="holder"):
        with pytest.raises(asyncio.TimeoutError):
            async with sem.acquire(
                TaskPriority.BACKGROUND, timeout=0.1, label="waiter"
            ):
                pass


@pytest.mark.asyncio
async def test_stats(sem):
    stats = sem.stats()
    assert stats["max_concurrent"] == 1
    assert stats["active"] == 0
    assert stats["waiting"] == 0

    async with sem.acquire(TaskPriority.CHAT, timeout=5):
        stats = sem.stats()
        assert stats["active"] == 1

    stats = sem.stats()
    assert stats["total_acquired"] == 1


@pytest.mark.asyncio
async def test_has_higher_priority_waiting(sem):
    """Check if higher priority waiters are detected."""
    assert sem.has_higher_priority_waiting(TaskPriority.BACKGROUND) is False

    async with sem.acquire(TaskPriority.BACKGROUND, timeout=5, label="holder"):
        # Queue a chat waiter
        async def chat_waiter():
            async with sem.acquire(TaskPriority.CHAT, timeout=5, label="chat"):
                pass

        task = asyncio.create_task(chat_waiter())
        await asyncio.sleep(0.05)

        # Background should see that chat (higher priority) is waiting
        assert sem.has_higher_priority_waiting(TaskPriority.BACKGROUND) is True
        # Chat should not see higher priority waiting (nothing above priority 1)
        assert sem.has_higher_priority_waiting(TaskPriority.CHAT) is False

    await task
