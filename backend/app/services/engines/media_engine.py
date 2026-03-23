"""Media engine – audio/video ingest via Whisper with optional post-analysis chaining."""

import logging
from typing import Any, Awaitable, Callable, Dict, Optional

from app.services.job_service import Job

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[float, Optional[Dict[str, Any]]], Awaitable[None]]


async def run_media_ingest(
    job: Job, progress_callback: ProgressCallback
) -> Dict[str, Any]:
    """MediaIngestEngine – audio/video → Whisper transcript → optional auto-chain to DocumentAnalysis."""
    import json as _json
    from pathlib import Path

    from app.services.whisper_service import transcribe, SUPPORTED_FORMATS
    from app.services.job_service import get_job_service

    DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
    ARTIFACTS_DIR = DATA_DIR / "artifacts" / "media"

    file_path = job.payload.get("file_path", "")
    language = job.payload.get("language")
    if language == "auto":
        language = None
    post_analysis = job.payload.get("post_analysis", False)
    post_analysis_task = job.payload.get("post_analysis_task", "")
    llm_profile = job.payload.get("llm_profile", "general")

    # Step 1 (0-20%): Validate file
    await progress_callback(0, {"phase": "validate", "status": "started"})

    resolved = (
        DATA_DIR / file_path if not Path(file_path).is_absolute() else Path(file_path)
    )
    if not resolved.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = resolved.suffix.lower()
    if suffix not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported format: {suffix}")

    await progress_callback(10, {"phase": "validate", "status": "done"})

    # Step 2 (20-70%): Transcribe
    await progress_callback(20, {"phase": "transcribe", "status": "started"})

    async def whisper_progress(pct: float):
        mapped = 20 + (pct / 100) * 50  # Map 0-100% to 20-70%
        await progress_callback(mapped, {"phase": "transcribe", "whisper_pct": pct})

    transcript = await transcribe(
        file_path=str(resolved),
        language=language,
        progress_callback=whisper_progress,
    )

    await progress_callback(70, {"phase": "transcribe", "status": "done"})

    # Step 3 (70-85%): Save outputs
    await progress_callback(70, {"phase": "save", "status": "started"})

    job_dir = ARTIFACTS_DIR / job.id
    job_dir.mkdir(parents=True, exist_ok=True)

    # Save transcript text
    transcript_txt_path = job_dir / "transcript.txt"
    transcript_txt_path.write_text(transcript.text, encoding="utf-8")

    # Save segments JSON
    segments_path = job_dir / "transcript_segments.json"
    segments_path.write_text(
        _json.dumps(transcript.segments, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    # Save meta
    meta = {
        "duration_seconds": transcript.duration_seconds,
        "language": transcript.language,
        "model_used": transcript.model_used,
        "original_file": file_path,
        "segments_count": len(transcript.segments),
    }
    meta_path = job_dir / "meta.json"
    meta_path.write_text(
        _json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    await progress_callback(85, {"phase": "save", "status": "done"})

    # Step 4 (85-100%): Optional post-analysis chain
    outputs = {
        "transcript_txt": str(transcript_txt_path.relative_to(DATA_DIR)),
        "transcript_segments": str(segments_path.relative_to(DATA_DIR)),
        "meta": str(meta_path.relative_to(DATA_DIR)),
    }

    post_analysis_job_id = None
    if post_analysis and post_analysis_task:
        await progress_callback(90, {"phase": "chain", "status": "started"})

        job_service = get_job_service()
        analysis_job = job_service.create_job(
            type="document_analysis",
            title=f"Analýza: {post_analysis_task[:50]}",
            input_summary=post_analysis_task,
            payload={
                "file_paths": [str(transcript_txt_path.relative_to(DATA_DIR))],
                "task_description": post_analysis_task,
                "llm_profile": llm_profile,
                "language": language or "cs",
            },
            priority="low",
        )
        post_analysis_job_id = analysis_job.id
        outputs["post_analysis_job_id"] = post_analysis_job_id

        # Store in job meta
        job.meta["post_analysis_job_id"] = post_analysis_job_id
        job_service.update_job(job)

        logger.info(
            "Chained document_analysis job %s for transcript", post_analysis_job_id
        )

    await progress_callback(100, {"phase": "done", "status": "done"})

    return {
        "message": f"Transcribed {transcript.duration_seconds:.0f}s of audio ({transcript.language})",
        "duration_seconds": transcript.duration_seconds,
        "language": transcript.language,
        "segments_count": len(transcript.segments),
        "outputs": outputs,
        "post_analysis_job_id": post_analysis_job_id,
    }
