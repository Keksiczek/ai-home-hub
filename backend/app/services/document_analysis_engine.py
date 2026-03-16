"""DocumentAnalysisEngine – orchestrates multi-document analysis as a long-running job.

Pipeline:
1. Parse each document via file_parser_service (DA3)
2. Summarize each document via LLM with chunking (DA4)
3. Cross-document synthesis (DA5)
4. Generate Markdown report and persist results (DA6)
"""
import json
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Awaitable, Callable, Dict, List, Optional

from app.models.document_analysis_models import (
    DocumentAnalysisInput,
    DocumentAnalysisResult,
    PerDocumentSummary,
)
from app.services.job_service import Job
from app.services.metrics_service import (
    document_analysis_duration_seconds,
    documents_parsed_total,
)

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[float, Optional[Dict[str, Any]]], Awaitable[None]]

DATA_DIR = Path(__file__).parent.parent.parent / "data"
ARTIFACTS_DIR = DATA_DIR / "artifacts" / "document-analysis"


@dataclass
class ParsedDocument:
    """Internal representation of a parsed document."""
    file_path: str
    title: str
    text: str
    metadata: Dict[str, Any]
    page_count: int


# ── Main pipeline ────────────────────────────────────────────


async def run_document_analysis_pipeline(
    job: Job,
    input_data: DocumentAnalysisInput,
    progress_callback: ProgressCallback,
) -> DocumentAnalysisResult:
    """Execute the full document analysis pipeline."""

    total_files = len(input_data.file_paths)
    pipeline_start = time.monotonic()
    logger.info(
        "DocumentAnalysis started: %d file(s), task=%s",
        total_files, input_data.task_description[:80],
    )

    # ── Phase 1: Parse documents (0–20%) ─────────────────────
    phase_start = time.monotonic()
    parsed_docs = await _parse_documents(input_data.file_paths, progress_callback, total_files)
    document_analysis_duration_seconds.labels(phase="parsing").observe(time.monotonic() - phase_start)

    if not parsed_docs:
        raise ValueError("No documents could be parsed successfully")

    # ── Phase 2: Per-document summarization (20–70%) ─────────
    from app.services.document_summarizer_service import summarize_document

    per_doc_summaries: List[PerDocumentSummary] = []
    phase_start = time.monotonic()

    for idx, doc in enumerate(parsed_docs):
        await progress_callback(
            20 + (idx / len(parsed_docs)) * 50,
            {"phase": "summarizing", "current_doc": idx + 1, "total_docs": len(parsed_docs), "file": doc.title},
        )

        summary = await summarize_document(
            doc=doc,
            task_description=input_data.task_description,
            llm_profile=input_data.llm_profile,
            language=input_data.language or "cs",
        )
        per_doc_summaries.append(summary)
        logger.info("Summarized %d/%d: %s", idx + 1, len(parsed_docs), doc.title)

    document_analysis_duration_seconds.labels(phase="summarizing").observe(time.monotonic() - phase_start)
    await progress_callback(70, {"phase": "summarizing", "status": "done"})

    # ── Phase 3: Cross-document synthesis (70–85%) ───────────
    await progress_callback(70, {"phase": "synthesis", "status": "started"})
    phase_start = time.monotonic()

    overall_summary, recommendations = await _cross_document_synthesis(
        per_doc_summaries,
        input_data.task_description,
        input_data.llm_profile,
        input_data.language or "cs",
    )

    document_analysis_duration_seconds.labels(phase="synthesis").observe(time.monotonic() - phase_start)
    await progress_callback(85, {"phase": "synthesis", "status": "done"})

    # ── Phase 4: Generate report (85–100%) ───────────────────
    await progress_callback(85, {"phase": "report", "status": "started"})
    phase_start = time.monotonic()

    result = DocumentAnalysisResult(
        task_description=input_data.task_description,
        documents=per_doc_summaries,
        overall_summary=overall_summary,
        recommendations=recommendations,
    )

    report_path = _generate_report(job.id, result)
    result.generated_report_path = report_path

    # Persist result JSON
    _persist_result_json(job.id, result)

    document_analysis_duration_seconds.labels(phase="report").observe(time.monotonic() - phase_start)
    document_analysis_duration_seconds.labels(phase="total").observe(time.monotonic() - pipeline_start)
    await progress_callback(100, {"phase": "report", "status": "done", "report_path": report_path})

    logger.info("DocumentAnalysis completed: %d docs, report=%s", len(per_doc_summaries), report_path)
    return result


# ── Phase 1: Document parsing (DA3) ─────────────────────────


async def _parse_documents(
    file_paths: List[str],
    progress_callback: ProgressCallback,
    total_files: int,
) -> List[ParsedDocument]:
    """Parse each file and return list of ParsedDocument."""
    from app.services.file_parser_service import get_file_parser_service

    parser = get_file_parser_service()
    parsed: List[ParsedDocument] = []

    for idx, rel_path in enumerate(file_paths):
        # Resolve path relative to data/ directory
        file_path = DATA_DIR / rel_path
        if not file_path.exists():
            # Try as absolute path
            file_path = Path(rel_path)

        await progress_callback(
            (idx / total_files) * 20,
            {"phase": "parsing", "current_doc": idx + 1, "total_docs": total_files, "file": file_path.name},
        )

        result = parser.parse_file(file_path)

        if "error" in result:
            documents_parsed_total.labels(status="error").inc()
            logger.warning("Failed to parse %s: %s", rel_path, result["error"])
            continue

        text = result.get("text", "")
        if not text.strip():
            documents_parsed_total.labels(status="error").inc()
            logger.warning("No text extracted from %s, skipping", rel_path)
            continue

        title = (
            result.get("metadata", {}).get("title")
            or file_path.stem.replace("_", " ").replace("-", " ").title()
        )

        parsed.append(ParsedDocument(
            file_path=rel_path,
            title=title,
            text=text,
            metadata=result.get("metadata", {}),
            page_count=result.get("page_count", 1),
        ))
        documents_parsed_total.labels(status="success").inc()

        logger.info("Parsed %d/%d: %s (%d chars)", idx + 1, total_files, file_path.name, len(text))

    await progress_callback(20, {"phase": "parsing", "status": "done", "parsed_count": len(parsed)})
    return parsed


