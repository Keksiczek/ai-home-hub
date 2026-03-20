"""SQLite-backed jobs database for persistent job history.

Provides async access via aiosqlite. Falls back gracefully if aiosqlite
is not installed – the rest of the app keeps working with the JSON job service.
"""
import json
import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

DB_DIR = Path(__file__).parent.parent.parent / "data"
DB_PATH = DB_DIR / "jobs.db"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    input_summary TEXT DEFAULT '',
    output_summary TEXT DEFAULT '',
    full_output TEXT DEFAULT '{}',
    execution_time INTEGER DEFAULT 0,
    model_used TEXT DEFAULT '',
    ram_usage REAL DEFAULT 0.0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);
"""


class JobsDB:
    """Synchronous SQLite jobs database (runs in thread via asyncio.to_thread)."""

    def __init__(self) -> None:
        DB_DIR.mkdir(parents=True, exist_ok=True)
        self._db_path = str(DB_PATH)
        self._init_schema()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout=5000")
        return conn

    def _init_schema(self) -> None:
        try:
            conn = self._get_conn()
            conn.executescript(_SCHEMA)
            conn.close()
            logger.info("JobsDB initialized at %s", self._db_path)
        except Exception as exc:
            logger.error("JobsDB schema init failed: %s", exc)

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def insert_job(self, job: Dict[str, Any]) -> None:
        now = self._now()
        conn = self._get_conn()
        try:
            conn.execute(
                """INSERT OR REPLACE INTO jobs
                   (id, type, title, status, input_summary, output_summary,
                    full_output, execution_time, model_used, ram_usage,
                    created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    job["id"],
                    job.get("type", ""),
                    job.get("title", ""),
                    job.get("status", "queued"),
                    job.get("input_summary", ""),
                    job.get("output_summary", ""),
                    json.dumps(job.get("full_output", {}), ensure_ascii=False),
                    job.get("execution_time", 0),
                    job.get("model_used", ""),
                    job.get("ram_usage", 0.0),
                    job.get("created_at", now),
                    now,
                ),
            )
            conn.commit()
        finally:
            conn.close()

    def update_job(self, job_id: str, updates: Dict[str, Any]) -> None:
        """Update specific fields of a job."""
        allowed = {"status", "output_summary", "full_output", "execution_time",
                   "model_used", "ram_usage", "input_summary", "title"}
        sets = []
        vals = []
        for k, v in updates.items():
            if k not in allowed:
                continue
            if k == "full_output":
                v = json.dumps(v, ensure_ascii=False)
            sets.append(f"{k} = ?")
            vals.append(v)

        if not sets:
            return

        sets.append("updated_at = ?")
        vals.append(self._now())
        vals.append(job_id)

        conn = self._get_conn()
        try:
            conn.execute(f"UPDATE jobs SET {', '.join(sets)} WHERE id = ?", vals)
            conn.commit()
        finally:
            conn.close()

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        try:
            row = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def list_jobs(
        self,
        status: Optional[str] = None,
        type_filter: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        try:
            query = "SELECT * FROM jobs"
            params: list = []
            wheres = []
            if status:
                wheres.append("status = ?")
                params.append(status)
            if type_filter:
                wheres.append("type = ?")
                params.append(type_filter)
            if wheres:
                query += " WHERE " + " AND ".join(wheres)
            query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])

            rows = conn.execute(query, params).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_stats(self, since: Optional[str] = None) -> Dict[str, Any]:
        conn = self._get_conn()
        try:
            where = ""
            params: list = []
            if since:
                where = " WHERE created_at >= ?"
                params = [since]

            total = conn.execute(f"SELECT COUNT(*) FROM jobs{where}", params).fetchone()[0]
            failed = conn.execute(
                f"SELECT COUNT(*) FROM jobs{where}{' AND' if where else ' WHERE'} status = 'failed'",
                params + (["failed"] if not where else []),
            ).fetchone()[0] if where else conn.execute(
                "SELECT COUNT(*) FROM jobs WHERE status = 'failed'" + (f" AND created_at >= ?" if since else ""),
                [since] if since else [],
            ).fetchone()[0]

            avg_time = conn.execute(
                f"SELECT AVG(execution_time) FROM jobs{where}{' AND' if where else ' WHERE'} execution_time > 0",
                params,
            ).fetchone()[0] or 0

            return {
                "total": total,
                "failed": failed,
                "avg_execution_time_ms": round(avg_time),
            }
        finally:
            conn.close()

    def delete_job(self, job_id: str) -> bool:
        conn = self._get_conn()
        try:
            cursor = conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

    def count_by_status(self) -> Dict[str, int]:
        conn = self._get_conn()
        try:
            rows = conn.execute("SELECT status, COUNT(*) as cnt FROM jobs GROUP BY status").fetchall()
            return {r["status"]: r["cnt"] for r in rows}
        finally:
            conn.close()


# Singleton
_jobs_db: Optional[JobsDB] = None


def get_jobs_db() -> JobsDB:
    global _jobs_db
    if _jobs_db is None:
        _jobs_db = JobsDB()
    return _jobs_db
