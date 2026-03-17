"""Job service – persistent job queue with JSON storage."""
import json
import logging
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "jobs"
JOBS_FILE = DATA_DIR / "jobs.json"

# Maximum length for last_error to avoid bloating the JSON file
_MAX_ERROR_LEN = 2000


class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # e.g. "long_llm_task", "dummy_long_task", "kb_reindex"
    title: str
    input_summary: str = ""
    payload: Dict[str, Any] = Field(default_factory=dict)
    priority: str = "normal"  # "high" | "normal" | "low"
    status: str = "queued"  # "queued" | "running" | "paused" | "succeeded" | "failed" | "cancelled"
    progress: float = 0.0  # 0–100
    created_at: str = Field(default_factory=lambda: _now())
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    last_error: Optional[str] = None
    meta: Dict[str, Any] = Field(default_factory=dict)


class JobService:
    def __init__(self) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._ensure_file()

    def _ensure_file(self) -> None:
        if not JOBS_FILE.exists():
            self._write_raw([])

    def _read_raw(self) -> List[Dict[str, Any]]:
        try:
            with open(JOBS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            logger.warning("Jobs file corrupted or missing, resetting")
            self._write_raw([])
            return []

    def _write_raw(self, data: List[Dict[str, Any]]) -> None:
        with open(JOBS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def create_job(
        self,
        type: str,
        title: str,
        input_summary: str = "",
        payload: Optional[Dict[str, Any]] = None,
        priority: str = "normal",
        meta: Optional[Dict[str, Any]] = None,
    ) -> Job:
        job = Job(
            type=type,
            title=title,
            input_summary=input_summary,
            payload=payload or {},
            priority=priority,
            meta=meta or {},
        )
        with self._lock:
            jobs = self._read_raw()
            jobs.append(job.model_dump())
            self._write_raw(jobs)
        logger.info("Job created: %s (%s) [%s]", job.id, job.type, job.title)
        return job

    def update_job(self, job: Job) -> Job:
        # Safe-truncate last_error
        if job.last_error and len(job.last_error) > _MAX_ERROR_LEN:
            job.last_error = job.last_error[:_MAX_ERROR_LEN] + "...[truncated]"

        with self._lock:
            jobs = self._read_raw()
            for i, j in enumerate(jobs):
                if j["id"] == job.id:
                    jobs[i] = job.model_dump()
                    break
            else:
                # Job not found – append it
                jobs.append(job.model_dump())
            self._write_raw(jobs)
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        with self._lock:
            jobs = self._read_raw()
        for j in jobs:
            if j["id"] == job_id:
                return Job(**j)
        return None

    def list_jobs(
        self,
        status: Optional[str] = None,
        type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Job]:
        with self._lock:
            jobs = self._read_raw()

        # Filter
        if status:
            jobs = [j for j in jobs if j.get("status") == status]
        if type:
            jobs = [j for j in jobs if j.get("type") == type]

        # Sort newest first
        jobs.sort(key=lambda j: j.get("created_at", ""), reverse=True)

        # Paginate
        jobs = jobs[offset : offset + limit]
        return [Job(**j) for j in jobs]

    def count_jobs(
        self,
        status: Optional[str] = None,
        type: Optional[str] = None,
        since: Optional[str] = None,
    ) -> int:
        """Count jobs matching the given filters."""
        with self._lock:
            jobs = self._read_raw()
        if status:
            jobs = [j for j in jobs if j.get("status") == status]
        if type:
            jobs = [j for j in jobs if j.get("type") == type]
        if since:
            jobs = [j for j in jobs if j.get("created_at", "") >= since]
        return len(jobs)

    def get_stats_since(self, since: str, type: Optional[str] = None) -> dict:
        """Compute task stats for jobs created after `since` ISO timestamp."""
        with self._lock:
            jobs = self._read_raw()
        filtered = [j for j in jobs if j.get("created_at", "") >= since]
        if type:
            filtered = [j for j in filtered if j.get("type") == type]

        total = len(filtered)
        succeeded = sum(1 for j in filtered if j.get("status") == "succeeded")
        durations = []
        for j in filtered:
            started = j.get("started_at")
            finished = j.get("finished_at")
            if started and finished:
                try:
                    s = datetime.fromisoformat(started)
                    f = datetime.fromisoformat(finished)
                    durations.append((f - s).total_seconds())
                except (ValueError, TypeError):
                    pass

        return {
            "tasks_total": total,
            "success_rate": round(succeeded / total, 2) if total > 0 else 0.0,
            "avg_task_duration_s": round(sum(durations) / len(durations), 1) if durations else 0.0,
        }

    def reset_stale_running_jobs(self) -> int:
        """On startup, reset any 'running' jobs back to 'queued'
        (they were interrupted by a server restart)."""
        count = 0
        with self._lock:
            jobs = self._read_raw()
            for j in jobs:
                if j.get("status") == "running":
                    j["status"] = "queued"
                    j["started_at"] = None
                    j["progress"] = 0.0
                    j["meta"]["reset_on_restart"] = True
                    count += 1
            if count:
                self._write_raw(jobs)
        if count:
            logger.info("Reset %d stale running jobs back to queued", count)
        return count


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# Shared singleton
_job_service = JobService()


def get_job_service() -> JobService:
    return _job_service
