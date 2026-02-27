"""File parser service – extract text from various file formats."""
import logging
from pathlib import Path
from typing import Any, Dict

logger = logging.getLogger(__name__)


class FileParserService:
    """Parse text content from various file formats."""

    SUPPORTED_EXTENSIONS = {
        ".pdf", ".docx", ".xlsx", ".txt", ".md",
        ".jpg", ".jpeg", ".png",  # For future OCR
    }

    def parse_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Parse file and extract text content.

        Returns:
            {
                'text': str,
                'metadata': dict,
                'page_count': int,
                'error': str,        # only present on failure
            }
        """
        if not file_path.exists():
            return {"error": f"File not found: {file_path}"}

        ext = file_path.suffix.lower()

        try:
            if ext == ".pdf":
                return self._parse_pdf(file_path)
            elif ext == ".docx":
                return self._parse_docx(file_path)
            elif ext == ".xlsx":
                return self._parse_xlsx(file_path)
            elif ext in {".txt", ".md"}:
                return self._parse_text(file_path)
            elif ext in {".jpg", ".jpeg", ".png"}:
                return self._parse_image(file_path)
            else:
                return {"error": f"Unsupported file type: {ext}"}

        except Exception as exc:
            logger.error("Failed to parse %s: %s", file_path, exc)
            return {"error": str(exc)}

    # ── PDF ──────────────────────────────────────────────────────

    def _parse_pdf(self, file_path: Path) -> Dict[str, Any]:
        import PyPDF2

        text_parts = []
        metadata: Dict[str, Any] = {}

        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            page_count = len(reader.pages)

            if reader.metadata:
                metadata = {
                    "author": reader.metadata.get("/Author", ""),
                    "title": reader.metadata.get("/Title", ""),
                    "created": reader.metadata.get("/CreationDate", ""),
                }

            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

        return {
            "text": "\n\n".join(text_parts),
            "metadata": metadata,
            "page_count": page_count,
        }

    # ── DOCX ─────────────────────────────────────────────────────

    def _parse_docx(self, file_path: Path) -> Dict[str, Any]:
        import docx

        doc = docx.Document(file_path)

        text_parts = [para.text for para in doc.paragraphs if para.text.strip()]

        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text for cell in row.cells)
                if row_text.strip():
                    text_parts.append(row_text)

        metadata: Dict[str, Any] = {}
        if doc.core_properties:
            metadata = {
                "author": doc.core_properties.author or "",
                "title": doc.core_properties.title or "",
                "created": str(doc.core_properties.created) if doc.core_properties.created else "",
            }

        return {
            "text": "\n\n".join(text_parts),
            "metadata": metadata,
            "page_count": len(doc.sections),
        }

    # ── XLSX ─────────────────────────────────────────────────────

    def _parse_xlsx(self, file_path: Path) -> Dict[str, Any]:
        import openpyxl

        wb = openpyxl.load_workbook(file_path, data_only=True)
        text_parts = []

        for sheet_name in wb.sheetnames:
            sheet = wb[sheet_name]
            text_parts.append(f"=== Sheet: {sheet_name} ===")

            for row in sheet.iter_rows(values_only=True):
                row_text = " | ".join(
                    str(cell) if cell is not None else "" for cell in row
                )
                if row_text.strip():
                    text_parts.append(row_text)

        metadata = {
            "sheets": wb.sheetnames,
            "sheet_count": len(wb.sheetnames),
        }

        return {
            "text": "\n".join(text_parts),
            "metadata": metadata,
            "page_count": len(wb.sheetnames),
        }

    # ── TXT / MD ─────────────────────────────────────────────────

    def _parse_text(self, file_path: Path) -> Dict[str, Any]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

        return {
            "text": text,
            "metadata": {},
            "page_count": 1,
        }

    # ── Images (placeholder for future OCR) ──────────────────────

    def _parse_image(self, file_path: Path) -> Dict[str, Any]:
        from PIL import Image

        img = Image.open(file_path)

        return {
            "text": f"[Image: {file_path.name}, {img.size[0]}x{img.size[1]}]",
            "metadata": {
                "format": img.format,
                "size": img.size,
                "mode": img.mode,
            },
            "page_count": 1,
            "error": "OCR not implemented yet. Install pytesseract for text extraction.",
        }


# Singleton
_file_parser_service = None


def get_file_parser_service() -> FileParserService:
    global _file_parser_service
    if _file_parser_service is None:
        _file_parser_service = FileParserService()
    return _file_parser_service
