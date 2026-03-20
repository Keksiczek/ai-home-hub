"""Knowledge base router – external storage scan, ingestion, search, incremental indexing, export."""
import asyncio
import csv
import io
import logging
import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, BackgroundTasks, Body, Depends, File, Form, HTTPException, UploadFile

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


# ── File listing ──────────────────────────────────────────────────


@router.get("/knowledge/files", tags=["knowledge"])
async def list_kb_files(
    collection: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """List indexed files with metadata, preview, and chunk counts.

    Groups chunks by ``file_path`` to produce a per-file view.
    Supports filtering by ``collection`` and pagination via ``limit``/``offset``.
    """
    from app.services.file_parser_service import FileParserService

    vector_store = get_vector_store_service()

    # Fetch all chunk metadata (bounded to 50k for safety)
    where_filter = {"collection": collection} if collection else None
    try:
        raw = await asyncio.to_thread(
            vector_store.collection.get,
            limit=50_000,
            include=["metadatas", "documents"],
            where=where_filter,
        )
    except Exception as exc:
        logger.warning("Failed to list KB files: %s", exc)
        return {"files": [], "total": 0}

    metadatas = raw.get("metadatas") or []
    documents = raw.get("documents") or []

    # Group by file_path
    file_map: Dict[str, Dict[str, Any]] = {}
    for idx, meta in enumerate(metadatas):
        fp = meta.get("file_path", "")
        if not fp:
            continue
        if fp not in file_map:
            ext = Path(fp).suffix.lower()
            file_map[fp] = {
                "id": fp,
                "file_path": fp,
                "file_name": meta.get("file_name", Path(fp).name),
                "collection": meta.get("collection", "default"),
                "chunk_count": 0,
                "page_count": meta.get("page_count", 1),
                "media_type": FileParserService.MEDIA_TYPES.get(ext, "text"),
                "filetype": FileParserService.MIME_TYPES.get(ext, "application/octet-stream"),
                "mtime": meta.get("mtime"),
                "preview": "",
                "size_bytes": 0,
            }
            # Try to get file size from disk
            try:
                file_map[fp]["size_bytes"] = Path(fp).stat().st_size
            except OSError:
                pass
        file_map[fp]["chunk_count"] += 1
        # Capture first chunk as preview
        if not file_map[fp]["preview"] and idx < len(documents):
            file_map[fp]["preview"] = (documents[idx] or "")[:500]

    # Sort by mtime descending (newest first)
    all_files = sorted(file_map.values(), key=lambda f: f.get("mtime") or 0, reverse=True)
    total = len(all_files)
    paginated = all_files[offset: offset + limit]

    return {"files": paginated, "total": total}


# ── File deletion ────────────────────────────────────────────────


@router.delete("/knowledge/files/{file_id:path}", tags=["knowledge"],
               dependencies=[Depends(verify_api_key)])
async def delete_kb_file_by_id(file_id: str) -> Dict[str, Any]:
    """Remove all indexed chunks for a file. Also deletes the upload if in data/uploads/kb/."""
    vector_store = get_vector_store_service()
    deleted_chunks = await vector_store.delete_by_file_path(file_id)
    if deleted_chunks == 0:
        raise HTTPException(404, f"No indexed chunks found for: {file_id}")

    # Clean up uploaded file if it's in our uploads directory
    upload_path = Path(file_id)
    if upload_path.exists() and str(_UPLOADS_DIR) in str(upload_path):
        try:
            upload_path.unlink()
            logger.info("Deleted upload file: %s", file_id)
        except OSError as exc:
            logger.warning("Could not delete file %s: %s", file_id, exc)

    return {"file_id": file_id, "deleted_chunks": deleted_chunks}


@router.delete("/knowledge/files", tags=["knowledge"],
               dependencies=[Depends(verify_api_key)])
async def delete_kb_file(path: str) -> Dict[str, Any]:
    """
    Remove all indexed chunks for a specific file path.

    Returns HTTP 404 if no chunks are found for the given path.
    """
    vector_store = get_vector_store_service()
    deleted_chunks = await vector_store.delete_by_file_path(path)
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
    """Get knowledge base statistics (served from cache with Cache-Control).

    Args:
        detailed: When ``false``, falls back to lightweight live query.
                  When ``true`` (default), reads from the stats cache.
    """
    if not detailed:
        vector_store = get_vector_store_service()
        return vector_store.get_stats(detailed=False)

    from app.services.kb_stats_cache import get_cached_stats
    from fastapi.responses import JSONResponse

    stats = get_cached_stats()
    return JSONResponse(
        content=stats,
        headers={"Cache-Control": "max-age=300"},
    )


@router.post("/knowledge/stats/refresh", tags=["knowledge"])
async def refresh_knowledge_stats() -> Dict[str, Any]:
    """Manually trigger a KB stats cache refresh."""
    from app.services.kb_stats_cache import refresh_cache
    import asyncio

    data = await asyncio.get_event_loop().run_in_executor(None, refresh_cache)
    return data


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


# ── Batch upload ──────────────────────────────────────────────────

_UPLOADS_DIR = Path(__file__).parent.parent.parent / "data" / "uploads" / "kb"


async def _job_upload_index(
    job_id: str,
    saved_paths: List[str],
    collection: str,
) -> None:
    """Background task: index uploaded files into KB, storing collection metadata."""
    from app.services.embeddings_service import get_embeddings_service

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
                    ".py", ".js", ".ts", ".jsx", ".tsx", ".json",
                    ".yaml", ".yml", ".toml", ".sh", ".bash", ".zsh",
                    ".html", ".css", ".sql", ".rs", ".go", ".java",
                    ".c", ".cpp", ".h", ".rb", ".php",
                }
                if ext in code_exts:
                    text = file_path.read_text(encoding="utf-8", errors="ignore")
                    parsed = {
                        "text": text,
                        "metadata": {"language": ext.lstrip(".")},
                        "page_count": 1,
                    }
                else:
                    errors.append(f"{file_path.name}: {parsed.get('error', 'parse error')}")
                    failed += 1
                    continue

            text = parsed.get("text", "").strip()
            if not text:
                errors.append(f"{file_path.name}: No text extracted")
                failed += 1
                continue

            chunks = chunk_text(text, chunk_size=DEFAULT_CHUNK_SIZE, overlap=DEFAULT_CHUNK_OVERLAP)
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
            await ws_manager.broadcast({
                "type": "kb_upload_progress",
                "current": idx + 1,
                "total": total,
                "file": file_path.name,
                "ingested": ingested,
            })

    result = {
        "ingested_count": ingested,
        "failed_count": failed,
        "total_chunks": total_chunks,
        "errors": errors,
        "collection": collection,
    }
    job["status"] = "completed" if failed == 0 or ingested > 0 else "failed"
    job["result"] = result


