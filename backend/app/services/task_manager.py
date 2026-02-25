"""Task manager – background asyncio tasks with WebSocket progress broadcasting."""
import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, Coroutine, Dict, Optional

logger = logging.getLogger(__name__)

# Task status constants
STATUS_PENDING = "pending"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"
STATUS_CANCELLED = "cancelled"


class TaskRecord:
    def __init__(self, task_id: str, name: str, task_type: str, params: Dict[str, Any]) -> None:
        self.task_id = task_id
        self.name = name
        self.task_type = task_type
        self.params = params
        self.status = STATUS_PENDING
        self.progress = 0
        self.message: Optional[str] = None
        self.result: Optional[Any] = None
        self.error: Optional[str] = None
        self.created_at = _now()
        self.updated_at = _now()
        self._asyncio_task: Optional[asyncio.Task] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "name": self.name,
            "task_type": self.task_type,
            "status": self.status,
            "progress": self.progress,
            "message": self.message,
            "result": self.result,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class TaskManager:
    def __init__(self) -> None:
        self._tasks: Dict[str, TaskRecord] = {}
        # Lazy import to avoid circular dependency
        self._broadcast_fn: Optional[Callable] = None

    def set_broadcast(self, fn: Callable) -> None:
        """Register a coroutine function for broadcasting WebSocket messages."""
        self._broadcast_fn = fn

    async def _broadcast(self, task: TaskRecord) -> None:
        if self._broadcast_fn:
            try:
                await self._broadcast_fn(
                    {
                        "type": "task_update",
                        "task": task.to_dict(),
                    }
                )
            except Exception as exc:
                logger.debug("Broadcast failed: %s", exc)

    async def create_task(
        self,
        name: str,
        task_type: str,
        coro: Coroutine,
        params: Dict[str, Any] = None,
    ) -> str:
        """Schedule a coroutine as a background task. Returns task_id."""
        task_id = str(uuid.uuid4())[:8]
        record = TaskRecord(task_id, name, task_type, params or {})
        self._tasks[task_id] = record

        async def _runner():
            record.status = STATUS_RUNNING
            record.updated_at = _now()
            await self._broadcast(record)
            try:
                result = await coro
                record.status = STATUS_COMPLETED
                record.progress = 100
                record.result = result
                record.message = "Completed successfully"
            except asyncio.CancelledError:
                record.status = STATUS_CANCELLED
                record.message = "Task was cancelled"
            except Exception as exc:
                record.status = STATUS_FAILED
                record.error = str(exc)
                record.message = f"Failed: {exc}"
                logger.error("Task %s failed: %s", task_id, exc)
            finally:
                record.updated_at = _now()
                await self._broadcast(record)

        record._asyncio_task = asyncio.create_task(_runner())
        logger.info("Task %s (%s) created", task_id, name)
        return task_id

    async def update_progress(self, task_id: str, progress: int, message: Optional[str] = None) -> None:
        """Update task progress from within the running coroutine."""
        record = self._tasks.get(task_id)
        if record:
            record.progress = min(max(progress, 0), 99)  # 100 reserved for completion
            record.message = message
            record.updated_at = _now()
            await self._broadcast(record)

    def get_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        record = self._tasks.get(task_id)
        return record.to_dict() if record else None

    def list_tasks(self) -> list:
        return [r.to_dict() for r in self._tasks.values()]

    async def cancel_task(self, task_id: str) -> bool:
        record = self._tasks.get(task_id)
        if record and record._asyncio_task and not record._asyncio_task.done():
            record._asyncio_task.cancel()
            try:
                await record._asyncio_task
            except asyncio.CancelledError:
                pass
            return True
        return False

    def cleanup_completed(self) -> int:
        """Remove completed/failed/cancelled tasks. Returns count removed."""
        done_ids = [
            tid
            for tid, r in self._tasks.items()
            if r.status in (STATUS_COMPLETED, STATUS_FAILED, STATUS_CANCELLED)
        ]
        for tid in done_ids:
            del self._tasks[tid]
        return len(done_ids)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# Shared singleton
_task_manager = TaskManager()


def get_task_manager() -> TaskManager:
    return _task_manager
