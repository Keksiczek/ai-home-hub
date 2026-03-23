"""Report engine – PDF/HTML/slides generation from DocumentAnalysisResult."""

import logging
from typing import Any, Awaitable, Callable, Dict, Optional

from app.services.job_service import Job

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[float, Optional[Dict[str, Any]]], Awaitable[None]]


async def run_report_generation(
    job: Job, progress_callback: ProgressCallback
) -> Dict[str, Any]:
    """ReportGeneratorEngine – generate PDF/HTML/slides from DocumentAnalysisResult."""
    import json as _json
    from pathlib import Path

    from app.models.document_analysis_models import DocumentAnalysisResult
    from app.services.report_generator_service import (
        generate_pdf,
        generate_html_report,
        generate_slides_html,
    )
    from app.services.llm_service import get_llm_service

    DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"

    source_job_id = job.payload.get("source_job_id", "")
    output_formats = job.payload.get("output_formats", ["html"])
    title = job.payload.get("title", "Report")
    template = job.payload.get("template", "general")

    # Step 1 (0-20%): Load source result
    await progress_callback(0, {"phase": "load", "status": "started"})

    # Try document-analysis artifacts first
    result_json_path = (
        DATA_DIR / "artifacts" / "document-analysis" / source_job_id / "result.json"
    )
    if not result_json_path.exists():
        # Try media_ingest chained job — check the source job's meta for post_analysis_job_id
        from app.services.job_service import get_job_service

        source_job = get_job_service().get_job(source_job_id)
        if source_job and source_job.meta.get("post_analysis_job_id"):
            chained_id = source_job.meta["post_analysis_job_id"]
            result_json_path = (
                DATA_DIR
                / "artifacts"
                / "document-analysis"
                / chained_id
                / "result.json"
            )

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
            enriched_list = [
                line.strip().lstrip("0123456789.-) ")
                for line in enriched_recs.strip().split("\n")
                if line.strip()
            ]
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
                path = generate_html_report(
                    analysis_result, str(output_dir / "report.html"), title
                )
                outputs["html"] = str(Path(path).relative_to(DATA_DIR))

            elif fmt == "slides":
                path = generate_slides_html(
                    analysis_result, str(output_dir / "slides.html"), title
                )
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
