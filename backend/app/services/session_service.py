"""Session service – persists conversation history as JSON files."""
import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

SESSIONS_DIR = Path(__file__).parent.parent.parent / "data" / "sessions"


class SessionService:
    def __init__(self) -> None:
        SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

    # ── Session lifecycle ─────────────────────────────────────

    def create_session(self) -> str:
        """Create a new session and return its ID."""
        session_id = str(uuid.uuid4())[:8]
        data = {
            "session_id": session_id,
            "created_at": _now(),
            "messages": [],
            "artifacts": [],
            "active_agents": [],
        }
        self._write(session_id, data)
        return session_id

    def session_exists(self, session_id: str) -> bool:
        return self._path(session_id).exists()

    def list_sessions(self) -> List[Dict[str, Any]]:
        """Return metadata for all sessions, sorted by modification time (newest first)."""
        result = []
        for f in sorted(SESSIONS_DIR.glob("*.json"),
                        key=lambda p: p.stat().st_mtime,
                        reverse=True):
            try:
                data = self._read_raw(f.stem)
                messages = data.get("messages", [])

                # Find first user message for preview
                preview = ""
                for msg in messages:
                    if msg.get("role") == "user":
                        content = msg.get("content", "").strip()
                        preview = content[:50]
                        break

                result.append({
                    "session_id": data["session_id"],
                    "created_at": data.get("created_at", ""),
                    "updated_at": f.stat().st_mtime,
                    "message_count": len(messages),
                    "preview": preview + ("..." if len(preview) == 50 else ""),
                })
            except Exception as e:
                logger.warning("Failed to load session %s: %s", f, e)
                continue
        return result

    def delete_session(self, session_id: str) -> bool:
        p = self._path(session_id)
        if p.exists():
            p.unlink()
            return True
        return False

    # ── Message management ────────────────────────────────────

    def save_message(self, session_id: str, role: str, content: str, meta: Optional[Dict] = None) -> None:
        """Append a message to the session history."""
        if not self.session_exists(session_id):
            self.create_session()
            # Re-read to ensure the session file is at the right path
        data = self._read(session_id)
        message: Dict[str, Any] = {
            "role": role,
            "content": content,
            "timestamp": _now(),
        }
        if meta:
            message["meta"] = meta
        data["messages"].append(message)
        self._write(session_id, data)

    def load_history(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Return the last `limit` messages."""
        if not self.session_exists(session_id):
            return []
        data = self._read(session_id)
        messages = data.get("messages", [])
        return messages[-limit:]

    def get_history_for_llm(
        self,
        session_id: str,
        limit: int = 20,
        max_messages_before_summary: Optional[int] = None,
    ) -> List[Dict[str, str]]:
        """Return messages as Ollama-compatible dicts with role/content only.

        If the session has more than *max_messages_before_summary* messages,
        older messages are replaced with a cached summary. The summary is
        regenerated only when needed (>= 10 new messages since last summary).
        """
        if not self.session_exists(session_id):
            return []

        data = self._read(session_id)
        messages = data.get("messages", [])
        all_msgs = [{"role": m["role"], "content": m["content"]} for m in messages]
        total = len(all_msgs)

        # Determine threshold – caller param or settings
        if max_messages_before_summary is None:
            try:
                from app.services.settings_service import get_settings_service
                settings = get_settings_service().load()
                max_messages_before_summary = settings.get("session_max_messages_before_summary", 20)
            except Exception:
                max_messages_before_summary = 20

        if max_messages_before_summary is None or total <= max_messages_before_summary:
            return all_msgs[-limit:]

        # Check if we have a cached summary that's still fresh
        cached_summary = data.get("history_summary", "")
        summary_msg_count = data.get("history_summary_msg_count", 0)
        new_since_summary = total - summary_msg_count

        if cached_summary and new_since_summary < 10:
            # Use cached summary + recent messages
            recent = all_msgs[-limit:]
            return [{"role": "system", "content": f"Summary of earlier conversation: {cached_summary}"}] + recent

        # Need to generate a new summary – mark for async summarization
        # Store the messages that need summarization
        older_count = total - limit
        if older_count > 0:
            older_msgs = all_msgs[:older_count]
            summary = self._build_summary_text(older_msgs)
            # Cache it
            data["history_summary"] = summary
            data["history_summary_msg_count"] = total
            self._write(session_id, data)

            recent = all_msgs[-limit:]
            return [{"role": "system", "content": f"Summary of earlier conversation: {summary}"}] + recent

        return all_msgs[-limit:]

    @staticmethod
    def _build_summary_text(messages: List[Dict[str, str]]) -> str:
        """Build a simple extractive summary from older messages.

        This is a synchronous fallback that extracts key points from
        the conversation without calling Ollama. For LLM-based
        summarization, use summarize_history_async().
        """
        parts = []
        for m in messages:
            role = m.get("role", "")
            content = m.get("content", "").strip()
            if role == "user" and content:
                parts.append(f"User: {content[:150]}")
            elif role == "assistant" and content:
                parts.append(f"Assistant: {content[:150]}")
        # Keep at most 10 key exchanges
        return " | ".join(parts[:10])

    async def summarize_history_async(
        self, session_id: str, messages: List[Dict[str, str]]
    ) -> str:
        """Summarize conversation messages using Ollama LLM.

        Returns the summary text. Caches it in the session file.
        """
        from app.services.llm_service import get_llm_service

        llm_svc = get_llm_service()
        conversation = "\n".join(
            f"{m['role']}: {m['content']}" for m in messages
        )
        prompt = (
            "Shrň tuto konverzaci do 3-5 vět. "
            "Zaměř se na klíčová fakta, rozhodnutí a kontext. Buď stručný.\n\n"
            f"{conversation}"
        )
        try:
            reply, _ = await llm_svc.generate(message=prompt, mode="general")
            summary = reply.strip()
        except Exception as exc:
            logger.warning("LLM summarization failed: %s", exc, exc_info=True)
            summary = self._build_summary_text(messages)

        # Cache
        if self.session_exists(session_id):
            data = self._read(session_id)
            data["history_summary"] = summary
            data["history_summary_msg_count"] = len(data.get("messages", []))
            self._write(session_id, data)

        return summary

    # ── Model override ─────────────────────────────────────────

    def set_model_override(self, session_id: str, model: Optional[str]) -> None:
        """Set or clear the session-level model override."""
        if not self.session_exists(session_id):
            return
        data = self._read(session_id)
        if model:
            data["model_override"] = model
        else:
            data.pop("model_override", None)
        self._write(session_id, data)

    def get_model_override(self, session_id: str) -> Optional[str]:
        """Return the session-level model override, or None."""
        if not self.session_exists(session_id):
            return None
        data = self._read(session_id)
        return data.get("model_override")

    # ── Artifact / agent references ───────────────────────────

    def attach_artifact(self, session_id: str, artifact_id: str) -> None:
        if not self.session_exists(session_id):
            return
        data = self._read(session_id)
        if artifact_id not in data.get("artifacts", []):
            data.setdefault("artifacts", []).append(artifact_id)
            self._write(session_id, data)

    def attach_agent(self, session_id: str, agent_id: str) -> None:
        if not self.session_exists(session_id):
            return
        data = self._read(session_id)
        if agent_id not in data.get("active_agents", []):
            data.setdefault("active_agents", []).append(agent_id)
            self._write(session_id, data)

    # ── Session stats & cleanup (4G) ────────────────────────────

    def get_session_stats(self) -> Dict[str, Any]:
        """Return session stats: count, total size, oldest/newest."""
        files = list(SESSIONS_DIR.glob("*.json"))
        if not files:
            return {
                "count": 0,
                "total_size_bytes": 0,
                "oldest_session": None,
                "newest_session": None,
            }
        total_size = sum(f.stat().st_size for f in files)
        sorted_files = sorted(files, key=lambda p: p.stat().st_mtime)
        oldest_mtime = sorted_files[0].stat().st_mtime
        newest_mtime = sorted_files[-1].stat().st_mtime

        return {
            "count": len(files),
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "oldest_session": datetime.fromtimestamp(oldest_mtime, tz=timezone.utc).isoformat(),
            "newest_session": datetime.fromtimestamp(newest_mtime, tz=timezone.utc).isoformat(),
        }

    def cleanup_old_sessions(self, older_than_days: int) -> Dict[str, Any]:
        """Delete sessions older than N days. Returns count of deleted sessions."""
        cutoff = time.time() - (older_than_days * 86400)
        deleted_count = 0
        deleted_ids: List[str] = []
        errors: List[str] = []

        for f in SESSIONS_DIR.glob("*.json"):
            try:
                if f.stat().st_mtime < cutoff:
                    session_id = f.stem
                    f.unlink()
                    deleted_count += 1
                    deleted_ids.append(session_id)
            except Exception as exc:
                errors.append(f"{f.name}: {exc}")
                logger.warning("Failed to delete session %s: %s", f.name, exc)

        if deleted_count > 0:
            logger.info("Cleaned up %d old sessions (older than %d days)", deleted_count, older_than_days)

        return {
            "deleted_count": deleted_count,
            "deleted_ids": deleted_ids,
            "errors": errors,
        }

    def list_sessions_detailed(self) -> List[Dict[str, Any]]:
        """List all sessions with full metadata (created_at, message_count, last_activity)."""
        result = []
        for f in sorted(SESSIONS_DIR.glob("*.json"),
                        key=lambda p: p.stat().st_mtime,
                        reverse=True):
            try:
                data = self._read_raw(f.stem)
                messages = data.get("messages", [])
                last_activity = None
                if messages:
                    last_activity = messages[-1].get("timestamp")
                result.append({
                    "session_id": data.get("session_id", f.stem),
                    "created_at": data.get("created_at", ""),
                    "message_count": len(messages),
                    "last_activity": last_activity or data.get("created_at", ""),
                    "size_bytes": f.stat().st_size,
                })
            except Exception as exc:
                logger.warning("Failed to load session %s: %s", f, exc)
        return result

    # ── Helpers ───────────────────────────────────────────────

    def _path(self, session_id: str) -> Path:
        return SESSIONS_DIR / f"{session_id}.json"

    def _read(self, session_id: str) -> Dict[str, Any]:
        with open(self._path(session_id), "r", encoding="utf-8") as f:
            return json.load(f)

    def _read_raw(self, session_id: str) -> Dict[str, Any]:
        with open(SESSIONS_DIR / f"{session_id}.json", "r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, session_id: str, data: Dict[str, Any]) -> None:
        with open(self._path(session_id), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


_session_service = SessionService()


def get_session_service() -> SessionService:
    return _session_service


async def start_session_auto_cleanup() -> None:
    """Background task for auto-cleanup of old sessions (4G).

    Reads ``session_auto_cleanup_days`` from settings.json.
    If null/missing, auto-cleanup is disabled.
    """
    try:
        from app.services.settings_service import get_settings_service
        settings = get_settings_service().load()
        cleanup_days = settings.get("session_auto_cleanup_days")

        if cleanup_days is None:
            logger.info("Session auto-cleanup disabled (session_auto_cleanup_days not set)")
            return

        cleanup_days = int(cleanup_days)
        logger.info("Session auto-cleanup started: deleting sessions older than %d days", cleanup_days)

        svc = get_session_service()
        result = svc.cleanup_old_sessions(cleanup_days)
        if result["deleted_count"] > 0:
            logger.info("Auto-cleanup removed %d old sessions", result["deleted_count"])

    except asyncio.CancelledError:
        logger.info("Session auto-cleanup cancelled")
    except Exception as exc:
        logger.error("Session auto-cleanup error: %s", exc, exc_info=True)
