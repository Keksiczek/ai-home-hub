"""KB Indexing Service – parse, chunk, embed, store pipeline.

Extracted from routers/knowledge.py to separate ingestion logic from HTTP handlers.
"""

import logging
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.services.embeddings_service import get_embeddings_service
from app.services.file_parser_service import get_file_parser_service
from app.services.vector_store_service import get_vector_store_service
from app.services.ws_manager import get_ws_manager
from app.utils.constants import DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE
from app.utils.text_chunker import chunk_text

logger = logging.getLogger(__name__)


# ── In-memory job store ──────────────────────────────────────────
# Maps job_id -> IngestJob dict.  Sufficient for single-process deployments.

_jobs: Dict[str, Dict[str, Any]] = {}


def make_job(job_id: str) -> Dict[str, Any]:
    return {
        "job_id": job_id,
        "status": "pending",
        "progress": {"current": 0, "total": 0},
        "result": None,
    }


def get_ingest_job(job_id: str) -> Optional[Dict[str, Any]]:
    return _jobs.get(job_id)


def create_ingest_job() -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = make_job(job_id)
    return job_id


# ── Core ingest pipeline ────────────────────────────────────────


async def run_ingest_core(
    file_paths: Optional[List[str]],
    scan_fn=None,
    job: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Parse → chunk → embed → store.

    If *job* is supplied its ``status`` and ``progress`` fields are updated
    in-place so the polling endpoint can reflect real-time progress.

    *scan_fn* is called (with no args) when file_paths is None to discover files.
    """
    parser = get_file_parser_service()
    embeddings_svc = get_embeddings_service()
    vector_store = get_vector_store_service()
    ws_manager = get_ws_manager()

    if file_paths:
        files = [Path(p) for p in file_paths]
    elif scan_fn:
        scan_result = await scan_fn()
        files = [Path(f["path"]) for f in scan_result["discovered_files"]]
    else:
        files = []

    parseable_exts = parser.SUPPORTED_EXTENSIONS
    ingested_count = 0
    failed_count = 0
    total_chunks = 0
    errors: List[str] = []
    total_files = len(files)

    if job is not None:
        job["status"] = "running"
        job["progress"] = {"current": 0, "total": total_files}

    for file_idx, file_path in enumerate(files):
        if file_path.suffix.lower() not in parseable_exts:
            continue

        try:
            parsed = parser.parse_file(file_path)
            if "error" in parsed and not parsed.get("text"):
                errors.append(f"{file_path.name}: {parsed['error']}")
                failed_count += 1
                continue

            text = parsed.get("text", "")
            if not text.strip():
                errors.append(f"{file_path.name}: No text extracted")
                failed_count += 1
                continue

            chunks = chunk_text(
                text, chunk_size=DEFAULT_CHUNK_SIZE, overlap=DEFAULT_CHUNK_OVERLAP
            )
            embeddings = await embeddings_svc.generate_embeddings_batch(chunks)

            valid_items = [
                (chunk, emb, idx)
                for idx, (chunk, emb) in enumerate(zip(chunks, embeddings))
                if emb is not None
            ]

            if not valid_items:
                errors.append(f"{file_path.name}: All embeddings failed")
                failed_count += 1
                continue

            ids = [f"file:{file_path}:chunk_{idx}" for _, _, idx in valid_items]
            docs = [chunk for chunk, _, _ in valid_items]
            embs = [emb for _, emb, _ in valid_items]
            metadatas = [
                {
                    "file_path": str(file_path),
                    "file_name": file_path.name,
                    "chunk_index": idx,
                    "page_count": parsed.get("page_count", 1),
                    "mtime": file_path.stat().st_mtime,
                    **parsed.get("metadata", {}),
                }
                for _, _, idx in valid_items
            ]

            await vector_store.delete_by_file_path(str(file_path))
            await vector_store.add_documents(
                ids=ids,
                embeddings=embs,
                documents=docs,
                metadatas=metadatas,
            )

            ingested_count += 1
            total_chunks += len(valid_items)

            if job is not None:
                job["progress"] = {"current": file_idx + 1, "total": total_files}

            await ws_manager.broadcast(
                {
                    "type": "ingest_progress",
                    "current": file_idx + 1,
                    "total": total_files,
                    "file": file_path.name,
                    "ingested": ingested_count,
                    "chunks": total_chunks,
                }
            )

        except Exception as exc:
            logger.error("Failed to ingest %s: %s", file_path, exc)
            errors.append(f"{file_path.name}: {exc}")
            failed_count += 1

    return {
        "ingested_count": ingested_count,
        "failed_count": failed_count,
        "total_chunks": total_chunks,
        "errors": errors,
    }


# ── Background job wrappers ─────────────────────────────────────


async def job_ingest(
    job_id: str, file_paths: Optional[List[str]], scan_fn=None
) -> None:
    """Background task wrapper: runs ingest and finalises the job record."""
    job = _jobs.get(job_id)
    if job is None:
        return
    try:
        result = await run_ingest_core(file_paths, scan_fn=scan_fn, job=job)
        job["status"] = "completed"
        job["result"] = result
    except Exception as exc:
        logger.error("Ingest job %s failed: %s", job_id, exc)
        job["status"] = "failed"
        job["result"] = {"error": str(exc)}


# ── Incremental ingest ──────────────────────────────────────────


def get_file_metadata(file_path: str) -> Optional[Dict[str, Any]]:
    """Retrieve stored metadata for a file from its first indexed chunk."""
    try:
        vector_store = get_vector_store_service()
        results = vector_store.collection.get(
            where={"file_path": file_path},
            limit=1,
        )
        if results and results.get("metadatas"):
            return results["metadatas"][0]
    except Exception as exc:
        logger.warning("Could not retrieve metadata for %s: %s", file_path, exc)
    return None


async def run_incremental_core(
    file_paths: List[str],
    job: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Ingest only files modified since last indexing."""
    skipped_count = 0
    re_indexed = 0
    errors: List[str] = []
    total = len(file_paths)

    if job is not None:
        job["status"] = "running"
        job["progress"] = {"current": 0, "total": total}

    for idx, fp in enumerate(file_paths):
        path = Path(fp)
        if not path.exists():
            errors.append(f"Not found: {fp}")
        else:
            current_mtime = path.stat().st_mtime
            stored = get_file_metadata(fp)

            if stored is not None and stored.get("mtime") == current_mtime:
                skipped_count += 1
            else:
                result = await run_ingest_core([fp])
                if result["ingested_count"] > 0:
                    re_indexed += 1
                else:
                    errors.extend(result["errors"])

        if job is not None:
            job["progress"] = {"current": idx + 1, "total": total}

    return {"skipped_count": skipped_count, "re_indexed": re_indexed, "errors": errors}


async def job_incremental(job_id: str, file_paths: List[str]) -> None:
    job = _jobs.get(job_id)
    if job is None:
        return
    try:
        result = await run_incremental_core(file_paths, job=job)
        job["status"] = "completed"
        job["result"] = result
    except Exception as exc:
        logger.error("Incremental job %s failed: %s", job_id, exc)
        job["status"] = "failed"
        job["result"] = {"error": str(exc)}


# ── Upload + index ──────────────────────────────────────────────


UPLOADS_DIR = Path(__file__).parent.parent.parent / "data" / "uploads" / "kb"


async def job_upload_index(
    job_id: str,
    saved_paths: List[str],
    collection: str,
) -> None:
    """Background task: index uploaded files into KB, storing collection metadata."""
    job = _jobs.get(job_id)
    if job is None:
        return

    embeddings_svc = get_embeddings_service()
    vector_store = get_vector_store_service()
    ws_manager = get_ws_manager()

    total = len(saved_paths)
    job["status"] = "running"
    job["progress"] = {"current": 0, "total": total}

    ingested = 0
    failed = 0
    total_chunks = 0
    errors: List[str] = []

    for idx, fpath in enumerate(saved_paths):
        file_path = Path(fpath)
        try:
            parsed = get_file_parser_service().parse_file(file_path)
            # Fallback for code extensions not handled by file_parser_service
            if parsed.get("error") and not parsed.get("text"):
                ext = file_path.suffix.lower()
                code_exts = {
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
                    ".html",
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
                if ext in code_exts:
                    text = file_path.read_text(encoding="utf-8", errors="ignore")
                    parsed = {
                        "text": text,
                        "metadata": {"language": ext.lstrip(".")},
                        "page_count": 1,
                    }
                else:
                    errors.append(
                        f"{file_path.name}: {parsed.get('error', 'parse error')}"
                    )
                    failed += 1
                    continue

            text = parsed.get("text", "").strip()
            if not text:
                errors.append(f"{file_path.name}: No text extracted")
                failed += 1
                continue

            chunks = chunk_text(
                text, chunk_size=DEFAULT_CHUNK_SIZE, overlap=DEFAULT_CHUNK_OVERLAP
            )
            embeddings = await embeddings_svc.generate_embeddings_batch(chunks)

            valid_items = [
                (chunk, emb, i)
                for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
                if emb is not None
            ]
            if not valid_items:
                errors.append(f"{file_path.name}: All embeddings failed")
                failed += 1
                continue

            ids = [f"file:{file_path}:chunk_{i}" for _, _, i in valid_items]
            docs = [c for c, _, _ in valid_items]
            embs = [e for _, e, _ in valid_items]
            metadatas = [
                {
                    "file_path": str(file_path),
                    "file_name": file_path.name,
                    "chunk_index": i,
                    "page_count": parsed.get("page_count", 1),
                    "mtime": file_path.stat().st_mtime,
                    "collection": collection,
                    **{k: v for k, v in parsed.get("metadata", {}).items()},
                }
                for _, _, i in valid_items
            ]

            await vector_store.delete_by_file_path(str(file_path))
            await vector_store.add_documents(
                ids=ids,
                embeddings=embs,
                documents=docs,
                metadatas=metadatas,
            )

            ingested += 1
            total_chunks += len(valid_items)
        except Exception as exc:
            logger.error("Failed to index uploaded file %s: %s", file_path, exc)
            errors.append(f"{file_path.name}: {exc}")
            failed += 1
        finally:
            job["progress"] = {"current": idx + 1, "total": total}
            await ws_manager.broadcast(
                {
                    "type": "kb_upload_progress",
                    "current": idx + 1,
                    "total": total,
                    "file": file_path.name,
                    "ingested": ingested,
                }
            )

    result = {
        "ingested_count": ingested,
        "failed_count": failed,
        "total_chunks": total_chunks,
        "errors": errors,
        "collection": collection,
    }
    job["status"] = "completed" if failed == 0 or ingested > 0 else "failed"
    job["result"] = result
