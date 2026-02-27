"""Knowledge base router – external storage scan, ingestion, search."""
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException

from app.services.embeddings_service import get_embeddings_service
from app.services.file_parser_service import get_file_parser_service
from app.services.settings_service import get_settings_service
from app.services.vector_store_service import get_vector_store_service
from app.services.ws_manager import get_ws_manager
from app.utils.text_chunker import chunk_text

logger = logging.getLogger(__name__)
router = APIRouter()


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


@router.post("/knowledge/ingest", tags=["knowledge"])
async def ingest_files(
    file_paths: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Ingest files: parse -> chunk -> embed -> store.

    Args:
        file_paths: Optional list of specific files to ingest.
                   If None, ingests all files from scan results.
    """
    parser = get_file_parser_service()
    embeddings_svc = get_embeddings_service()
    vector_store = get_vector_store_service()

    # Get files to ingest
    if file_paths:
        files = [Path(p) for p in file_paths]
    else:
        # Scan all external paths
        scan_result = await scan_external_storage()
        files = [Path(f["path"]) for f in scan_result["discovered_files"]]

    # Only ingest parseable file types
    parseable_exts = parser.SUPPORTED_EXTENSIONS

    ws_manager = get_ws_manager()
    ingested_count = 0
    failed_count = 0
    total_chunks = 0
    errors: List[str] = []
    total_files = len(files)

    for file_idx, file_path in enumerate(files):
        if file_path.suffix.lower() not in parseable_exts:
            continue

        try:
            # 1. Parse file
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

            # 2. Chunk text
            chunks = chunk_text(text, chunk_size=500, overlap=50)

            # 3. Generate embeddings
            embeddings = await embeddings_svc.generate_embeddings_batch(chunks)

            # Filter out failed embeddings
            valid_items = [
                (chunk, emb, idx)
                for idx, (chunk, emb) in enumerate(zip(chunks, embeddings))
                if emb is not None
            ]

            if not valid_items:
                errors.append(f"{file_path.name}: All embeddings failed")
                failed_count += 1
                continue

            # 4. Store in vector DB
            ids = [f"file:{file_path}:chunk_{idx}" for _, _, idx in valid_items]
            docs = [chunk for chunk, _, _ in valid_items]
            embs = [emb for _, emb, _ in valid_items]
            metadatas = [
                {
                    "file_path": str(file_path),
                    "file_name": file_path.name,
                    "chunk_index": idx,
                    "page_count": parsed.get("page_count", 1),
                    **parsed.get("metadata", {}),
                }
                for _, _, idx in valid_items
            ]

            # Delete old chunks for this file (re-indexing)
            vector_store.delete_by_file_path(str(file_path))

            # Add new chunks
            vector_store.add_documents(
                ids=ids,
                embeddings=embs,
                documents=docs,
                metadatas=metadatas,
            )

            ingested_count += 1
            total_chunks += len(valid_items)

            # Broadcast progress via WebSocket
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
    MIN_SCORE = 0.3  # cosine similarity threshold (1 - distance)
    results = []
    for doc, metadata, distance in zip(
        search_results["documents"],
        search_results["metadatas"],
        search_results["distances"],
    ):
        score = round(1 - distance, 4)
        if score < MIN_SCORE:
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


# ── Stats ────────────────────────────────────────────────────────


@router.get("/knowledge/stats", tags=["knowledge"])
async def get_knowledge_stats() -> Dict[str, Any]:
    """Get knowledge base statistics."""
    vector_store = get_vector_store_service()
    return vector_store.get_stats()