@router.post("/knowledge/upload/batch", tags=["knowledge"])
async def batch_upload(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    mode: str = Form("index"),
    collection: str = Form("default"),
) -> Dict[str, Any]:
    """Upload files directly to the Knowledge Base.

    * ``mode="index"``   → save files to disk, start background indexing job,
                           returns ``{results: [{file, job_id}]}``
    * ``mode="analyze"`` → extract text + LLM summary synchronously,
                           returns ``{results: [{file, preview, summary}]}``

    Supported file types: PDF, DOCX, XLSX, TXT, MD, images (OCR), and
    common code files (PY, JS, TS, …).
    """
    from app.services.file_handler_service import get_file_handler_service, SUPPORTED_EXTENSIONS

    _UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    handler = get_file_handler_service()
    results: List[Dict[str, Any]] = []

    if mode == "index":
        saved_paths: List[str] = []
        for upload in files:
            suffix = Path(upload.filename or "file").suffix.lower()
            if suffix not in SUPPORTED_EXTENSIONS:
                results.append({
                    "file": upload.filename,
                    "error": f"Unsupported file type: {suffix}",
                })
                continue
            dest = _UPLOADS_DIR / f"{uuid.uuid4()}{suffix}"
            try:
                with dest.open("wb") as f:
                    shutil.copyfileobj(upload.file, f)
                saved_paths.append(str(dest))
                results.append({"file": upload.filename, "saved_as": dest.name})
            except Exception as exc:
                results.append({"file": upload.filename, "error": str(exc)})

        if not saved_paths:
            return {"results": results, "job_id": None, "mode": mode}

        job_id = str(uuid.uuid4())
        _jobs[job_id] = _make_job(job_id)
        background_tasks.add_task(_job_upload_index, job_id, saved_paths, collection)

        # Attach job_id to each successfully saved result
        for r in results:
            if "saved_as" in r:
                r["job_id"] = job_id

        return {"results": results, "job_id": job_id, "mode": mode, "collection": collection}

    # mode == "analyze"
    for upload in files:
        suffix = Path(upload.filename or "file").suffix.lower()
        if suffix not in SUPPORTED_EXTENSIONS:
            results.append({
                "file": upload.filename,
                "error": f"Unsupported file type: {suffix}",
            })
            continue

        tmp_path = _UPLOADS_DIR / f"analyze_{uuid.uuid4()}{suffix}"
        try:
            with tmp_path.open("wb") as f:
                shutil.copyfileobj(upload.file, f)

            result = await handler.process_file(str(tmp_path), "analyze")
            results.append({
                "file": upload.filename,
                "preview": result.get("text_preview", ""),
                "summary": result.get("summary", ""),
                "char_count": result.get("char_count", 0),
                "page_count": result.get("page_count", 1),
            })
        except Exception as exc:
            results.append({"file": upload.filename, "error": str(exc)})
        finally:
            # Clean up temp analyze files – not stored permanently
            try:
                tmp_path.unlink(missing_ok=True)
            except Exception:
                pass

    return {"results": results, "mode": mode}


