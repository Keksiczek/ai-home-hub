"""Periodic cleanup service – runs every 6 hours to maintain system hygiene.

Tasks:
  1. Delete sessions older than 7 days (data/sessions/*)
  2. Archive KB data older than 30 days to data/archive/
  3. Vacuum SQLite databases (jobs.db, resident_state.db)
  4. Log freed disk space
"""

import asyncio
import logging
import os
import shutil
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent.parent / "data"
SESSIONS_DIR = DATA_DIR / "sessions"
ARCHIVE_DIR = DATA_DIR / "archive"

# Cleanup intervals and thresholds
CLEANUP_INTERVAL_S = 6 * 3600  # 6 hours
SESSION_MAX_AGE_DAYS = 7
KB_ARCHIVE_AGE_DAYS = 30


class CleanupService:
    """Background service that periodically cleans up old data."""

    def __init__(self) -> None:
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._last_run: Optional[str] = None
        self._last_freed_bytes: int = 0

    def start(self) -> asyncio.Task:
        """Start the cleanup loop as an asyncio task."""
        self._running = True
        self._task = asyncio.create_task(self._run(), name="cleanup_service")
        return self._task

    async def stop(self) -> None:
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()

    async def _run(self) -> None:
        """Main loop – runs cleanup every CLEANUP_INTERVAL_S."""
        logger.info("CleanupService started (interval=%ds)", CLEANUP_INTERVAL_S)
        while self._running:
            try:
                await asyncio.to_thread(self._do_cleanup)
            except Exception as exc:
                logger.error("CleanupService error: %s", exc)
            await asyncio.sleep(CLEANUP_INTERVAL_S)

    def _do_cleanup(self) -> None:
        """Synchronous cleanup operations."""
        start = time.monotonic()
        total_freed = 0

        total_freed += self._cleanup_old_sessions()
        total_freed += self._archive_old_kb_data()
        self._vacuum_databases()

        elapsed = round(time.monotonic() - start, 1)
        freed_mb = round(total_freed / (1024 * 1024), 2)
        self._last_run = datetime.now(timezone.utc).isoformat()
        self._last_freed_bytes = total_freed

        logger.info("Cleanup: freed %.2f MB in %.1fs", freed_mb, elapsed)

    def _cleanup_old_sessions(self) -> int:
        """Delete session files older than SESSION_MAX_AGE_DAYS. Returns bytes freed."""
        freed = 0
        if not SESSIONS_DIR.exists():
            return freed

        cutoff = time.time() - (SESSION_MAX_AGE_DAYS * 86400)
        count = 0
        for f in SESSIONS_DIR.glob("*.json"):
            try:
                if f.stat().st_mtime < cutoff:
                    size = f.stat().st_size
                    f.unlink()
                    freed += size
                    count += 1
            except Exception as exc:
                logger.debug("Failed to clean session %s: %s", f.name, exc)

        if count:
            logger.info("Cleanup: removed %d old sessions (>%dd)", count, SESSION_MAX_AGE_DAYS)
        return freed

    def _archive_old_kb_data(self) -> int:
        """Move KB artifacts older than KB_ARCHIVE_AGE_DAYS to archive. Returns bytes freed."""
        freed = 0
        artifacts_dir = DATA_DIR / "artifacts"
        if not artifacts_dir.exists():
            return freed

        ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
        cutoff = time.time() - (KB_ARCHIVE_AGE_DAYS * 86400)
        count = 0

        for f in artifacts_dir.iterdir():
            try:
                if f.is_file() and f.stat().st_mtime < cutoff:
                    size = f.stat().st_size
                    dest = ARCHIVE_DIR / f.name
                    shutil.move(str(f), str(dest))
                    freed += size
                    count += 1
            except Exception as exc:
                logger.debug("Failed to archive %s: %s", f.name, exc)

        if count:
            logger.info("Cleanup: archived %d old artifacts (>%dd)", count, KB_ARCHIVE_AGE_DAYS)
        return freed

    def _vacuum_databases(self) -> None:
        """Vacuum SQLite databases to reclaim space."""
        db_files = [
            DATA_DIR / "jobs.db",
            DATA_DIR / "resident_state.db",
        ]
        for db_path in db_files:
            if db_path.exists():
                try:
                    import sqlite3
                    conn = sqlite3.connect(str(db_path), timeout=10)
                    conn.execute("VACUUM")
                    conn.close()
                    logger.info("Vacuumed %s", db_path.name)
                except Exception as exc:
                    logger.debug("Failed to vacuum %s: %s", db_path.name, exc)

    def get_status(self) -> dict:
        """Return cleanup service status."""
        return {
            "last_run": self._last_run,
            "last_freed_mb": round(self._last_freed_bytes / (1024 * 1024), 2),
            "interval_hours": CLEANUP_INTERVAL_S // 3600,
            "session_max_age_days": SESSION_MAX_AGE_DAYS,
        }


# Singleton
_instance: Optional[CleanupService] = None


def get_cleanup_service() -> CleanupService:
    global _instance
    if _instance is None:
        _instance = CleanupService()
    return _instance
