"""Setup service – first-run checks and completion tracking."""
import logging
from typing import Any, Dict

import httpx

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class SetupService:
    """Provides first-run status checks and setup completion tracking."""

    async def get_status(self) -> Dict[str, Any]:
        """Run all environment checks and return structured status."""
        svc = get_settings_service()
        settings = svc.load()

        completed = settings.get("setup", {}).get("completed", False)
        ollama_url = settings.get("llm", {}).get("ollama_url", "http://localhost:11434").rstrip("/")

        # ── 1. Ollama running ─────────────────────────────────
        ollama_ok, ollama_msg = await self._check_ollama(ollama_url)

        # ── 2. Required models ────────────────────────────────
        required = ["llama3.2"]
        if ollama_ok:
            missing_models = await self._check_models(ollama_url, required)
        else:
            missing_models = required
        models_ok = len(missing_models) == 0
        models_msg = "Všechny modely jsou dostupné" if models_ok else f"Chybí: {', '.join(missing_models)}"

        # ── 3. ChromaDB writable ──────────────────────────────
        chroma_ok, chroma_msg = self._check_chromadb()

        # ── 4. Filesystem dirs ────────────────────────────────
        allowed = settings.get("filesystem", {}).get("allowed_directories", [])
        fs_ok = bool(allowed)
        fs_msg = f"Nakonfigurováno {len(allowed)} adresářů" if fs_ok else "Žádné adresáře nejsou nastaveny"

        first_run = not completed

        return {
            "completed": completed,
            "first_run": first_run,
            "checks": {
                "ollama_running": {"ok": ollama_ok, "message": ollama_msg},
                "required_models": {
                    "ok": models_ok,
                    "message": models_msg,
                    "missing": missing_models,
                },
                "chromadb_writable": {"ok": chroma_ok, "message": chroma_msg},
                "filesystem_dirs": {"ok": fs_ok, "message": fs_msg},
            },
        }

    async def complete_setup(self) -> None:
        """Mark setup as completed in settings."""
        svc = get_settings_service()
        svc.update({"setup": {"completed": True}})

    # ─────────────────────────── helpers ────────────────────────────

    async def _check_ollama(self, ollama_url: str) -> tuple[bool, str]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{ollama_url}/api/tags")
                if resp.status_code == 200:
                    return True, "Ollama odpovídá"
                return False, f"Ollama vrátila status {resp.status_code}"
        except Exception as exc:
            return False, f"Ollama nedostupná: {exc}"

    async def _check_models(self, ollama_url: str, required: list[str]) -> list[str]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{ollama_url}/api/tags")
                if resp.status_code != 200:
                    return required
                data = resp.json()
                available = {m.get("name", "").split(":")[0] for m in data.get("models", [])}
                return [r for r in required if r.split(":")[0] not in available]
        except Exception:
            return required

    def _check_chromadb(self) -> tuple[bool, str]:
        try:
            from app.services.vector_store_service import get_vector_store_service
            vs = get_vector_store_service()
            vs.get_stats()
            return True, "ChromaDB je dostupná"
        except Exception as exc:
            return False, f"ChromaDB nedostupná: {exc}"


_setup_service = SetupService()


def get_setup_service() -> SetupService:
    return _setup_service
