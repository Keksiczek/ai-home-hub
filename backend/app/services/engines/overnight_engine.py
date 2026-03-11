"""Overnight engines – kb_reindex, git_sweep, nightly_summary."""
import asyncio
import logging
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Awaitable, Callable, Dict, List, Optional

from app.services.job_service import Job

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[float, Optional[Dict[str, Any]]], Awaitable[None]]


# ── B1: kb_reindex engine ──────────────────────────────────────


async def run_kb_reindex(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """Přeindexuje Knowledge Base – pouze změněné/nové soubory (inkrementálně).

    Nemazat existující indexy, pouze přidat co chybí.
    """
    from app.services.settings_service import get_settings_service
    from app.services.vector_store_service import get_vector_store_service
    from app.services.file_parser_service import get_file_parser_service
    from app.services.embeddings_service import get_embeddings_service

    settings = get_settings_service().load()
    kb_config = settings.get("knowledge_base", {})
    external_paths = kb_config.get("external_paths", [])
    allowed_extensions = kb_config.get("allowed_extensions", [])

    if not external_paths:
        await progress_callback(100.0, {"message": "Žádné external_paths nakonfigurované"})
        return {"indexed": 0, "skipped": 0, "errors": [], "message": "No external_paths configured"}

    vector_svc = get_vector_store_service()
    parser_svc = get_file_parser_service()
    embeddings_svc = get_embeddings_service()

    # Collect all candidate files
    all_files: List[Path] = []
    for ext_path in external_paths:
        p = Path(ext_path)
        if not p.exists() or not p.is_dir():
            logger.warning("kb_reindex: path does not exist or is not a dir: %s", ext_path)
            continue
        for root, _dirs, files in os.walk(p):
            for fname in files:
                fpath = Path(root) / fname
                if fpath.suffix.lower() in allowed_extensions:
                    all_files.append(fpath)

    if not all_files:
        await progress_callback(100.0, {"message": "Žádné soubory k indexování"})
        return {"indexed": 0, "skipped": 0, "errors": []}

    indexed = 0
    skipped = 0
    errors: List[str] = []
    total = len(all_files)

    # Get existing file metadata from vector store to check mtime
    existing_meta: Dict[str, float] = {}
    try:
        stats = vector_svc.get_stats(detailed=True)
        top_sources = stats.get("top_sources", [])
        # We need to check individual file mtimes stored in metadata
        # Fetch existing metadatas to compare
        if stats.get("total_chunks", 0) > 0:
            result = vector_svc.collection.get(
                limit=min(stats["total_chunks"], 50000),
                include=["metadatas"],
            )
            for meta in (result.get("metadatas") or []):
                fp = meta.get("file_path", "")
                mtime = meta.get("file_mtime", 0)
                if fp and mtime:
                    existing_meta[fp] = float(mtime)
    except Exception as exc:
        logger.warning("kb_reindex: failed to load existing metadata: %s", exc)

    for i, fpath in enumerate(all_files):
        try:
            file_str = str(fpath)
            file_mtime = fpath.stat().st_mtime

            # Check if already indexed with same mtime
            if file_str in existing_meta and existing_meta[file_str] >= file_mtime:
                skipped += 1
                progress = ((i + 1) / total) * 100
                await progress_callback(progress, {"message": f"Přeskakuji: {fpath.name}"})
                continue

            # Parse file
            parsed = parser_svc.parse_file(fpath)
            if not parsed.get("text"):
                skipped += 1
                continue

            text = parsed["text"]

            # Generate embedding
            embedding = await embeddings_svc.generate_embedding(text[:8000])
            if not embedding:
                errors.append(f"Embedding failed: {fpath.name}")
                continue

            # If file was previously indexed, delete old chunks first
            if file_str in existing_meta:
                await vector_svc.delete_by_file_path(file_str)

            # Add to vector store
            import uuid
            chunk_id = f"kb_{uuid.uuid4().hex[:12]}"
            await vector_svc.add_documents(
                ids=[chunk_id],
                embeddings=[embedding],
                documents=[text[:8000]],
                metadatas=[{
                    "file_path": file_str,
                    "file_name": fpath.name,
                    "file_type": fpath.suffix.lower(),
                    "file_mtime": file_mtime,
                    "indexed_at": datetime.now(timezone.utc).isoformat(),
                }],
            )
            indexed += 1

            progress = ((i + 1) / total) * 100
            await progress_callback(progress, {"message": f"Indexuji: {fpath.name}"})

        except Exception as exc:
            errors.append(f"{fpath.name}: {str(exc)[:200]}")
            logger.error("kb_reindex error for %s: %s", fpath, exc)

    await progress_callback(100.0, {"message": f"Hotovo: {indexed} indexováno, {skipped} přeskočeno"})
    return {"indexed": indexed, "skipped": skipped, "errors": errors}


# ── B2: git_sweep engine ───────────────────────────────────────


async def run_git_sweep(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """Projde všechny nakonfigurované VS Code projekty a zjistí jejich git stav.

    Výsledky uloží do memory_service pro ranní přehled.
    """
    from app.services.settings_service import get_settings_service
    from app.services.git_service import get_git_service
    from app.services.memory_service import get_memory_service

    settings = get_settings_service().load()
    projects = settings.get("integrations", {}).get("vscode", {}).get("projects", {})

    if not projects:
        await progress_callback(100.0, {"message": "Žádné VS Code projekty nakonfigurované"})
        return {"projects_checked": 0, "dirty_projects": [], "clean_projects": []}

    git_svc = get_git_service()
    memory_svc = get_memory_service()

    dirty_projects: List[str] = []
    clean_projects: List[str] = []
    total = len(projects)

    for i, (name, project_cfg) in enumerate(projects.items()):
        project_path = project_cfg if isinstance(project_cfg, str) else project_cfg.get("path", "")
        if not project_path:
            continue

        progress = ((i + 1) / total) * 100
        await progress_callback(progress, {"message": f"Kontroluji: {name}"})

        try:
            # Get git status
            status_data = await git_svc.status(project_path)
            changes = status_data.get("changes", [])
            branch = status_data.get("branch", "unknown")

            # Get last 5 commits
            commits = await git_svc.log(project_path, count=5)
            last_commit_msg = commits[0]["subject"] if commits else "žádné commity"
            last_commit_date = commits[0]["when"] if commits else "N/A"

            uncommitted_count = len(changes)

            if uncommitted_count > 0:
                dirty_projects.append(name)
            else:
                clean_projects.append(name)

            # Build summary
            summary = (
                f"[{name}] branch: {branch}, "
                f"{uncommitted_count} uncommitted files, "
                f"last commit: {last_commit_msg} ({last_commit_date})"
            )

            # Store to memory
            await memory_svc.store_system_event("git_sweep", summary)

        except Exception as exc:
            logger.warning("git_sweep: failed for project %s: %s", name, exc)
            dirty_projects.append(f"{name} (error)")
            await memory_svc.store_system_event(
                "git_sweep",
                f"[{name}] chyba při kontrole: {str(exc)[:200]}",
            )

    await progress_callback(100.0, {"message": f"Hotovo: {total} projektů zkontrolováno"})

    return {
        "projects_checked": total,
        "dirty_projects": dirty_projects,
        "clean_projects": clean_projects,
    }


# ── B3: nightly_summary engine ─────────────────────────────────


async def run_nightly_summary(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """Vygeneruje denní summary ze všeho co se dělo – agent runy, system eventy,
    resource warningy. Uloží do memory jako jeden přehledný záznam.
    Používá lokální LLM (profile: summarize).
    """
    from app.services.memory_service import get_memory_service
    from app.services.llm_service import get_llm_service

    memory_svc = get_memory_service()
    llm_svc = get_llm_service()

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()

    await progress_callback(10.0, {"message": "Načítám systémové eventy..."})

    # 1. Get recent system events (last 24h)
    recent_events = memory_svc.get_recent_events(limit=50)
    today_events = [
        e for e in recent_events
        if e.get("timestamp", "") >= cutoff
    ]

    await progress_callback(20.0, {"message": "Načítám agent historii..."})

    # 2. Get agent history (last 24h)
    agent_records = await memory_svc.search_agent_history("", top_k=20)
    today_agents = [
        r for r in agent_records
        if r.timestamp >= cutoff
    ]

    total_records = len(today_events) + len(today_agents)

    # 3. If nothing happened, store a simple note
    if total_records == 0:
        no_activity_msg = "Žádná aktivita za posledních 24 hodin."
        await memory_svc.store_system_event("nightly_summary", no_activity_msg)
        await progress_callback(100.0, {"message": no_activity_msg})
        return {"summary": no_activity_msg, "events_processed": 0, "date": today}

    await progress_callback(40.0, {"message": "Generuji summary přes LLM..."})

    # 4. Build data for LLM
    data_parts: List[str] = []
    for e in today_events:
        data_parts.append(f"[{e.get('event_type', 'event')}] {e.get('text', '')[:300]}")
    for r in today_agents:
        data_parts.append(f"[agent] {r.text[:300]}")

    combined_data = "\n".join(data_parts)

    prompt = (
        "Shrň následující záznamy aktivity AI Home Hub za posledních 24 hodin "
        "do přehledného denního reportu v češtině. Zahrň: co agent dělal, jaké byly "
        "systémové události, případné problémy. Max 10 odrážek, každá 1 věta. "
        "Pouze fakta z dat, žádné doplňování.\n\n"
        f"Data:\n{combined_data}"
    )

    # 5. Call LLM with summarize profile
    try:
        llm_output, _meta = await asyncio.wait_for(
            llm_svc.generate(prompt, mode="general", profile="summarize"),
            timeout=60.0,
        )
    except asyncio.TimeoutError:
        llm_output = f"LLM timeout – raw data: {len(today_events)} eventů, {len(today_agents)} agent runů"
        logger.warning("nightly_summary: LLM timeout")
    except Exception as exc:
        llm_output = f"LLM chyba: {str(exc)[:200]} – raw: {len(today_events)} eventů, {len(today_agents)} agent runů"
        logger.error("nightly_summary: LLM error: %s", exc)

    await progress_callback(80.0, {"message": "Ukládám do memory..."})

    # 6. Store result to memory with high importance
    await memory_svc.add_memory(
        text=llm_output,
        tags=["nightly", "summary", today],
        source="nightly_summary",
        importance=8,
    )

    await progress_callback(100.0, {"message": "Noční summary hotovo"})

    # 7. Broadcast nightly_summary_ready event (handled via progress_callback meta)
    # The job_worker will broadcast job_update; we add extra WS event via meta
    preview = llm_output[:200]

    return {
        "summary": llm_output,
        "events_processed": total_records,
        "date": today,
        "preview": preview,
    }