# ── Overview ──────────────────────────────────────────────────────


@router.get("/knowledge/overview", tags=["knowledge"])
async def kb_overview() -> Dict[str, Any]:
    """Return a structured overview of the Knowledge Base.

    Groups documents by ``collection`` metadata field (set during upload/index).
    Documents indexed without an explicit collection are grouped under
    ``"default"``.

    Response::

        {
          "total_documents": int,
          "total_chunks": int,
          "storage_size_mb": float,
          "last_indexed": str | null,
          "collections": [
            {
              "name": str,
              "document_count": int,
              "chunk_count": int,
              "file_types": {".pdf": 3, ...}
            }
          ]
        }
    """
    from app.services.kb_stats_cache import get_cached_stats

    stats = get_cached_stats()

    # Build per-collection breakdown from top_sources metadata
    # (collection stored in chunk metadata, or fall back via vector store scan)
    vector_store = get_vector_store_service()
    collections: Dict[str, Dict[str, Any]] = {}

    try:
        raw = await asyncio.to_thread(
            vector_store.collection.get,
            limit=50_000,
            include=["metadatas"],
        )
        metadatas: List[Dict[str, Any]] = raw.get("metadatas") or []

        for meta in metadatas:
            coll_name = str(meta.get("collection") or "default")
            file_path = meta.get("file_path", "")
            ext = Path(file_path).suffix.lower() if file_path else "unknown"

            if coll_name not in collections:
                collections[coll_name] = {
                    "name": coll_name,
                    "files": set(),
                    "chunk_count": 0,
                    "file_types": {},
                }
            c = collections[coll_name]
            c["chunk_count"] += 1
            c["files"].add(file_path)
            c["file_types"][ext] = c["file_types"].get(ext, 0) + 1

    except Exception as exc:
        logger.warning("Overview metadata scan failed: %s", exc)

    # Serialise (sets → counts)
    coll_list = [
        {
            "name": c["name"],
            "document_count": len(c["files"]),
            "chunk_count": c["chunk_count"],
            "file_types": c["file_types"],
        }
        for c in sorted(collections.values(), key=lambda x: x["name"])
    ]

    return {
        "total_documents": stats.get("total_documents", 0),
        "total_chunks": stats.get("total_chunks", 0),
        "storage_size_mb": stats.get("storage_size_mb", 0.0),
        "last_indexed": stats.get("last_indexed"),
        "cache_age_seconds": stats.get("cache_age_seconds"),
        "collections": coll_list,
    }


# ── Retention policy ──────────────────────────────────────────────


@router.get("/knowledge/retention/config", tags=["knowledge"])
async def get_retention_config() -> Dict[str, Any]:
    """Return current retention configuration from settings."""
    settings_svc = get_settings_service()
    kb_cfg = settings_svc.load().get("knowledge_base", {})
    return {
        "retention_days": kb_cfg.get("retention_days", 30),
        "max_size_gb": kb_cfg.get("max_size_gb", 10),
    }


@router.post("/knowledge/retention/run", tags=["knowledge"],
             dependencies=[Depends(verify_api_key)])
async def run_retention_job() -> Dict[str, Any]:
    """Manually trigger KB retention cleanup (delete old / oversized data)."""
    from app.services.kb_retention_service import run_kb_retention
    result = await run_kb_retention()
    return result


# ── Multi-KB collection management ───────────────────────────────


@router.get("/kb/collections", tags=["knowledge"])
async def list_kb_collections() -> Dict[str, Any]:
    """List all KB collections with name, chunk count, and metadata."""
    vector_store = get_vector_store_service()
    cols = await vector_store.list_collections()
    return {"collections": cols, "count": len(cols)}


@router.post("/kb/collections", tags=["knowledge"])
async def create_kb_collection(body: Dict[str, Any] = Body(default={})) -> Dict[str, Any]:
    """Create a new KB collection.

    Body (all optional)::

        {"name": "powerbi", "description": "DAX & reporting docs", "tags": ["#dax"]}
    """
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="'name' is required")
    description = body.get("description", "")
    tags: List[str] = body.get("tags", [])
    vector_store = get_vector_store_service()
    try:
        result = await vector_store.create_collection(name=name, description=description, tags=tags)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/kb/collections/{name}", tags=["knowledge"],
               dependencies=[Depends(verify_api_key)])
