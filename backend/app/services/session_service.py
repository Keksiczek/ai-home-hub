"""Session service – persists conversation history as JSON files."""
import json
import logging
import uuid
from datetime import datetime, timezone
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

    def get_history_for_llm(self, session_id: str, limit: int = 20) -> List[Dict[str, str]]:
        """Return messages as Ollama-compatible dicts with role/content only."""
        messages = self.load_history(session_id, limit)
        return [{"role": m["role"], "content": m["content"]} for m in messages]

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
