"""Job engines – pluggable execution backends for different job types."""
import asyncio
import logging
from typing import Any, Awaitable, Callable, Dict, Optional

from app.services.job_service import Job

logger = logging.getLogger(__name__)

# Type alias for the progress callback
ProgressCallback = Callable[[float, Optional[Dict[str, Any]]], Awaitable[None]]


async def run_dummy_long_task(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """DummyLongTaskEngine – simulates a long-running job with 10 steps."""
    total_steps = job.payload.get("steps", 10)
    sleep_per_step = job.payload.get("sleep_seconds", 1.0)

    logger.info("DummyLongTask started: %d steps, %.1fs each", total_steps, sleep_per_step)

    for step in range(1, total_steps + 1):
        await asyncio.sleep(sleep_per_step)
        progress = (step / total_steps) * 100
        await progress_callback(progress, {
            "current_step": step,
            "total_steps": total_steps,
        })
        logger.debug("DummyLongTask step %d/%d (%.0f%%)", step, total_steps, progress)

    return {"message": f"Completed {total_steps} steps", "steps_done": total_steps}


async def run_document_analysis(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """DocumentAnalysisEngine – multi-document analysis with per-doc summaries and consolidated report."""
    from app.models.document_analysis_models import DocumentAnalysisInput
    from app.services.document_analysis_engine import run_document_analysis_pipeline

    input_data = DocumentAnalysisInput(**job.payload)
    result = await run_document_analysis_pipeline(job, input_data, progress_callback)

    outputs: Dict[str, Any] = {}
    if result.generated_report_path:
        outputs["report_md"] = result.generated_report_path
        outputs["result_json"] = result.generated_report_path.replace("report.md", "result.json")

    return {
        "message": f"Analyzed {len(result.documents)} document(s)",
        "documents_count": len(result.documents),
        "report_path": result.generated_report_path,
        "outputs": outputs,
    }


async def run_long_llm_task(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """LongLLMTaskEngine – splits a prompt into chunks and calls LLM for each."""
    from app.services.llm_service import get_llm_service

    llm = get_llm_service()

    prompt = job.payload.get("prompt", "")
    model = job.payload.get("model")
    context = job.payload.get("context", "")
    chunk_size = job.payload.get("chunk_size", 500)

    if not prompt:
        raise ValueError("LongLLMTask requires a 'prompt' in payload")

    # Split prompt into chunks for multi-step processing
    words = prompt.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunks.append(" ".join(words[i : i + chunk_size]))

    if not chunks:
        chunks = [prompt]

    total = len(chunks)
    results = []

    for idx, chunk in enumerate(chunks, 1):
        message = chunk
        if context:
            message = f"Kontext: {context}\n\n{chunk}"

        await progress_callback(
            ((idx - 1) / total) * 100,
            {"current_step": idx, "total_steps": total, "status": "processing"},
        )

        try:
            reply, meta = await llm.generate(
                message=message,
                mode="general",
                model_override=model,
            )
            results.append({"chunk": idx, "reply": reply[:500], "meta": meta})
        except Exception as exc:
            logger.warning("LLM chunk %d/%d failed: %s", idx, total, exc)
            results.append({"chunk": idx, "error": str(exc)})

        await progress_callback(
            (idx / total) * 100,
            {"current_step": idx, "total_steps": total, "status": "done"},
        )

    return {
        "message": f"Processed {total} chunk(s)",
        "chunks_total": total,
        "results": results,
    }


async def run_media_ingest(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """MediaIngestEngine – audio/video → Whisper transcript → optional auto-chain to DocumentAnalysis."""
    import json as _json
    from pathlib import Path

    from app.services.whisper_service import transcribe, SUPPORTED_FORMATS
    from app.services.job_service import get_job_service

    DATA_DIR = Path(__file__).parent.parent.parent / "data"
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

    resolved = DATA_DIR / file_path if not Path(file_path).is_absolute() else Path(file_path)
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
    meta_path.write_text(_json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")

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

        logger.info("Chained document_analysis job %s for transcript", post_analysis_job_id)

    await progress_callback(100, {"phase": "done", "status": "done"})

    return {
        "message": f"Transcribed {transcript.duration_seconds:.0f}s of audio ({transcript.language})",
        "duration_seconds": transcript.duration_seconds,
        "language": transcript.language,
        "segments_count": len(transcript.segments),
        "outputs": outputs,
        "post_analysis_job_id": post_analysis_job_id,
    }


async def run_report_generation(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """ReportGeneratorEngine – generate PDF/HTML/slides from DocumentAnalysisResult."""
    import json as _json
    from pathlib import Path

    from app.models.document_analysis_models import DocumentAnalysisResult
    from app.services.report_generator_service import generate_pdf, generate_html_report, generate_slides_html
    from app.services.llm_service import get_llm_service

    DATA_DIR = Path(__file__).parent.parent.parent / "data"

    source_job_id = job.payload.get("source_job_id", "")
    output_formats = job.payload.get("output_formats", ["html"])
    title = job.payload.get("title", "Report")
    template = job.payload.get("template", "general")

    # Step 1 (0-20%): Load source result
    await progress_callback(0, {"phase": "load", "status": "started"})

    # Try document-analysis artifacts first
    result_json_path = DATA_DIR / "artifacts" / "document-analysis" / source_job_id / "result.json"
    if not result_json_path.exists():
        # Try media_ingest chained job — check the source job's meta for post_analysis_job_id
        from app.services.job_service import get_job_service
        source_job = get_job_service().get_job(source_job_id)
        if source_job and source_job.meta.get("post_analysis_job_id"):
            chained_id = source_job.meta["post_analysis_job_id"]
            result_json_path = DATA_DIR / "artifacts" / "document-analysis" / chained_id / "result.json"

    if not result_json_path.exists():
        raise FileNotFoundError(f"Result JSON not found for job {source_job_id}")

    raw = _json.loads(result_json_path.read_text(encoding="utf-8"))
    analysis_result = DocumentAnalysisResult(**raw)

    await progress_callback(20, {"phase": "load", "status": "done"})

    # Step 2 (20-40%): Apply template enrichment via LLM
    await progress_callback(20, {"phase": "enrich", "status": "started"})

    template_prompts = {
        "general": "Rewrite the following in a neutral executive summary style. Keep it professional and concise.",
        "lean": "Rewrite the following using Lean/CI language: focus on waste identification, VSM concepts, A3 structure. Use Czech if the original is Czech.",
        "powerbi": "Rewrite the following focusing on KPIs, data sources, and Power BI measure suggestions. Keep technical terms.",
        "meeting_minutes": "Rewrite the following as meeting minutes: extract action items with owners, deadlines, and decisions made.",
    }

    prompt_prefix = template_prompts.get(template, template_prompts["general"])

    try:
        llm = get_llm_service()

        # Enrich overall summary
        enrich_prompt = f"{prompt_prefix}\n\nText:\n{analysis_result.overall_summary}"
        enriched_summary, _ = await llm.generate(message=enrich_prompt, mode="general")
        analysis_result.overall_summary = enriched_summary

        await progress_callback(30, {"phase": "enrich", "status": "summary_done"})

        # Enrich recommendations
        if analysis_result.recommendations:
            rec_text = "\n".join(f"- {r}" for r in analysis_result.recommendations)
            rec_prompt = f"{prompt_prefix}\n\nRecommendations:\n{rec_text}\n\nReturn as a numbered list."
            enriched_recs, _ = await llm.generate(message=rec_prompt, mode="general")
            # Parse back to list
            enriched_list = [line.strip().lstrip("0123456789.-) ") for line in enriched_recs.strip().split("\n") if line.strip()]
            if enriched_list:
                analysis_result.recommendations = enriched_list

    except Exception as exc:
        logger.warning("Template enrichment failed, using original content: %s", exc)

    await progress_callback(40, {"phase": "enrich", "status": "done"})

    # Step 3 (40-100%): Generate outputs
    output_dir = DATA_DIR / "artifacts" / "reports" / job.id
    output_dir.mkdir(parents=True, exist_ok=True)

    outputs = {}
    format_count = len(output_formats)
    progress_per_format = 60.0 / max(format_count, 1)

    for i, fmt in enumerate(output_formats):
        base_progress = 40 + i * progress_per_format
        await progress_callback(base_progress, {"phase": "generate", "format": fmt})

        try:
            if fmt == "pdf":
                # Build markdown from result for PDF
                md_content = _build_markdown_from_result(analysis_result, title)
                path = generate_pdf(md_content, str(output_dir / "report.pdf"), title)
                outputs["pdf"] = str(Path(path).relative_to(DATA_DIR))

            elif fmt == "html":
                path = generate_html_report(analysis_result, str(output_dir / "report.html"), title)
                outputs["html"] = str(Path(path).relative_to(DATA_DIR))

            elif fmt == "slides":
                path = generate_slides_html(analysis_result, str(output_dir / "slides.html"), title)
                outputs["slides"] = str(Path(path).relative_to(DATA_DIR))

        except Exception as exc:
            logger.error("Failed to generate %s: %s", fmt, exc)
            outputs[f"{fmt}_error"] = str(exc)

    await progress_callback(100, {"phase": "done", "status": "done"})

    return {
        "message": f"Generated {len(outputs)} report format(s)",
        "outputs": outputs,
    }


def _build_markdown_from_result(result, title: str) -> str:
    """Build a markdown string from DocumentAnalysisResult for PDF generation."""
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        f"# {title}",
        f"",
        f"*Generated: {now}*",
        f"",
        f"**Task:** {result.task_description}",
        f"",
        f"## Summary",
        f"",
        result.overall_summary,
        f"",
    ]

    for i, doc in enumerate(result.documents, 1):
        lines.append(f"## {i}. {doc.title}")
        lines.append(f"")
        lines.append(doc.summary)
        lines.append(f"")
        if doc.key_points:
            for kp in doc.key_points:
                lines.append(f"- {kp}")
            lines.append(f"")

    if result.recommendations:
        lines.append(f"## Recommendations")
        lines.append(f"")
        for i, r in enumerate(result.recommendations, 1):
            lines.append(f"{i}. {r}")
        lines.append(f"")

    return "\n".join(lines)


# ── Engine dispatcher ────────────────────────────────────────

_ENGINES = {
    "dummy_long_task": run_dummy_long_task,
    "long_llm_task": run_long_llm_task,
    "document_analysis": run_document_analysis,
    "media_ingest": run_media_ingest,
    "report_generation": run_report_generation,
}


async def execute_job(job: Job, progress_callback: ProgressCallback) -> Dict[str, Any]:
    """Dispatch a job to the appropriate engine based on job.type."""
    engine_fn = _ENGINES.get(job.type)
    if engine_fn is None:
        logger.warning("Unknown job type: %s (job %s)", job.type, job.id)
        raise ValueError(f"Unknown job type: {job.type}")

    return await engine_fn(job, progress_callback)
