"""Tests for async retry decorator (4A)."""
import pytest
import httpx

from app.utils.retry import async_retry


@pytest.mark.asyncio
async def test_retry_succeeds_on_first_attempt():
    call_count = 0

    @async_retry(max_attempts=3, backoff_base=0.01)
    async def succeed():
        nonlocal call_count
        call_count += 1
        return "ok"

    result = await succeed()
    assert result == "ok"
    assert call_count == 1


@pytest.mark.asyncio
async def test_retry_succeeds_after_failures():
    call_count = 0

    @async_retry(max_attempts=3, backoff_base=0.01)
    async def fail_twice():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise httpx.ConnectError("connection refused")
        return "ok"

    result = await fail_twice()
    assert result == "ok"
    assert call_count == 3


@pytest.mark.asyncio
async def test_retry_raises_after_all_attempts():
    call_count = 0

    @async_retry(max_attempts=2, backoff_base=0.01)
    async def always_fail():
        nonlocal call_count
        call_count += 1
        raise httpx.TimeoutException("timed out")

    with pytest.raises(httpx.TimeoutException):
        await always_fail()
    assert call_count == 2


@pytest.mark.asyncio
async def test_retry_does_not_catch_unrelated_exceptions():
    @async_retry(max_attempts=3, backoff_base=0.01)
    async def raise_value_error():
        raise ValueError("not retryable")

    with pytest.raises(ValueError):
        await raise_value_error()
