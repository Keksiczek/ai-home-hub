"""Periodic cleanup service – runs every N hours to maintain system hygiene.

Tasks:
  1. Delete sessions older than session_retention_days (data/sessions/*)
  2. Archive KB data older than artifact_retention_days to data/archive/
  3. Vacuum SQLite databases (jobs.db, resident_state.db) – if vacuum_enabled
  4. Log freed disk space

All thresholds are configurable via settings (cleanup section).
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

# Fallback defaults (used when settings cannot be loaded)
_DEFAULT_CONFIG = {
    "enabled": True,
    "interval_hours": 6,
    "session_retention_days": 7,
    "artifact_retention_days": 30,
    "vacuum_enabled": True,
}


def _load_cleanup_config() -> dict:
    """Load cleanup config from settings, falling back to defaults."""
    try:
        from app.services.settings_service import get_settings_service

        settings = get_settings_service().load()
        cfg = settings.get("cleanup", {})
        # Merge with defaults so missing keys fall back gracefully
        result = dict(_DEFAULT_CONFIG)
        result.update(cfg)
        return result
    except Exception as exc:
        logger.debug("Failed to load cleanup config, using defaults: %s", exc)
        return dict(_DEFAULT_CONFIG)


class CleanupService:
    """Background service that periodically cleans up old data."""

    def __init__(self) -> None:
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._last_run: Optional[str] = None
        self._last_freed_bytes: int = 0
        self._last_config: dict = dict(_DEFAULT_CONFIG)

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
        """Main loop – runs cleanup every interval_hours (loaded fresh each cycle)."""
        logger.info("CleanupService started")
        while self._running:
            cfg = _load_cleanup_config()
            self._last_config = cfg
            interval_s = int(cfg.get("interval_hours", 6)) * 3600

            if not cfg.get("enabled", True):
                logger.info(
                    "CleanupService: cleanup disabled by user config, skipping cycle"
                )
            else:
                try:
                    await asyncio.to_thread(self._do_cleanup, cfg)
                except Exception as exc:
                    logger.error("CleanupService error: %s", exc)

            await asyncio.sleep(interval_s)

    def _do_cleanup(self, cfg: dict) -> None:
        """Synchronous cleanup operations using provided config."""
        start = time.monotonic()
        total_freed = 0

        session_days = int(cfg.get("session_retention_days", 7))
        artifact_days = int(cfg.get("artifact_retention_days", 30))
        vacuum_enabled = cfg.get("vacuum_enabled", True)

        total_freed += self._cleanup_old_sessions(session_days)
        total_freed += self._archive_old_kb_data(artifact_days)
        if vacuum_enabled:
            self._vacuum_databases()

        elapsed = round(time.monotonic() - start, 1)
        freed_mb = round(total_freed / (1024 * 1024), 2)
        self._last_run = datetime.now(timezone.utc).isoformat()
        self._last_freed_bytes = total_freed

        logger.info("Cleanup: freed %.2f MB in %.1fs", freed_mb, elapsed)

    def run_now(self) -> dict:
        """Run a cleanup cycle immediately (synchronous, for on-demand use)."""
        cfg = _load_cleanup_config()
        self._last_config = cfg
        if not cfg.get("enabled", True):
            logger.info(
                "CleanupService: cleanup disabled by user config, skipping on-demand run"
            )
            return {"status": "skipped", "reason": "cleanup disabled by user config"}
        self._do_cleanup(cfg)
        return {
            "status": "completed",
            "last_run": self._last_run,
            "freed_mb": round(self._last_freed_bytes / (1024 * 1024), 2),
        }

    def _cleanup_old_sessions(self, max_age_days: int) -> int:
        """Delete session files older than max_age_days. Returns bytes freed."""
        freed = 0
        if not SESSIONS_DIR.exists():
            return freed

        cutoff = time.time() - (max_age_days * 86400)
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
            logger.info("Cleanup: removed %d old sessions (>%dd)", count, max_age_days)
        return freed

    def _archive_old_kb_data(self, max_age_days: int) -> int:
        """Move KB artifacts older than max_age_days to archive. Returns bytes freed."""
        freed = 0
        artifacts_dir = DATA_DIR / "artifacts"
        if not artifacts_dir.exists():
            return freed

        ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
        cutoff = time.time() - (max_age_days * 86400)
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
            logger.info(
                "Cleanup: archived %d old artifacts (>%dd)", count, max_age_days
            )
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
        """Return cleanup service status including current config."""
        cfg = _load_cleanup_config()
        return {
            "last_run": self._last_run,
            "last_freed_mb": round(self._last_freed_bytes / (1024 * 1024), 2),
            "interval_hours": cfg.get("interval_hours", 6),
            "session_max_age_days": cfg.get("session_retention_days", 7),
            "config": cfg,
        }


# Singleton
_instance: Optional[CleanupService] = None


def get_cleanup_service() -> CleanupService:
    global _instance
    if _instance is None:
        _instance = CleanupService()
    return _instance
