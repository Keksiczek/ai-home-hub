"""Knowledge base router – external storage scan, ingestion, search, incremental indexing, export."""
import asyncio
import csv
import io
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException

from app.utils.auth import verify_api_key

from app.models.schemas import ReindexFileRequest
from app.services.embeddings_service import get_embeddings_service
from app.services.file_parser_service import get_file_parser_service
from app.services.settings_service import get_settings_service
from app.services.vector_store_service import get_vector_store_service
from app.services.ws_manager import get_ws_manager
from app.utils.constants import DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE, MIN_KB_SEARCH_SCORE
from app.utils.text_chunker import chunk_text

logger = logging.getLogger(__name__)
router = APIRouter()

# ── In-memory job store ───────────────────────────────────────────
# Maps job_id -> IngestJob dict.  Sufficient for single-process deployments;
# replace with Redis/DB for multi-worker setups.

_jobs: Dict[str, Dict[str, Any]] = {}


def _make_job(job_id: str) -> Dict[str, Any]:
    return {
        "job_id": job_id,
        "status": "pending",
        "progress": {"current": 0, "total": 0},
        "result": None,
    }


@router.post("/knowledge/scan", tags=["knowledge"])
async def scan_external_storage(
    paths: Optional[List[str]] = None,
    recursive: bool = True,
) -> Dict[str, Any]:
    """
    Scan external storage paths for files.

    Args:
        paths: Optional list of paths to scan. If None, uses configured paths.
        recursive: Whether to scan subdirectories.

    Returns:
        {discovered_files: [...], total_count: N, errors: [...]}
    """
    settings = get_settings_service().load()
    kb_config = settings.get("knowledge_base", {})

    scan_paths = paths if paths else kb_config.get("external_paths", [])
    if not scan_paths:
        raise HTTPException(
            status_code=400,
            detail="No external paths configured. Add paths in Settings → Knowledge Base.",
        )

    MAX_FILES = 10000

    allowed_exts = set(kb_config.get("allowed_extensions", []))
    discovered: List[Dict[str, Any]] = []
    errors: List[str] = []
    limit_reached = False

    for path_str in scan_paths:
        if limit_reached:
            break

        path = Path(path_str).expanduser()

        if not path.exists():
            errors.append(f"Path not found: {path_str}")
            continue

        if not path.is_dir():
            errors.append(f"Not a directory: {path_str}")
            continue

        try:
            pattern = "**/*" if recursive else "*"
            for file in path.glob(pattern):
                if file.is_file() and file.suffix.lower() in allowed_exts:
                    if len(discovered) >= MAX_FILES:
                        errors.append(
                            f"Limit reached: stopped at {MAX_FILES} files in {path_str}. "
                            "Consider narrowing external paths or use batch scan (coming soon)."
                        )
                        limit_reached = True
                        break
                    discovered.append({
                        "path": str(file),
                        "name": file.name,
                        "size_bytes": file.stat().st_size,
                        "extension": file.suffix.lower(),
                        "modified": file.stat().st_mtime,
                    })
        except Exception as exc:
            errors.append(f"Scan error in {path_str}: {exc}")
            logger.error("Scan error: %s", exc)

    return {
        "discovered_files": discovered,
        "total_count": len(discovered),
        "errors": errors,
        "scanned_paths": scan_paths,
        "warning": f"Results limited to {MAX_FILES:,} files" if limit_reached else None,
    }


@router.get("/knowledge/config", tags=["knowledge"])
async def get_knowledge_config() -> Dict[str, Any]:
    """Get current knowledge base configuration."""
    settings = get_settings_service().load()
    return settings.get("knowledge_base", {})


# ── Ingestion Pipeline ──────────────────────────────────────────


