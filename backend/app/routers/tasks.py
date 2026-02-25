"""Tasks router – manage background task lifecycle."""
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.models.schemas import CreateTaskRequest, TaskStatusResponse
from app.services.task_manager import get_task_manager

router = APIRouter()


@router.get("/tasks", tags=["tasks"])
async def list_tasks() -> Dict[str, Any]:
    """List all background tasks and their status."""
    tm = get_task_manager()
    tasks = tm.list_tasks()
    return {"tasks": tasks, "count": len(tasks)}


@router.get("/tasks/{task_id}/status", response_model=TaskStatusResponse, tags=["tasks"])
async def get_task_status(task_id: str) -> Dict[str, Any]:
    """Get current status of a background task."""
    tm = get_task_manager()
    task = tm.get_status(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


@router.post("/tasks/{task_id}/cancel", tags=["tasks"])
async def cancel_task(task_id: str) -> Dict[str, Any]:
    """Cancel a running background task."""
    tm = get_task_manager()
    success = await tm.cancel_task(task_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Task {task_id} is not running or does not exist",
        )
    return {"task_id": task_id, "status": "cancelled"}


@router.post("/tasks/cleanup", tags=["tasks"])
async def cleanup_tasks() -> Dict[str, Any]:
    """Remove all completed/failed/cancelled tasks."""
    tm = get_task_manager()
    count = tm.cleanup_completed()
    return {"removed": count}
