"""Tests for circuit breaker (4A)."""

import pytest

from app.utils.circuit_breaker import CircuitBreaker, CircuitState


@pytest.mark.asyncio
async def test_circuit_starts_closed():
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=0.1)
    assert cb.state == CircuitState.CLOSED
    assert await cb.can_execute() is True


@pytest.mark.asyncio
async def test_circuit_opens_after_threshold():
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=30)
    for _ in range(3):
        await cb.record_failure()
    assert cb.state == CircuitState.OPEN
    assert await cb.can_execute() is False


@pytest.mark.asyncio
async def test_circuit_half_open_after_timeout():
    cb = CircuitBreaker(failure_threshold=2, recovery_timeout=0.01)
    await cb.record_failure()
    await cb.record_failure()
    assert cb.state == CircuitState.OPEN

    import asyncio

    await asyncio.sleep(0.02)

    assert cb.state == CircuitState.HALF_OPEN
    assert await cb.can_execute() is True


@pytest.mark.asyncio
async def test_circuit_closes_on_success():
    cb = CircuitBreaker(failure_threshold=2, recovery_timeout=0.01)
    await cb.record_failure()
    await cb.record_failure()
    assert cb.state == CircuitState.OPEN

    import asyncio

    await asyncio.sleep(0.02)

    await cb.record_success()
    assert cb.state == CircuitState.CLOSED


@pytest.mark.asyncio
async def test_circuit_stays_closed_below_threshold():
    cb = CircuitBreaker(failure_threshold=5, recovery_timeout=30)
    for _ in range(4):
        await cb.record_failure()
    assert cb.state == CircuitState.CLOSED
    assert await cb.can_execute() is True


@pytest.mark.asyncio
async def test_reset():
    cb = CircuitBreaker(failure_threshold=2, recovery_timeout=30)
    await cb.record_failure()
    await cb.record_failure()
    assert cb.state == CircuitState.OPEN
    cb.reset()
    assert cb.state == CircuitState.CLOSED