# ── Phase 3: Cross-document synthesis (DA5) ──────────────────


async def _cross_document_synthesis(
    summaries: List[PerDocumentSummary],
    task_description: str,
    llm_profile: Optional[str],
    language: str,
) -> tuple:
    """Synthesize all per-document summaries into overall summary + recommendations."""
    from app.services.llm_service import get_llm_service

    llm = get_llm_service()

    # Build input from per-doc summaries
    docs_text = ""
    for i, s in enumerate(summaries, 1):
        docs_text += f"\n--- Dokument {i}: {s.title} ---\n"
        docs_text += f"Shrnutí: {s.summary}\n"
        if s.key_points:
            docs_text += "Klíčové body: " + "; ".join(s.key_points) + "\n"
        if s.risks_or_gaps:
            docs_text += "Rizika/mezery: " + "; ".join(s.risks_or_gaps) + "\n"
        if s.metrics:
            metrics_str = "; ".join(f"{k}: {v}" for k, v in s.metrics.items())
            docs_text += f"Metriky: {metrics_str}\n"

    lang_instruction = "Odpovídej česky." if language == "cs" else f"Respond in {language}."

    prompt = f"""Na základě následujících shrnutí jednotlivých dokumentů vytvoř:
1. Celkový přehled (overall_summary) – hlavní zjištění, společná témata, rozdíly mezi dokumenty.
2. Doporučení (recommendations) – konkrétní akční body na základě analýzy.

Úloha: {task_description}
{lang_instruction}

{docs_text}

Odpověz PŘESNĚ v tomto JSON formátu (žádný další text):
{{
  "overall_summary": "celkový přehled jako jeden odstavec",
  "recommendations": ["doporučení 1", "doporučení 2", "doporučení 3"]
}}"""

    try:
        reply, meta = await llm.generate(
            message=prompt,
            mode="general",
            profile=llm_profile,
        )

        parsed = _parse_json_response(reply)
        overall = parsed.get("overall_summary", reply)
        recs = parsed.get("recommendations", [])
        if isinstance(recs, str):
            recs = [recs]

        return overall, recs

    except Exception as exc:
        logger.error("Cross-document synthesis failed: %s", exc)
        return "Synthesis failed – see individual document summaries.", []


# ── Phase 4: Report generation (DA6) ────────────────────────


def _generate_report(job_id: str, result: DocumentAnalysisResult) -> str:
    """Generate a Markdown report and save it to artifacts directory."""
    job_dir = ARTIFACTS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        f"# Document Analysis Report",
        f"",
        f"- **Task:** {result.task_description}",
        f"- **Documents analyzed:** {len(result.documents)}",
        f"- **Generated:** {now}",
        f"",
        f"---",
        f"",
        f"## Overall Summary",
        f"",
        result.overall_summary,
        f"",
    ]

    # Per-document section
    if result.documents:
        lines.append("---")
        lines.append("")
        lines.append("## Per-Document Analysis")
        lines.append("")

        for i, doc in enumerate(result.documents, 1):
            lines.append(f"### {i}. {doc.title}")
            lines.append(f"")
            lines.append(f"**File:** `{doc.file_path}`")
            lines.append(f"")
            lines.append(f"**Summary:** {doc.summary}")
            lines.append(f"")

            if doc.key_points:
                lines.append("**Key Points:**")
                for kp in doc.key_points:
                    lines.append(f"- {kp}")
                lines.append("")

            if doc.risks_or_gaps:
                lines.append("**Risks / Gaps:**")
                for rg in doc.risks_or_gaps:
                    lines.append(f"- {rg}")
                lines.append("")

            if doc.metrics:
                lines.append("**Metrics:**")
                lines.append("")
                lines.append("| Metric | Value |")
                lines.append("|--------|-------|")
                for k, v in doc.metrics.items():
                    lines.append(f"| {k} | {v} |")
                lines.append("")

    # Recommendations
    if result.recommendations:
        lines.append("---")
        lines.append("")
        lines.append("## Recommendations")
        lines.append("")
        for i, rec in enumerate(result.recommendations, 1):
            lines.append(f"{i}. {rec}")
        lines.append("")

    report_content = "\n".join(lines)
    report_path = job_dir / "report.md"
    report_path.write_text(report_content, encoding="utf-8")

    rel_path = str(report_path.relative_to(DATA_DIR))
    logger.info("Report saved: %s", report_path)
    return rel_path


def _persist_result_json(job_id: str, result: DocumentAnalysisResult) -> str:
    """Save the full result as JSON."""
    job_dir = ARTIFACTS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    result_path = job_dir / "result.json"
    result_path.write_text(
        result.model_dump_json(indent=2),
        encoding="utf-8",
    )

    logger.info("Result JSON saved: %s", result_path)
    return str(result_path.relative_to(DATA_DIR))


# ── Helpers ──────────────────────────────────────────────────


def _parse_json_response(text: str) -> Dict[str, Any]:
    """Try to extract JSON from LLM response text."""
    text = text.strip()

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting JSON from markdown code block
    import re
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try finding first { ... } block
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass

    return {}