async def delete_kb_collection(name: str) -> Dict[str, Any]:
    """Delete a KB collection by name."""
    vector_store = get_vector_store_service()
    try:
        await vector_store.delete_collection(name)
        return {"name": name, "deleted": True}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/kb/collections/{name}/tags", tags=["knowledge"])
async def add_tags_to_kb_document(
    name: str,
    body: Dict[str, Any] = Body(...),
) -> Dict[str, Any]:
    """Add tags to a specific document in a KB collection.

    Body::

        {"doc_id": "file:/path/to/file.pdf:chunk_0", "tags": ["#lean", "#ci"]}
    """
    doc_id = body.get("doc_id", "").strip()
    tags: List[str] = body.get("tags", [])
    if not doc_id:
        raise HTTPException(status_code=400, detail="'doc_id' is required")
    vector_store = get_vector_store_service()
    try:
        await vector_store.add_tags_to_document(collection=name, doc_id=doc_id, tags=tags)
        return {"collection": name, "doc_id": doc_id, "tags": tags}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/kb/search", tags=["knowledge"])
async def kb_search_with_filters(
    q: str = "",
    collection: Optional[str] = None,
    tag: Optional[str] = None,
    top_k: int = 5,
) -> Dict[str, Any]:
    """Semantic search with optional collection and tag filtering.

    - ``q``         : search query (required unless filtering by tag only)
    - ``collection``: name of the collection to search (default: knowledge_base)
    - ``tag``       : filter results to documents tagged with this value
    - ``top_k``     : max results
    """
    vector_store = get_vector_store_service()

    # Tag-only search (no embedding needed)
    if tag and not q.strip():
        col_name = collection or vector_store.COLLECTION_NAME
        try:
            results = await vector_store.search_by_tag(collection=col_name, tag=tag)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        items = [
            {"text": doc, "metadata": meta, "score": None}
            for doc, meta in zip(results["documents"], results["metadatas"])
        ][:top_k]
        return {"results": items, "query": q, "collection": col_name, "tag": tag}

    # Semantic search
    if not q.strip():
        raise HTTPException(status_code=400, detail="'q' or 'tag' parameter is required")

    embeddings_svc = get_embeddings_service()
    query_embedding = await embeddings_svc.generate_embedding(q)
    if not query_embedding:
        raise HTTPException(status_code=500, detail="Failed to generate query embedding")

    # Use the target collection's ChromaDB collection object
    col_name = collection or vector_store.COLLECTION_NAME
    if col_name == vector_store.COLLECTION_NAME:
        col_obj = vector_store.collection
    else:
        try:
            import asyncio as _asyncio
            col_obj = await _asyncio.to_thread(vector_store.client.get_collection, col_name)
        except Exception:
            raise HTTPException(status_code=404, detail=f"Collection '{col_name}' not found")

    from app.utils.constants import MIN_KB_SEARCH_SCORE
    import time as _time

    # Guard: ChromaDB raises if n_results > collection size or collection is empty
    col_count = await asyncio.to_thread(col_obj.count)
    if col_count == 0:
        return {"results": [], "query": q, "collection": col_name, "tag": tag, "total": 0,
                "message": "Znalostní báze je prázdná – nejprve přidej dokumenty."}

    kwargs: Dict[str, Any] = {
        "query_embeddings": [query_embedding],
        "n_results": min(top_k, col_count),
    }
    try:
        raw = await asyncio.to_thread(col_obj.query, **kwargs)
    except Exception as exc:
        logger.warning("KB search query failed (collection=%s, count=%d): %s", col_name, col_count, exc)
        return {"results": [], "query": q, "collection": col_name, "tag": tag, "total": 0}

    docs = raw["documents"][0] if raw.get("documents") else []
    metas = raw["metadatas"][0] if raw.get("metadatas") else []
    dists = raw["distances"][0] if raw.get("distances") else []

    results = []
    for doc, meta, dist in zip(docs, metas, dists):
        score = round(1 - dist, 4)
        if score < MIN_KB_SEARCH_SCORE:
            continue
        # Apply tag filter post-hoc if needed
        if tag:
            import json as _json
            doc_tags = _json.loads((meta or {}).get("tags", "[]"))
            if tag not in doc_tags:
                continue
        results.append({
            "text": doc,
            "file_name": (meta or {}).get("file_name", ""),
            "file_path": (meta or {}).get("file_path", ""),
            "score": score,
            "metadata": meta,
        })

    return {"results": results, "query": q, "collection": col_name, "tag": tag}

