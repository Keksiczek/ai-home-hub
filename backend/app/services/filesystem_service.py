"""Filesystem service – secure file operations with whitelist enforcement."""
import asyncio
import fnmatch
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)


class FilesystemService:
    def __init__(self) -> None:
        self._settings = get_settings_service()

    def _cfg(self) -> Dict[str, Any]:
        return self._settings.get_filesystem_config()

    def _allowed_dirs(self) -> List[str]:
        return self._cfg().get("allowed_directories", [])

    def _blacklist_patterns(self) -> List[str]:
        return self._cfg().get("blacklist_patterns", [])

    # ── Security ───────────────────────────────────────────────

    def _assert_allowed(self, path: str) -> Path:
        """Raise PermissionError if `path` is outside the whitelist."""
        p = Path(path).resolve()
        allowed = self._allowed_dirs()

        # If no whitelist configured, reject all (safe default)
        if not allowed:
            raise PermissionError(
                "No allowed_directories configured. "
                "Add directories to the whitelist in Settings → Security."
            )

        for d in allowed:
            try:
                p.relative_to(Path(d).resolve())
                # Path is under this allowed dir – now check blacklist
                for pattern in self._blacklist_patterns():
                    if fnmatch.fnmatch(str(p), f"*{pattern}") or fnmatch.fnmatch(p.name, pattern):
                        raise PermissionError(f"Path matches blacklist pattern: {pattern}")
                return p
            except ValueError:
                continue  # Not under this allowed dir, try next

        raise PermissionError(
            f"Path '{path}' is not in the allowed directories whitelist."
        )

    # ── Read operations ────────────────────────────────────────

    async def read_file(self, path: str, encoding: str = "utf-8") -> str:
        """Read a text file and return its contents."""
        p = self._assert_allowed(path)
        if not p.is_file():
            raise FileNotFoundError(f"Not a file: {path}")

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: p.read_text(encoding=encoding))

    async def list_directory(self, path: str) -> List[Dict[str, Any]]:
        """List directory contents."""
        p = self._assert_allowed(path)
        if not p.is_dir():
            raise NotADirectoryError(f"Not a directory: {path}")

        entries = []
        for item in sorted(p.iterdir()):
            try:
                stat = item.stat()
                entries.append(
                    {
                        "name": item.name,
                        "type": "dir" if item.is_dir() else "file",
                        "size": stat.st_size if item.is_file() else None,
                        "modified": stat.st_mtime,
                        "path": str(item),
                    }
                )
            except PermissionError:
                pass
        return entries

    # ── Write operations ───────────────────────────────────────

    async def write_file(self, path: str, content: str, encoding: str = "utf-8") -> str:
        """Write content to a file (creates it if it doesn't exist)."""
        p = self._assert_allowed(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: p.write_text(content, encoding=encoding))
        return f"Written {len(content)} characters to {path}"

    async def delete_file(self, path: str) -> str:
        """Delete a file."""
        p = self._assert_allowed(path)
        if not p.exists():
            raise FileNotFoundError(f"Not found: {path}")
        if p.is_dir():
            raise IsADirectoryError(f"Use delete_directory for directories: {path}")
        p.unlink()
        return f"Deleted {path}"

    async def create_directory(self, path: str) -> str:
        """Create a directory (and parents)."""
        p = self._assert_allowed(path)
        p.mkdir(parents=True, exist_ok=True)
        return f"Created directory: {path}"

    async def move_file(self, src: str, dst: str) -> str:
        """Move or rename a file."""
        src_p = self._assert_allowed(src)
        dst_p = self._assert_allowed(dst)
        import shutil
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: shutil.move(str(src_p), str(dst_p)))
        return f"Moved {src} → {dst}"

    async def copy_file(self, src: str, dst: str) -> str:
        """Copy a file."""
        src_p = self._assert_allowed(src)
        dst_p = self._assert_allowed(dst)
        import shutil
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: shutil.copy2(str(src_p), str(dst_p)))
        return f"Copied {src} → {dst}"

    # ── Search ─────────────────────────────────────────────────

    async def search_content(
        self,
        path: str,
        pattern: str,
        file_pattern: Optional[str] = None,
        max_results: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Search file contents using ripgrep (rg) if available, else pure-Python fallback.
        """
        p = self._assert_allowed(path)
        try:
            return await self._search_rg(str(p), pattern, file_pattern, max_results)
        except FileNotFoundError:
            return await self._search_python(p, pattern, file_pattern, max_results)

    async def _search_rg(
        self, path: str, pattern: str, file_pattern: Optional[str], max_results: int
    ) -> List[Dict[str, Any]]:
        args = ["rg", "--json", "-m", "5", pattern, path]
        if file_pattern:
            args += ["--glob", file_pattern]

        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=30.0)
        import json

        results = []
        for line in stdout.decode().splitlines():
            try:
                obj = json.loads(line)
                if obj.get("type") == "match":
                    data = obj["data"]
                    results.append(
                        {
                            "file": data["path"]["text"],
                            "line": data["line_number"],
                            "content": data["lines"]["text"].rstrip(),
                        }
                    )
                    if len(results) >= max_results:
                        break
            except Exception:
                pass
        return results

    async def _search_python(
        self, root: Path, pattern: str, file_pattern: Optional[str], max_results: int
    ) -> List[Dict[str, Any]]:
        """Pure-Python grep fallback (no subprocess)."""
        import re

        loop = asyncio.get_event_loop()

        def _do_search():
            results = []
            try:
                compiled = re.compile(pattern)
            except re.error:
                compiled = re.compile(re.escape(pattern))

            for filepath in root.rglob(file_pattern or "*"):
                if not filepath.is_file():
                    continue
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        for i, line in enumerate(f, 1):
                            if compiled.search(line):
                                results.append(
                                    {
                                        "file": str(filepath),
                                        "line": i,
                                        "content": line.rstrip(),
                                    }
                                )
                                if len(results) >= max_results:
                                    return results
                except Exception:
                    pass
            return results

        return await loop.run_in_executor(None, _do_search)

    # ── Info ───────────────────────────────────────────────────

    def get_config(self) -> Dict[str, Any]:
        return self._cfg()

    def is_path_allowed(self, path: str) -> bool:
        try:
            self._assert_allowed(path)
            return True
        except PermissionError:
            return False


_filesystem_service: Optional[FilesystemService] = None


def get_filesystem_service() -> FilesystemService:
    global _filesystem_service
    if _filesystem_service is None:
        _filesystem_service = FilesystemService()
    return _filesystem_service
