"""Knowledge base router – thin endpoint handlers delegating to service modules."""

import logging
import shutil
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.models.schemas import ReindexFileRequest
from app.services.embeddings_service import get_embeddings_service
from app.services.settings_service import get_settings_service
from app.services.vector_store_service import get_vector_store_service
from app.utils.auth import verify_api_key

logger = logging.getLogger(__name__)
router = APIRouter()


# ── KB Rebuild (dimension mismatch fix) ─────────────────────────


@router.post("/kb/rebuild", tags=["knowledge"], dependencies=[Depends(verify_api_key)])
async def rebuild_kb_collection() -> Dict[str, Any]:
    """Drop and recreate the default KB ChromaDB collection.

    Use when embedding dimension has changed (e.g. switched embedding model)
    and the existing collection has incompatible vectors.
    """
    vs = get_vector_store_service()
    emb_svc = get_embeddings_service()

    # Detect current embedding dimension
    new_dim = emb_svc.get_embedding_dim()
    if new_dim is None:
        # Probe to detect dimension
        probe = await emb_svc.generate_embedding("dimension probe")
        if probe is not None:
            new_dim = len(probe)
        else:
            raise HTTPException(
                status_code=503,
                detail="Embedding model unavailable – cannot determine target dimension",
            )

    # Read old dimension from collection metadata
    old_dim = None
    try:
        col_meta = vs.collection.metadata or {}
        stored = col_meta.get("embedding_dim")
        if stored is not None:
            old_dim = int(stored)
    except Exception:
        pass

    # If no stored dim, try to peek at existing vectors
    if old_dim is None:
        try:
            peek = vs.collection.peek(limit=1)
            if peek and peek.get("embeddings") and peek["embeddings"][0]:
                old_dim = len(peek["embeddings"][0])
        except Exception:
            pass

    old_dim = old_dim or 0
    col_name = vs.COLLECTION_NAME

    try:
        import asyncio

        await asyncio.to_thread(vs.client.delete_collection, col_name)
        vs.collection = await asyncio.to_thread(
            vs.client.get_or_create_collection,
            col_name,
            metadata={"hnsw:space": "cosine", "embedding_dim": new_dim},
        )
        emb_svc.clear_cache()
        logger.warning(
            "KB collection '%s' rebuilt: old_dim=%d, new_dim=%d",
            col_name,
            old_dim,
            new_dim,
        )
        return {
            "status": "rebuilt",
            "collection": col_name,
            "old_dim": old_dim,
            "new_dim": new_dim,
        }
    except Exception as exc:
        logger.error("KB rebuild failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"KB rebuild failed: {exc}")


# ── KB Initialization ────────────────────────────────────────────


@router.post("/kb/initialize", tags=["knowledge"])
async def initialize_knowledge_base(body: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """Initialize KB from external sources (GitHub repos, local paths, URLs)."""
    from app.services.knowledge_service import get_knowledge_service

    sources = body.get("sources", [])
    if not sources:
        raise HTTPException(
            status_code=400, detail="'sources' list is required and must not be empty"
        )

    collection = body.get("collection", "knowledge_base")
    try:
        return await get_knowledge_service().initialize(
            sources=sources, collection=collection
        )
    except Exception as exc:
        logger.error("KB initialization failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"KB initialization failed: {exc}")


@router.get("/kb/stats", tags=["knowledge"])
async def get_kb_stats() -> Dict[str, Any]:
    """Quick KB stats: total chunks, collections, last updated."""
    from app.services.kb_management_service import get_kb_stats as _get_kb_stats

    return await _get_kb_stats()


# ── Scan ─────────────────────────────────────────────────────────


@router.post("/knowledge/scan", tags=["knowledge"])
async def scan_external_storage(
    paths: Optional[List[str]] = None,
    recursive: bool = True,
) -> Dict[str, Any]:
    """Scan external storage paths for files."""
    from app.services.kb_management_service import (
        scan_external_storage as _scan,
    )

    result = await _scan(paths=paths, recursive=recursive)
    if not result.get("scanned_paths") and result.get("errors"):
        raise HTTPException(status_code=400, detail=result["errors"][0])
    return result


@router.get("/knowledge/config", tags=["knowledge"])
async def get_knowledge_config() -> Dict[str, Any]:
    """Get current knowledge base configuration."""
    return get_settings_service().load().get("knowledge_base", {})


# ── Ingestion ────────────────────────────────────────────────────


@router.post("/knowledge/ingest", tags=["knowledge"])
async def ingest_files(
    background_tasks: BackgroundTasks,
    file_paths: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Start a background ingest job. Poll GET /knowledge/ingest-jobs/{job_id} for progress."""
    from app.services.kb_indexing_service import create_ingest_job, job_ingest
    from app.services.kb_management_service import scan_external_storage as _scan_fn

    job_id = create_ingest_job()
    background_tasks.add_task(job_ingest, job_id, file_paths, scan_fn=_scan_fn)
    return {"job_id": job_id, "status": "pending"}


# ── Search ───────────────────────────────────────────────────────


@router.post("/knowledge/search", tags=["knowledge"])
async def search_knowledge(query: str, top_k: int = 5) -> Dict[str, Any]:
    """Semantic search in knowledge base."""
    from app.services.kb_search_service import search_kb

    result = await search_kb(query, top_k=top_k)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


# ── Incremental ingestion ────────────────────────────────────────


@router.post("/knowledge/ingest/incremental", tags=["knowledge"])
async def incremental_ingest(
    background_tasks: BackgroundTasks,
    file_paths: List[str] = Body(...),
) -> Dict[str, Any]:
    """Start a background incremental-ingest job."""
    from app.services.kb_indexing_service import create_ingest_job, job_incremental

    job_id = create_ingest_job()
    background_tasks.add_task(job_incremental, job_id, file_paths)
    return {"job_id": job_id, "status": "pending"}


# ── File listing ─────────────────────────────────────────────────


@router.get("/knowledge/files", tags=["knowledge"])
async def list_kb_files(
    collection: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """List indexed files with metadata, preview, and chunk counts."""
    from app.services.kb_management_service import list_kb_files as _list_files

    return await _list_files(collection=collection, limit=limit, offset=offset)


# ── File deletion ────────────────────────────────────────────────


@router.delete(
    "/knowledge/files/{file_id:path}",
    tags=["knowledge"],
    dependencies=[Depends(verify_api_key)],
)
async def delete_kb_file_by_id(file_id: str) -> Dict[str, Any]:
    """Remove all indexed chunks for a file."""
    from app.services.kb_indexing_service import UPLOADS_DIR

    vector_store = get_vector_store_service()
    deleted_chunks = await vector_store.delete_by_file_path(file_id)
    if deleted_chunks == 0:
        raise HTTPException(404, f"No indexed chunks found for: {file_id}")

    upload_path = Path(file_id)
    if upload_path.exists() and str(UPLOADS_DIR) in str(upload_path):
        try:
            upload_path.unlink()
            logger.info("Deleted upload file: %s", file_id)
        except OSError as exc:
            logger.warning("Could not delete file %s: %s", file_id, exc)

    return {"file_id": file_id, "deleted_chunks": deleted_chunks}


@router.delete(
    "/knowledge/files", tags=["knowledge"], dependencies=[Depends(verify_api_key)]
)
async def delete_kb_file(path: str) -> Dict[str, Any]:
    """Remove all indexed chunks for a specific file path."""
    vector_store = get_vector_store_service()
    deleted_chunks = await vector_store.delete_by_file_path(path)
    if deleted_chunks == 0:
        raise HTTPException(
            status_code=404, detail=f"No indexed chunks found for: {path}"
        )
    return {"path": path, "deleted_chunks": deleted_chunks}


# ── Reindex ──────────────────────────────────────────────────────


@router.post(
    "/knowledge/reindex", tags=["knowledge"], dependencies=[Depends(verify_api_key)]
)
async def reindex_file(body: ReindexFileRequest) -> Dict[str, Any]:
    """Re-index a single file: delete its existing chunks then re-ingest."""
    from app.services.kb_indexing_service import run_ingest_core

    return await run_ingest_core(file_paths=[body.file_path])


# ── Stats ────────────────────────────────────────────────────────


@router.get("/knowledge/stats", tags=["knowledge"])
async def get_knowledge_stats(detailed: bool = True) -> Dict[str, Any]:
    """Get knowledge base statistics (served from cache with Cache-Control)."""
    if not detailed:
        return get_vector_store_service().get_stats(detailed=False)

    from app.services.kb_stats_cache import get_cached_stats
    from fastapi.responses import JSONResponse

    return JSONResponse(
        content=get_cached_stats(),
        headers={"Cache-Control": "max-age=300"},
    )


@router.post("/knowledge/stats/refresh", tags=["knowledge"])
async def refresh_knowledge_stats() -> Dict[str, Any]:
    """Manually trigger a KB stats cache refresh."""
    import asyncio
    from app.services.kb_stats_cache import refresh_cache

    return await asyncio.get_event_loop().run_in_executor(None, refresh_cache)


# ── Job polling ──────────────────────────────────────────────────


@router.get("/knowledge/ingest-jobs/{job_id}", tags=["knowledge"])
async def get_ingest_job(job_id: str) -> Dict[str, Any]:
    """Poll the status of an ingest background job."""
    from app.services.kb_indexing_service import get_ingest_job as _get_job

    job = _get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
    return job


# ── Batch upload ─────────────────────────────────────────────────


@router.post("/knowledge/upload/batch", tags=["knowledge"])
async def batch_upload(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    mode: str = Form("index"),
    collection: str = Form("default"),
) -> Dict[str, Any]:
    """Upload files directly to the Knowledge Base."""
    from app.services.file_handler_service import (
        get_file_handler_service,
        SUPPORTED_EXTENSIONS,
    )
    from app.services.kb_indexing_service import (
        UPLOADS_DIR,
        create_ingest_job,
        job_upload_index,
    )

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    handler = get_file_handler_service()
    results: List[Dict[str, Any]] = []

    if mode == "index":
        saved_paths: List[str] = []
        for upload in files:
            suffix = Path(upload.filename or "file").suffix.lower()
            if suffix not in SUPPORTED_EXTENSIONS:
                results.append(
                    {
                        "file": upload.filename,
                        "error": f"Unsupported file type: {suffix}",
                    }
                )
                continue
            dest = UPLOADS_DIR / f"{uuid.uuid4()}{suffix}"
            try:
                with dest.open("wb") as f:
                    shutil.copyfileobj(upload.file, f)
                saved_paths.append(str(dest))
                results.append({"file": upload.filename, "saved_as": dest.name})
            except Exception as exc:
                results.append({"file": upload.filename, "error": str(exc)})

        if not saved_paths:
            return {"results": results, "job_id": None, "mode": mode}

        job_id = create_ingest_job()
        background_tasks.add_task(job_upload_index, job_id, saved_paths, collection)

        for r in results:
            if "saved_as" in r:
                r["job_id"] = job_id

        return {
            "results": results,
            "job_id": job_id,
            "mode": mode,
            "collection": collection,
        }

    # mode == "analyze"
    for upload in files:
        suffix = Path(upload.filename or "file").suffix.lower()
        if suffix not in SUPPORTED_EXTENSIONS:
            results.append(
                {"file": upload.filename, "error": f"Unsupported file type: {suffix}"}
            )
            continue

        tmp_path = UPLOADS_DIR / f"analyze_{uuid.uuid4()}{suffix}"
        try:
            with tmp_path.open("wb") as f:
                shutil.copyfileobj(upload.file, f)

            result = await handler.process_file(str(tmp_path), "analyze")
            results.append(
                {
                    "file": upload.filename,
                    "preview": result.get("text_preview", ""),
                    "summary": result.get("summary", ""),
                    "char_count": result.get("char_count", 0),
                    "page_count": result.get("page_count", 1),
                }
            )
        except Exception as exc:
            results.append({"file": upload.filename, "error": str(exc)})
        finally:
            try:
                tmp_path.unlink(missing_ok=True)
            except Exception:
                pass

    return {"results": results, "mode": mode}


# ── Overview ─────────────────────────────────────────────────────


@router.get("/knowledge/overview", tags=["knowledge"])
async def kb_overview_endpoint() -> Dict[str, Any]:
    """Return a structured overview of the Knowledge Base."""
    from app.services.kb_management_service import kb_overview

    return await kb_overview()


# ── Retention policy ─────────────────────────────────────────────


@router.get("/knowledge/retention/config", tags=["knowledge"])
async def get_retention_config() -> Dict[str, Any]:
    """Return current retention configuration from settings."""
    kb_cfg = get_settings_service().load().get("knowledge_base", {})
    return {
        "retention_days": kb_cfg.get("retention_days", 30),
        "max_size_gb": kb_cfg.get("max_size_gb", 10),
    }


@router.post(
    "/knowledge/retention/run",
    tags=["knowledge"],
    dependencies=[Depends(verify_api_key)],
)
async def run_retention_job() -> Dict[str, Any]:
    """Manually trigger KB retention cleanup."""
    from app.services.kb_retention_service import run_kb_retention

    return await run_kb_retention()


# ── Multi-KB collection management ───────────────────────────────


@router.get("/kb/collections", tags=["knowledge"])
async def list_kb_collections() -> Dict[str, Any]:
    """List all KB collections with name, chunk count, and metadata."""
    cols = await get_vector_store_service().list_collections()
    return {"collections": cols, "count": len(cols)}


@router.post("/kb/collections", tags=["knowledge"])
async def create_kb_collection(
    body: Dict[str, Any] = Body(default={}),
) -> Dict[str, Any]:
    """Create a new KB collection."""
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="'name' is required")
    try:
        return await get_vector_store_service().create_collection(
            name=name,
            description=body.get("description", ""),
            tags=body.get("tags", []),
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete(
    "/kb/collections/{name}", tags=["knowledge"], dependencies=[Depends(verify_api_key)]
)
async def delete_kb_collection(name: str) -> Dict[str, Any]:
    """Delete a KB collection by name."""
    try:
        await get_vector_store_service().delete_collection(name)
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
    """Add tags to a specific document in a KB collection."""
    doc_id = body.get("doc_id", "").strip()
    tags: List[str] = body.get("tags", [])
    if not doc_id:
        raise HTTPException(status_code=400, detail="'doc_id' is required")
    try:
        await get_vector_store_service().add_tags_to_document(
            collection=name, doc_id=doc_id, tags=tags
        )
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
    """Semantic search with optional collection and tag filtering."""
    from app.services.kb_search_service import search_kb_with_filters as _search

    result = await _search(q=q, collection=collection, tag=tag, top_k=top_k)
    if "error" in result:
        if "not found" in result["error"].lower():
            raise HTTPException(status_code=404, detail=result["error"])
        if "required" in result["error"].lower():
            raise HTTPException(status_code=400, detail=result["error"])
        raise HTTPException(status_code=503, detail=result["error"])
    return result
