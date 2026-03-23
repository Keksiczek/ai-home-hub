"""File handler service – upload file processing with index / analyze modes.

Wraps file_parser_service and adds:
- Code file support (.py, .js, .ts, ...)
- mode="index"   → extract text + chunks + metadata for KB storage
- mode="analyze" → extract text + LLM short summary (2-3 sentences)
- Unified FileMetadata for all formats
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Literal

logger = logging.getLogger(__name__)

# ── Supported extensions ──────────────────────────────────────────────────────

# Native-parse extensions (delegated to FileParserService)
_PARSER_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".xlsx",
    ".pptx",
    ".txt",
    ".md",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".mp3",
    ".wav",
    ".m4a",
    ".ogg",
    ".mp4",
    ".webm",
    ".mov",
    ".epub",
    ".html",
    ".htm",
    ".zip",
}

# Code / plain-text extensions handled inline
_CODE_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".sh",
    ".bash",
    ".zsh",
    ".css",
    ".sql",
    ".rs",
    ".go",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".rb",
    ".php",
}

SUPPORTED_EXTENSIONS: frozenset[str] = frozenset(_PARSER_EXTENSIONS | _CODE_EXTENSIONS)

# Alias expected by consumers / tests
ALL_SUPPORTED: frozenset[str] = SUPPORTED_EXTENSIONS

_DOCUMENT_EXTENSIONS = frozenset(
    {
        ".pdf",
        ".docx",
        ".xlsx",
        ".pptx",
        ".txt",
        ".md",
        ".html",
        ".htm",
    }
)
_IMAGE_EXTENSIONS = frozenset({".jpg", ".jpeg", ".png", ".gif", ".bmp"})


def get_category(filename: str) -> str:
    """Return a broad category for *filename* based on its extension.

    Returns one of: ``"text"``, ``"document"``, ``"image"``, ``"unsupported"``.
    """
    ext = Path(filename).suffix.lower()
    if ext in _CODE_EXTENSIONS:
        return "text"
    if ext in _DOCUMENT_EXTENSIONS:
        return "document"
    if ext in _IMAGE_EXTENSIONS:
        return "image"
    return "unsupported"


def get_accept_string() -> str:
    """Return a comma-separated string of all supported extensions for use in
    HTML ``accept`` attributes or API documentation."""
    return ",".join(sorted(SUPPORTED_EXTENSIONS))


def is_supported(path: str) -> bool:
    """Return True if the file extension is in SUPPORTED_EXTENSIONS."""
    return Path(path).suffix.lower() in SUPPORTED_EXTENSIONS


# Extension → MIME type mapping (for code / text files not in FileParserService)
_CODE_MIME: Dict[str, str] = {
    ".py": "text/x-python",
    ".js": "text/javascript",
    ".ts": "text/typescript",
    ".jsx": "text/jsx",
    ".tsx": "text/tsx",
    ".json": "application/json",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".toml": "text/toml",
    ".sh": "text/x-shellscript",
    ".bash": "text/x-shellscript",
    ".zsh": "text/x-shellscript",
    ".css": "text/css",
    ".sql": "text/x-sql",
    ".rs": "text/x-rust",
    ".go": "text/x-go",
    ".java": "text/x-java",
    ".c": "text/x-c",
    ".cpp": "text/x-c++",
    ".h": "text/x-c",
    ".rb": "text/x-ruby",
    ".php": "text/x-php",
}


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


def _resolve_media_type(ext: str) -> str:
    """Determine media_type from extension."""
    from app.services.file_parser_service import FileParserService

    return FileParserService.MEDIA_TYPES.get(ext, "text")


def _resolve_mime_type(ext: str) -> str:
    """Determine MIME type from extension."""
    from app.services.file_parser_service import FileParserService

    return FileParserService.MIME_TYPES.get(
        ext, _CODE_MIME.get(ext, "application/octet-stream")
    )


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
                {text, chunks, chunk_count, metadata, page_count, char_count,
                 collection, file_metadata: FileMetadata}
            For ``"analyze"``::
                {text_preview, summary, metadata, page_count, char_count,
                 file_metadata: FileMetadata}
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
        duration_seconds = parsed.get("duration_seconds")
        ext = file_path.suffix.lower()

        if not text:
            return {"error": "No text could be extracted from the file"}

        # Build unified FileMetadata
        from app.models.schemas import FileMetadata

        try:
            size_bytes = file_path.stat().st_size
        except OSError:
            size_bytes = 0

        file_meta = FileMetadata(
            filename=file_path.name,
            filetype=_resolve_mime_type(ext),
            size_bytes=size_bytes,
            indexed_at=datetime.now(timezone.utc),
            collection=collection,
            pages_or_duration=(
                duration_seconds
                if duration_seconds
                else (float(page_count) if page_count else None)
            ),
            language=metadata.get("language"),
            chunk_count=0,  # filled below for index mode
            media_type=_resolve_media_type(ext),
        )

        if mode == "index":
            chunks: List[str] = chunk_text(
                text, chunk_size=DEFAULT_CHUNK_SIZE, overlap=DEFAULT_CHUNK_OVERLAP
            )
            file_meta.chunk_count = len(chunks)
            return {
                "text": text,
                "chunks": chunks,
                "chunk_count": len(chunks),
                "metadata": {
                    **metadata,
                    "collection": collection,
                    "media_type": file_meta.media_type,
                },
                "page_count": page_count,
                "char_count": char_count,
                "collection": collection,
                "file_metadata": file_meta.model_dump(mode="json"),
            }

        # mode == "analyze"
        summary = await _generate_summary(text, file_path.name)
        return {
            "text_preview": text[:1500] + ("..." if len(text) > 1500 else ""),
            "summary": summary,
            "metadata": metadata,
            "page_count": page_count,
            "char_count": char_count,
            "file_metadata": file_meta.model_dump(mode="json"),
        }


# ── Singleton ─────────────────────────────────────────────────────────────────

_file_handler_service: FileHandlerService | None = None


def get_file_handler_service() -> FileHandlerService:
    global _file_handler_service
    if _file_handler_service is None:
        _file_handler_service = FileHandlerService()
    return _file_handler_service
