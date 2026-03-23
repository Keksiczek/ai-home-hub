"""SQLite-backed audit log – records every capability execution.

Every call to a system capability (shell, file ops, browser, app launch)
is persisted here with full context: who requested it, what happened,
and the outcome.  Auto-prunes old entries based on retention settings.
"""

import json
import logging
import sqlite3
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

DB_DIR = Path(__file__).parent.parent.parent / "data"
DB_PATH = DB_DIR / "audit_log.db"

MAX_ROWS = 50_000
PRUNE_KEEP = 40_000
DEFAULT_RETENTION_DAYS = 30

_SCHEMA = """
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    capability TEXT NOT NULL,
    action TEXT NOT NULL DEFAULT '',
    params TEXT DEFAULT '{}',
    result_status TEXT NOT NULL DEFAULT 'ok',
    result_summary TEXT DEFAULT '',
    error TEXT DEFAULT '',
    duration_ms REAL DEFAULT 0.0,
    risk_tier TEXT DEFAULT 'low',
    approved_by TEXT DEFAULT 'auto',
    metadata TEXT DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_al_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_al_capability ON audit_log(capability);
CREATE INDEX IF NOT EXISTS idx_al_result_status ON audit_log(result_status);
"""


class AuditLogDB:
    """Synchronous SQLite database for capability audit logging."""

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
            logger.info("AuditLogDB initialized at %s", self._db_path)
        except Exception as exc:
            logger.error("Failed to initialize AuditLogDB: %s", exc)

    def log(
        self,
        capability: str,
        action: str = "",
        params: Optional[Dict[str, Any]] = None,
        result_status: str = "ok",
        result_summary: str = "",
        error: str = "",
        duration_ms: float = 0.0,
        risk_tier: str = "low",
        approved_by: str = "auto",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Insert an audit record and auto-prune if needed."""
        try:
            conn = self._get_conn()
            conn.execute(
                """INSERT INTO audit_log
                   (timestamp, capability, action, params, result_status,
                    result_summary, error, duration_ms, risk_tier, approved_by, metadata)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    datetime.now(timezone.utc).isoformat(),
                    capability,
                    action,
                    json.dumps(params or {}),
                    result_status,
                    result_summary[:500] if result_summary else "",
                    error[:500] if error else "",
                    duration_ms,
                    risk_tier,
                    approved_by,
                    json.dumps(metadata or {}),
                ),
            )
            conn.commit()

            # Auto-prune
            row = conn.execute("SELECT COUNT(*) as cnt FROM audit_log").fetchone()
            if row and row["cnt"] > MAX_ROWS:
                conn.execute(
                    """DELETE FROM audit_log
                       WHERE id NOT IN (
                           SELECT id FROM audit_log
                           ORDER BY id DESC LIMIT ?
                       )""",
                    (PRUNE_KEEP,),
                )
                conn.commit()
                logger.info("AuditLogDB auto-pruned to %d rows", PRUNE_KEEP)

            conn.close()
        except Exception as exc:
            logger.error("Failed to write audit log: %s", exc)

    def get_entries(
        self,
        limit: int = 50,
        capability: Optional[str] = None,
        result_status: Optional[str] = None,
        since: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Return recent audit entries with optional filtering."""
        try:
            conn = self._get_conn()
            query = "SELECT * FROM audit_log WHERE 1=1"
            params: list = []
            if capability:
                query += " AND capability = ?"
                params.append(capability)
            if result_status:
                query += " AND result_status = ?"
                params.append(result_status)
            if since:
                query += " AND timestamp >= ?"
                params.append(since)
            query += " ORDER BY id DESC LIMIT ?"
            params.append(limit)

            rows = conn.execute(query, params).fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as exc:
            logger.error("Failed to get audit entries: %s", exc)
            return []

    def get_stats(self) -> Dict[str, Any]:
        """Return summary statistics."""
        try:
            conn = self._get_conn()
            total = conn.execute("SELECT COUNT(*) as cnt FROM audit_log").fetchone()
            errors = conn.execute(
                "SELECT COUNT(*) as cnt FROM audit_log WHERE result_status = 'error'"
            ).fetchone()
            by_cap = conn.execute(
                "SELECT capability, COUNT(*) as cnt FROM audit_log GROUP BY capability ORDER BY cnt DESC LIMIT 10"
            ).fetchall()
            conn.close()
            return {
                "total_entries": total["cnt"] if total else 0,
                "total_errors": errors["cnt"] if errors else 0,
                "by_capability": {r["capability"]: r["cnt"] for r in by_cap},
            }
        except Exception as exc:
            logger.error("Failed to get audit stats: %s", exc)
            return {"total_entries": 0, "total_errors": 0, "by_capability": {}}

    def prune_old(self, retention_days: int = DEFAULT_RETENTION_DAYS) -> int:
        """Delete entries older than retention_days. Returns count deleted."""
        try:
            cutoff = (
                datetime.now(timezone.utc) - timedelta(days=retention_days)
            ).isoformat()
            conn = self._get_conn()
            cursor = conn.execute(
                "DELETE FROM audit_log WHERE timestamp < ?", (cutoff,)
            )
            deleted = cursor.rowcount
            conn.commit()
            conn.close()
            logger.info(
                "AuditLogDB pruned %d entries older than %d days",
                deleted,
                retention_days,
            )
            return deleted
        except Exception as exc:
            logger.error("Failed to prune audit log: %s", exc)
            return 0

    def vacuum(self) -> None:
        """Reclaim disk space."""
        try:
            conn = self._get_conn()
            conn.execute("VACUUM")
            conn.close()
        except Exception as exc:
            logger.error("Failed to vacuum AuditLogDB: %s", exc)


# ── Singleton ────────────────────────────────────────────────────────────────

_instance: Optional[AuditLogDB] = None


def get_audit_log_db() -> AuditLogDB:
    global _instance
    if _instance is None:
        _instance = AuditLogDB()
    return _instance


def reset_audit_log_db() -> None:
    """Reset singleton (for testing)."""
    global _instance
    _instance = None
