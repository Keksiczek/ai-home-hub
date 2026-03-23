"""Knowledge service – KB initialization from external sources + job result storage.

// KB INITIALIZATION
Supports three source types:
  - github_repo: Fetch raw files from GitHub API
  - local_path: Recursively read local files matching globs
  - url: Fetch and parse HTML pages
"""

import asyncio
import fnmatch
import logging
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

from app.services.embeddings_service import get_embeddings_service
from app.services.vector_store_service import get_vector_store_service
from app.utils.text_chunker import chunk_text
from app.utils.constants import DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP

logger = logging.getLogger(__name__)

# Maximum file size to ingest (1 MB)
_MAX_FILE_SIZE = 1_000_000


# ── Source fetchers ──────────────────────────────────────────────


async def _fetch_github_files(source: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Fetch raw files from a GitHub repo via the raw.githubusercontent.com CDN."""
    url = source.get("url", "")
    paths = source.get("paths", [])
    if not url or not paths:
        return []

    # Extract owner/repo from GitHub URL
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", url)
    if not match:
        logger.warning("Invalid GitHub URL: %s", url)
        return []

    owner, repo = match.group(1), match.group(2)
    results: List[Dict[str, Any]] = []

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        for file_path in paths:
            file_path = file_path.lstrip("/")
            raw_url = (
                f"https://raw.githubusercontent.com/{owner}/{repo}/main/{file_path}"
            )
            try:
                resp = await client.get(raw_url)
                if resp.status_code == 404:
                    # Try master branch
                    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/master/{file_path}"
                    resp = await client.get(raw_url)
                resp.raise_for_status()
                text = resp.text
                if len(text) > _MAX_FILE_SIZE:
                    text = text[:_MAX_FILE_SIZE]
                results.append(
                    {
                        "text": text,
                        "source": f"github_{repo}_{Path(file_path).name}",
                        "path": f"/{file_path}",
                        "type": "documentation",
                        "file_name": Path(file_path).name,
                    }
                )
            except Exception as exc:
                logger.warning("Failed to fetch %s from GitHub: %s", file_path, exc)

    return results


async def _fetch_local_files(source: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Read local files matching include/exclude glob patterns."""
    base_path = Path(source.get("path", "")).expanduser()
    include_patterns = source.get("include", ["*.md", "*.txt"])
    exclude_patterns = source.get("exclude", [])

    if not base_path.exists() or not base_path.is_dir():
        logger.warning("Local path not found or not a directory: %s", base_path)
        return []

    results: List[Dict[str, Any]] = []
    for pattern in include_patterns:
        for file_path in base_path.rglob(pattern):
            if not file_path.is_file():
                continue
            # Check excludes
            rel = str(file_path.relative_to(base_path))
            if any(fnmatch.fnmatch(rel, ex) for ex in exclude_patterns):
                continue
            try:
                text = file_path.read_text(encoding="utf-8", errors="ignore")
                if len(text) > _MAX_FILE_SIZE:
                    text = text[:_MAX_FILE_SIZE]
                if not text.strip():
                    continue
                results.append(
                    {
                        "text": text,
                        "source": f"local_{file_path.name}",
                        "path": str(file_path),
                        "type": "documentation",
                        "file_name": file_path.name,
                    }
                )
            except Exception as exc:
                logger.warning("Failed to read local file %s: %s", file_path, exc)

    return results


async def _fetch_urls(source: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Fetch and extract text from URLs (basic HTML → text conversion)."""
    urls = source.get("urls", [])
    results: List[Dict[str, Any]] = []

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        for url in urls:
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                content = resp.text

                # Basic HTML to text: strip tags
                text = re.sub(
                    r"<script[^>]*>.*?</script>",
                    "",
                    content,
                    flags=re.DOTALL | re.IGNORECASE,
                )
                text = re.sub(
                    r"<style[^>]*>.*?</style>",
                    "",
                    text,
                    flags=re.DOTALL | re.IGNORECASE,
                )
                text = re.sub(r"<[^>]+>", " ", text)
                text = re.sub(r"\s+", " ", text).strip()

                if len(text) > _MAX_FILE_SIZE:
                    text = text[:_MAX_FILE_SIZE]
                if not text.strip():
                    continue

                # Derive a short name from URL
                name = url.rstrip("/").split("/")[-1] or "page"
                results.append(
                    {
                        "text": text,
                        "source": f"url_{name}",
                        "path": url,
                        "type": "web_content",
                        "file_name": name,
                    }
                )
            except Exception as exc:
                logger.warning("Failed to fetch URL %s: %s", url, exc)

    return results


_SOURCE_FETCHERS = {
    "github_repo": _fetch_github_files,
    "local_path": _fetch_local_files,
    "url": _fetch_urls,
}


# ── KB initialization ────────────────────────────────────────────


async def initialize_kb(
    sources: List[Dict[str, Any]], collection: str = "knowledge_base"
) -> Dict[str, Any]:
    """Fetch content from all sources, chunk, embed, and store in KB.

    Returns summary with chunks_added, collections used, and biggest file.
    """
    embeddings_svc = get_embeddings_service()
    vector_store = get_vector_store_service()

    all_files: List[Dict[str, Any]] = []
    errors: List[str] = []

    # 1. Fetch from all sources concurrently
    tasks = []
    for source in sources:
        src_type = source.get("type", "")
        fetcher = _SOURCE_FETCHERS.get(src_type)
        if fetcher is None:
            errors.append(f"Unknown source type: {src_type}")
            continue
        tasks.append(fetcher(source))

    fetched_groups = await asyncio.gather(*tasks, return_exceptions=True)
    for result in fetched_groups:
        if isinstance(result, Exception):
            errors.append(str(result))
        else:
            all_files.extend(result)

    if not all_files:
        return {
            "status": "empty",
            "chunks_added": 0,
            "files_processed": 0,
            "errors": errors,
        }

    # 2. Chunk and embed each file
    total_chunks = 0
    file_chunk_counts: Dict[str, int] = {}
    now_iso = datetime.now(timezone.utc).isoformat()

    for file_data in all_files:
        text = file_data["text"]
        file_name = file_data["file_name"]

        chunks = chunk_text(
            text, chunk_size=DEFAULT_CHUNK_SIZE, overlap=DEFAULT_CHUNK_OVERLAP
        )
        if not chunks:
            continue

        embeddings = await embeddings_svc.generate_embeddings_batch(chunks)
        valid_items = [
            (chunk, emb, idx)
            for idx, (chunk, emb) in enumerate(zip(chunks, embeddings))
            if emb is not None
        ]
        if not valid_items:
            errors.append(f"{file_name}: All embeddings failed")
            continue

        ids = [
            f"kb_init:{file_data['source']}:chunk_{idx}" for _, _, idx in valid_items
        ]
        docs = [chunk for chunk, _, _ in valid_items]
        embs = [emb for _, emb, _ in valid_items]
        metadatas = [
            {
                "source": file_data["source"],
                "path": file_data["path"],
                "type": file_data["type"],
                "file_name": file_name,
                "file_path": file_data["path"],
                "chunk_index": idx,
                "created": now_iso,
                "collection": collection,
                "init_source": "kb_initialize",
            }
            for _, _, idx in valid_items
        ]

        await vector_store.add_documents(
            ids=ids, embeddings=embs, documents=docs, metadatas=metadatas
        )
        chunk_count = len(valid_items)
        total_chunks += chunk_count
        file_chunk_counts[file_name] = chunk_count

    # Find biggest file
    biggest = ""
    if file_chunk_counts:
        biggest_name = max(file_chunk_counts, key=file_chunk_counts.get)
        biggest = f"{biggest_name} ({file_chunk_counts[biggest_name]} chunks)"

    return {
        "status": "initialized",
        "chunks_added": total_chunks,
        "files_processed": len(file_chunk_counts),
        "collections": [collection],
        "biggest_file": biggest,
        "errors": errors,
    }


# ── Job result storage ───────────────────────────────────────────


async def store_job_result(
    job_id: str,
    job_type: str,
    status: str,
    output: Any,
    execution_time: Optional[float] = None,
    model_used: Optional[str] = None,
    action: Optional[str] = None,
    collection: str = "knowledge_base",
) -> bool:
    """Store a job result as a searchable document in the KB.

    // KB INITIALIZATION – job outputs stored automatically
    """
    embeddings_svc = get_embeddings_service()
    vector_store = get_vector_store_service()

    # Build a text representation of the job result
    output_text = output if isinstance(output, str) else str(output)
    if not output_text.strip():
        return False

    # Truncate very long outputs
    if len(output_text) > _MAX_FILE_SIZE:
        output_text = output_text[:_MAX_FILE_SIZE] + "\n...[truncated]"

    summary = f"Job {job_id} ({job_type}): {status}"
    if action:
        summary += f" | action: {action}"
    doc_text = f"{summary}\n\n{output_text}"

    # Generate embedding
    embedding = await embeddings_svc.generate_embedding(doc_text[:2000])
    if embedding is None:
        logger.warning("Failed to generate embedding for job result %s", job_id)
        return False

    doc_id = f"job_result:{job_id}"
    now_iso = datetime.now(timezone.utc).isoformat()

    metadata = {
        "type": "job_result",
        "job_type": job_type,
        "job_id": job_id,
        "status": status,
        "action": action or "",
        "execution_time_s": round(execution_time, 2) if execution_time else 0.0,
        "model_used": model_used or "",
        "timestamp": now_iso,
        "collection": collection,
        "file_name": f"job_{job_id[:8]}",
        "file_path": f"job_results/{job_id}",
    }

    try:
        await vector_store.add_documents(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[doc_text],
            metadatas=[metadata],
        )
        logger.info("Stored job result in KB: %s (%s)", job_id, job_type)
        return True
    except Exception as exc:
        logger.error("Failed to store job result in KB: %s", exc)
        return False


# ── Singleton ────────────────────────────────────────────────────


class KnowledgeService:
    """Facade for KB initialization and job result storage."""

    async def initialize(
        self, sources: List[Dict[str, Any]], collection: str = "knowledge_base"
    ) -> Dict[str, Any]:
        return await initialize_kb(sources, collection)

    async def store_job_result(self, **kwargs) -> bool:
        return await store_job_result(**kwargs)


_knowledge_service: Optional[KnowledgeService] = None


def get_knowledge_service() -> KnowledgeService:
    global _knowledge_service
    if _knowledge_service is None:
        _knowledge_service = KnowledgeService()
    return _knowledge_service
