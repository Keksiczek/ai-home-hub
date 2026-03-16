"""File handler service – upload file processing with index / analyze modes.

Wraps file_parser_service and adds:
- Code file support (.py, .js, .ts, ...)
- mode="index"   → extract text + chunks + metadata for KB storage
- mode="analyze" → extract text + LLM short summary (2-3 sentences)
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, List, Literal

logger = logging.getLogger(__name__)

# ── Supported extensions ──────────────────────────────────────────────────────

# Native-parse extensions (delegated to FileParserService)
_PARSER_EXTENSIONS = {
    ".pdf", ".docx", ".xlsx",
    ".txt", ".md",
    ".jpg", ".jpeg", ".png", ".gif", ".bmp",
}

# Code / plain-text extensions handled inline
_CODE_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx",
    ".json", ".yaml", ".yml", ".toml",
    ".sh", ".bash", ".zsh",
    ".html", ".css", ".sql",
    ".rs", ".go", ".java", ".c", ".cpp", ".h",
    ".rb", ".php",
}

SUPPORTED_EXTENSIONS: frozenset[str] = frozenset(_PARSER_EXTENSIONS | _CODE_EXTENSIONS)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _parse_file(file_path: Path) -> Dict[str, Any]:
    """Parse a file to raw text using the appropriate method."""
    ext = file_path.suffix.lower()

    if ext in _CODE_EXTENSIONS:
        try:
            text = file_path.read_text(encoding="utf-8", errors="ignore")
            return {
                "text": text,
                "metadata": {"language": ext.lstrip(".")},
                "page_count": 1,
            }
        except Exception as exc:
            logger.error("Failed to read code file %s: %s", file_path, exc)
            return {"error": str(exc), "text": ""}

    from app.services.file_parser_service import get_file_parser_service
    return get_file_parser_service().parse_file(file_path)


async def _generate_summary(text: str, filename: str) -> str:
    """Generate a 2-3 sentence LLM summary; falls back to text excerpt on error."""
    try:
        from app.services.llm_service import get_llm_service
        llm = get_llm_service()
        excerpt = text[:3000]
        prompt = (
            f"Stručně shrň obsah dokumentu '{filename}' v 2–3 větách česky. "
            f"Obsah:\n\n{excerpt}"
        )
        reply, _ = await llm.generate(prompt, mode="summarize", profile="summarize")
        return reply.strip() or _fallback_summary(text)
    except Exception as exc:
        logger.warning("LLM summary failed for %s: %s", filename, exc)
        return _fallback_summary(text)


def _fallback_summary(text: str) -> str:
    excerpt = text[:300].strip()
    return (excerpt + "...") if len(text) > 300 else excerpt


# ── Service class ─────────────────────────────────────────────────────────────

class FileHandlerService:
    """Process uploaded files for Knowledge Base operations."""

    @staticmethod
    def is_supported(path: str) -> bool:
        """Return True if the file extension is supported."""
        return Path(path).suffix.lower() in SUPPORTED_EXTENSIONS

    @staticmethod
    async def process_file(
        path: str,
        mode: Literal["index", "analyze"],
        collection: str = "default",
    ) -> Dict[str, Any]:
        """Process a file for KB indexing or analysis.

        Args:
            path: Absolute path to the file on disk.
            mode: ``"index"`` → text + chunks + metadata ready for KB storage;
                  ``"analyze"`` → text preview + LLM summary.
            collection: Logical collection name stored in chunk metadata.

        Returns:
            For ``"index"``::
                {text, chunks: List[str], chunk_count, metadata, page_count, char_count, collection}
            For ``"analyze"``::
                {text_preview, summary, metadata, page_count, char_count}
        """
        from app.utils.text_chunker import chunk_text
        from app.utils.constants import DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP

        file_path = Path(path)
        if not file_path.exists():
            return {"error": f"File not found: {path}"}

        parsed = _parse_file(file_path)
        if "error" in parsed and not parsed.get("text"):
            return {"error": parsed["error"]}

        text = parsed.get("text", "").strip()
        metadata = parsed.get("metadata", {})
        page_count = parsed.get("page_count", 1)
        char_count = len(text)

        if not text:
            return {"error": "No text could be extracted from the file"}

        if mode == "index":
            chunks: List[str] = chunk_text(
                text, chunk_size=DEFAULT_CHUNK_SIZE, overlap=DEFAULT_CHUNK_OVERLAP
            )
            return {
                "text": text,
                "chunks": chunks,
                "chunk_count": len(chunks),
                "metadata": {**metadata, "collection": collection},
                "page_count": page_count,
                "char_count": char_count,
                "collection": collection,
            }

        # mode == "analyze"
        summary = await _generate_summary(text, file_path.name)
        return {
            "text_preview": text[:1500] + ("..." if len(text) > 1500 else ""),
            "summary": summary,
            "metadata": metadata,
            "page_count": page_count,
            "char_count": char_count,
        }


# ── Singleton ─────────────────────────────────────────────────────────────────

_file_handler_service: FileHandlerService | None = None


def get_file_handler_service() -> FileHandlerService:
    global _file_handler_service
    if _file_handler_service is None:
        _file_handler_service = FileHandlerService()
    return _file_handler_service
