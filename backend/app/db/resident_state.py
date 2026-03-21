"""SQLite-backed resident agent history – persists cycle records across restarts.

Uses synchronous sqlite3 with a simple API; callers wrap in asyncio.to_thread
when needed.  The table auto-prunes to MAX_ROWS to prevent unbounded growth.
"""

import json
import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

DB_DIR = Path(__file__).parent.parent.parent / "data"
DB_PATH = DB_DIR / "resident_state.db"

MAX_ROWS = 10_000
PRUNE_KEEP = 9_000  # keep this many rows after pruning

_SCHEMA = """
CREATE TABLE IF NOT EXISTS resident_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    cycle_id TEXT NOT NULL,
    cycle_number INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success',
    action_type TEXT DEFAULT '',
    action_target TEXT DEFAULT '',
    output_preview TEXT DEFAULT '',
    duration_ms REAL DEFAULT 0.0,
    error TEXT DEFAULT '',
    metrics JSON DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_rh_timestamp ON resident_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rh_cycle_id ON resident_history(cycle_id);
CREATE INDEX IF NOT EXISTS idx_rh_status ON resident_history(status);
"""


class ResidentStateDB:
    """Synchronous SQLite database for resident agent cycle history."""

    def __init__(self) -> None:
        DB_DIR.mkdir(parents=True, exist_ok=True)
        self._db_path = str(DB_PATH)
        self._init_schema()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def _init_schema(self) -> None:
        try:
            conn = self._get_conn()
            conn.executescript(_SCHEMA)
            conn.close()
            logger.info("ResidentStateDB initialized at %s", self._db_path)
        except Exception as exc:
            logger.error("Failed to initialize ResidentStateDB: %s", exc)

    def save_cycle(
        self,
        cycle_id: str,
        cycle_number: int,
        timestamp: str,
        status: str,
        action_type: str = "",
        action_target: str = "",
        output_preview: str = "",
        duration_ms: float = 0.0,
        error: str = "",
        metrics: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Insert a cycle record and auto-prune if table exceeds MAX_ROWS."""
        try:
            conn = self._get_conn()
            conn.execute(
                """INSERT INTO resident_history
                   (timestamp, cycle_id, cycle_number, status, action_type,
                    action_target, output_preview, duration_ms, error, metrics)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    timestamp,
                    cycle_id,
                    cycle_number,
                    status,
                    action_type,
                    action_target,
                    output_preview[:500] if output_preview else "",
                    duration_ms,
                    error[:500] if error else "",
                    json.dumps(metrics or {}),
                ),
            )
            conn.commit()

            # Auto-prune
            row = conn.execute("SELECT COUNT(*) as cnt FROM resident_history").fetchone()
            if row and row["cnt"] > MAX_ROWS:
                conn.execute(
                    """DELETE FROM resident_history
                       WHERE id NOT IN (
                           SELECT id FROM resident_history
                           ORDER BY id DESC LIMIT ?
                       )""",
                    (PRUNE_KEEP,),
                )
                pruned = conn.total_changes
                conn.commit()
                logger.info("ResidentStateDB pruned %d old rows", pruned)

            conn.close()
        except Exception as exc:
            logger.error("Failed to save cycle record: %s", exc)

    def get_history(
        self,
        limit: int = 50,
        status: Optional[str] = None,
        since: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Return recent cycle history records."""
        try:
            conn = self._get_conn()
            query = "SELECT * FROM resident_history WHERE 1=1"
            params: list = []
            if status:
                query += " AND status = ?"
                params.append(status)
            if since:
                query += " AND timestamp >= ?"
                params.append(since)
            query += " ORDER BY id DESC LIMIT ?"
            params.append(limit)

            rows = conn.execute(query, params).fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as exc:
            logger.error("Failed to get resident history: %s", exc)
            return []

    def get_stats(self) -> Dict[str, Any]:
        """Return summary statistics."""
        try:
            conn = self._get_conn()
            total = conn.execute("SELECT COUNT(*) as cnt FROM resident_history").fetchone()
            errors = conn.execute(
                "SELECT COUNT(*) as cnt FROM resident_history WHERE status = 'error'"
            ).fetchone()
            avg_dur = conn.execute(
                "SELECT AVG(duration_ms) as avg_ms FROM resident_history"
            ).fetchone()
            conn.close()
            return {
                "total_cycles": total["cnt"] if total else 0,
                "total_errors": errors["cnt"] if errors else 0,
                "avg_duration_ms": round(avg_dur["avg_ms"] or 0, 1) if avg_dur else 0,
            }
        except Exception as exc:
            logger.error("Failed to get resident stats: %s", exc)
            return {"total_cycles": 0, "total_errors": 0, "avg_duration_ms": 0}

    def vacuum(self) -> None:
        """Run VACUUM to reclaim disk space."""
        try:
            conn = self._get_conn()
            conn.execute("VACUUM")
            conn.close()
            logger.info("ResidentStateDB vacuumed")
        except Exception as exc:
            logger.error("Failed to vacuum ResidentStateDB: %s", exc)


# Singleton
_instance: Optional[ResidentStateDB] = None


def get_resident_state_db() -> ResidentStateDB:
    global _instance
    if _instance is None:
        _instance = ResidentStateDB()
    return _instance
