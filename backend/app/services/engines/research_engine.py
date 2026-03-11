"""Research engine – multi-document analysis pipeline."""
import logging
from typing import Any, Awaitable, Callable, Dict, Optional

from app.services.job_service import Job

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[float, Optional[Dict[str, Any]]], Awaitable[None]]


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
