"""SQLite-backed creative studio history database.

Follows the same pattern as jobs_db.py – synchronous SQLite with
asyncio.to_thread for async callers.
"""

import json
import logging
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

DB_DIR = Path(__file__).parent.parent.parent / "data"
DB_PATH = DB_DIR / "creative.db"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS creative_history (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    model TEXT NOT NULL,
    result_preview TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creative_created ON creative_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creative_type ON creative_history(type);
"""


class CreativeDB:
    """Synchronous SQLite creative history database."""

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
        except Exception:
            logger.exception("Failed to init creative DB schema")

    def save(
        self,
        item_id: str,
        item_type: str,
        title: str,
        prompt: str,
        model: str,
        result_preview: str,
        payload: Dict[str, Any],
        created_at: str,
    ) -> None:
        conn = self._get_conn()
        try:
            conn.execute(
                """INSERT OR REPLACE INTO creative_history
                   (id, type, title, prompt, model, result_preview, payload_json, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    item_id,
                    item_type,
                    title,
                    prompt,
                    model,
                    result_preview,
                    json.dumps(payload, ensure_ascii=False),
                    created_at,
                ),
            )
            conn.commit()
        finally:
            conn.close()

    def list_items(self, limit: int = 20) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        try:
            rows = conn.execute(
                """SELECT id, type, title, prompt, model, result_preview, created_at
                   FROM creative_history ORDER BY created_at DESC LIMIT ?""",
                (limit,),
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_item(self, item_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        try:
            row = conn.execute(
                """SELECT id, type, title, prompt, model, result_preview,
                          payload_json, created_at
                   FROM creative_history WHERE id = ?""",
                (item_id,),
            ).fetchone()
            if row is None:
                return None
            result = dict(row)
            result["payload"] = json.loads(result.pop("payload_json"))
            return result
        finally:
            conn.close()


# Singleton
_instance: Optional[CreativeDB] = None


def get_creative_db() -> CreativeDB:
    global _instance
    if _instance is None:
        _instance = CreativeDB()
    return _instance