async def _run_ingest_core(
    file_paths: Optional[List[str]],
    job: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Parse → chunk → embed → store.

    If *job* is supplied its ``status`` and ``progress`` fields are updated
    in-place so the polling endpoint can reflect real-time progress.
    """
    parser = get_file_parser_service()
    embeddings_svc = get_embeddings_service()
    vector_store = get_vector_store_service()
    ws_manager = get_ws_manager()

    if file_paths:
        files = [Path(p) for p in file_paths]
    else:
        scan_result = await scan_external_storage()
        files = [Path(f["path"]) for f in scan_result["discovered_files"]]

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

            chunks = chunk_text(text, chunk_size=DEFAULT_CHUNK_SIZE, overlap=DEFAULT_CHUNK_OVERLAP)
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

            vector_store.delete_by_file_path(str(file_path))
            vector_store.add_documents(
                ids=ids,
                embeddings=embs,
                documents=docs,
                metadatas=metadatas,
            )

            ingested_count += 1
            total_chunks += len(valid_items)

            if job is not None:
                job["progress"] = {"current": file_idx + 1, "total": total_files}

            await ws_manager.broadcast({
                "type": "ingest_progress",
                "current": file_idx + 1,
                "total": total_files,
                "file": file_path.name,
                "ingested": ingested_count,
                "chunks": total_chunks,
            })

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


async def _job_ingest(job_id: str, file_paths: Optional[List[str]]) -> None:
    """Background task wrapper: runs ingest and finalises the job record."""
    job = _jobs.get(job_id)
    if job is None:
        return
    try:
        result = await _run_ingest_core(file_paths, job=job)
        job["status"] = "completed"
        job["result"] = result
    except Exception as exc:
        logger.error("Ingest job %s failed: %s", job_id, exc)
        job["status"] = "failed"
        job["result"] = {"error": str(exc)}


@router.post("/knowledge/ingest", tags=["knowledge"])
async def ingest_files(
    background_tasks: BackgroundTasks,
    file_paths: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Start a background ingest job.  Returns ``{job_id, status}`` immediately.

    Poll ``GET /knowledge/ingest-jobs/{job_id}`` for progress.
    """
    job_id = str(uuid.uuid4())
    _jobs[job_id] = _make_job(job_id)
    background_tasks.add_task(_job_ingest, job_id, file_paths)
    return {"job_id": job_id, "status": "pending"}


# ── Semantic Search ──────────────────────────────────────────────


@router.post("/knowledge/search", tags=["knowledge"])
async def search_knowledge(
    query: str,
    top_k: int = 5,
) -> Dict[str, Any]:
    """
    Semantic search in knowledge base.

    Args:
        query: Search query
        top_k: Number of results to return
    """
    embeddings_svc = get_embeddings_service()
    vector_store = get_vector_store_service()

    # Generate query embedding
    query_embedding = await embeddings_svc.generate_embedding(query)
    if not query_embedding:
        raise HTTPException(status_code=500, detail="Failed to generate query embedding")

    # Search vector store
    search_results = vector_store.search(
        query_embedding=query_embedding,
        top_k=top_k,
    )

    # Format results, filter out low-quality matches
    results = []
    for doc, metadata, distance in zip(
        search_results["documents"],
        search_results["metadatas"],
        search_results["distances"],
    ):
        score = round(1 - distance, 4)
        if score < MIN_KB_SEARCH_SCORE:
            continue
        results.append({
            "text": doc,
            "file_name": metadata.get("file_name", ""),
            "file_path": metadata.get("file_path", ""),
            "score": score,
            "metadata": metadata,
        })

    return {
        "results": results,
        "query": query,
    }


# ── Incremental ingestion ────────────────────────────────────────


def get_file_metadata(file_path: str) -> Optional[Dict[str, Any]]:
    """Retrieve stored metadata for a file from its first indexed chunk.

    Returns the metadata dict (which includes ``mtime``) or ``None`` if
    the file has never been indexed.
    """
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


async def _run_incremental_core(
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
                result = await _run_ingest_core([fp])
                if result["ingested_count"] > 0:
                    re_indexed += 1
                else:
                    errors.extend(result["errors"])

        if job is not None:
            job["progress"] = {"current": idx + 1, "total": total}

    return {"skipped_count": skipped_count, "re_indexed": re_indexed, "errors": errors}


async def _job_incremental(job_id: str, file_paths: List[str]) -> None:
    job = _jobs.get(job_id)
    if job is None:
        return
    try:
        result = await _run_incremental_core(file_paths, job=job)
        job["status"] = "completed"
        job["result"] = result
    except Exception as exc:
        logger.error("Incremental job %s failed: %s", job_id, exc)
        job["status"] = "failed"
        job["result"] = {"error": str(exc)}


@router.post("/knowledge/ingest/incremental", tags=["knowledge"])
async def incremental_ingest(
    background_tasks: BackgroundTasks,
    file_paths: List[str] = Body(...),
) -> Dict[str, Any]:
    """Start a background incremental-ingest job.  Returns ``{job_id, status}`` immediately.

    Poll ``GET /knowledge/ingest-jobs/{job_id}`` for progress.
    """
    job_id = str(uuid.uuid4())
    _jobs[job_id] = _make_job(job_id)
    background_tasks.add_task(_job_incremental, job_id, file_paths)
    return {"job_id": job_id, "status": "pending"}


# ── File deletion ────────────────────────────────────────────────


@router.delete("/knowledge/files", tags=["knowledge"],
               dependencies=[Depends(verify_api_key)])
async def delete_kb_file(path: str) -> Dict[str, Any]:
    """
    Remove all indexed chunks for a specific file path.

    Returns HTTP 404 if no chunks are found for the given path.
    """
    vector_store = get_vector_store_service()
    deleted_chunks = vector_store.delete_by_file_path(path)
    if deleted_chunks == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No indexed chunks found for: {path}",
        )
    return {"path": path, "deleted_chunks": deleted_chunks}


# ── Reindex ───────────────────────────────────────────────────────


@router.post("/knowledge/reindex", tags=["knowledge"],
             dependencies=[Depends(verify_api_key)])
async def reindex_file(body: ReindexFileRequest) -> Dict[str, Any]:
    """
    Re-index a single file: delete its existing chunks then re-ingest.

    Useful after the file content has changed on disk.
    Returns the same shape as ingest_files for a single file.
    """
    return await _run_ingest_core(file_paths=[body.file_path])


# ── Stats ────────────────────────────────────────────────────────


@router.get("/knowledge/stats", tags=["knowledge"])
async def get_knowledge_stats(detailed: bool = True) -> Dict[str, Any]:
    """Get knowledge base statistics.

    Args:
        detailed: When ``false``, returns only ``total_chunks`` and
                  ``collection_name`` (fast, no metadata scan).
                  When ``true`` (default), also returns ``total_documents``,
                  ``file_types``, and ``top_sources``.  For collections with
                  more than 50 000 chunks the analysis is based on a sample
                  and a ``warning`` field is included in the response.
    """
    vector_store = get_vector_store_service()
    return vector_store.get_stats(detailed=detailed)


# ── Job polling ───────────────────────────────────────────────────


@router.get("/knowledge/ingest-jobs/{job_id}", tags=["knowledge"])
async def get_ingest_job(job_id: str) -> Dict[str, Any]:
    """Poll the status of an ingest background job.

    Response shape::

        {
          "job_id": "...",
          "status": "pending" | "running" | "completed" | "failed",
          "progress": {"current": int, "total": int},
          "result": { ... } | null
        }
    """
    job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
    return job
