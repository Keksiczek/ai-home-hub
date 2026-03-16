"""File handler service – centralized EXT→handler mapping for uploads."""
import logging
from pathlib import Path
from typing import Any, Dict, Set

logger = logging.getLogger(__name__)

# ── Extension categories ─────────────────────────────────────
TEXT_EXTENSIONS: Set[str] = {
    ".txt", ".md", ".json", ".py", ".js", ".ts", ".html", ".css",
    ".xml", ".yml", ".yaml", ".csv", ".log", ".sh", ".bash",
    ".toml", ".ini", ".cfg", ".env", ".sql",
}

DOCUMENT_EXTENSIONS: Set[str] = {".pdf", ".docx", ".xlsx"}

IMAGE_EXTENSIONS: Set[str] = {".png", ".jpg", ".jpeg", ".gif", ".bmp"}

ALL_SUPPORTED: Set[str] = TEXT_EXTENSIONS | DOCUMENT_EXTENSIONS | IMAGE_EXTENSIONS

# Human-readable category labels
EXT_CATEGORIES: Dict[str, str] = {}
for _ext in TEXT_EXTENSIONS:
    EXT_CATEGORIES[_ext] = "text"
for _ext in DOCUMENT_EXTENSIONS:
    EXT_CATEGORIES[_ext] = "document"
for _ext in IMAGE_EXTENSIONS:
    EXT_CATEGORIES[_ext] = "image"


def is_supported(filename: str) -> bool:
    """Check whether a filename has a supported extension."""
    return Path(filename).suffix.lower() in ALL_SUPPORTED


def get_category(filename: str) -> str:
    """Return the category for a file ('text', 'document', 'image', or 'unsupported')."""
    ext = Path(filename).suffix.lower()
    return EXT_CATEGORIES.get(ext, "unsupported")


def get_accept_string() -> str:
    """Return a comma-separated string of supported extensions for HTML accept attribute."""
    return ",".join(sorted(ALL_SUPPORTED))


def parse_uploaded_file(file_path: Path) -> Dict[str, Any]:
    """Parse an uploaded file and return text + metadata.

    Delegates to file_parser_service for documents/images,
    reads text files directly for broader extension support.
    """
    ext = file_path.suffix.lower()

    if ext in TEXT_EXTENSIONS and ext not in {".txt", ".md"}:
        # file_parser_service only handles .txt/.md; read others directly
        try:
            text = file_path.read_text(encoding="utf-8", errors="ignore")
            return {
                "text": text,
                "metadata": {"type": "text", "extension": ext},
                "page_count": 1,
            }
        except Exception as exc:
            return {"error": str(exc)}

    if ext in DOCUMENT_EXTENSIONS | IMAGE_EXTENSIONS | {".txt", ".md"}:
        from app.services.file_parser_service import get_file_parser_service
        return get_file_parser_service().parse_file(file_path)

    return {"error": f"Unsupported file type: {ext}"}
