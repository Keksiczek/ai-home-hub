"""Pydantic models for DocumentAnalysisEngine input/output."""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DocumentAnalysisInput(BaseModel):
    """Input payload for a document_analysis job."""
    file_paths: List[str] = Field(..., min_length=1, description="Paths relative to data/ directory")
    task_description: str = Field(..., min_length=1, description="What the analysis should do")
    llm_profile: Optional[str] = Field(default=None, description="LLM profile: general | lean | powerbi")
    language: Optional[str] = Field(default="cs", description="Output language code (cs, en)")


class PerDocumentSummary(BaseModel):
    """Structured summary for a single document."""
    file_path: str
    title: str
    summary: str
    key_points: List[str] = Field(default_factory=list)
    risks_or_gaps: List[str] = Field(default_factory=list)
    metrics: Dict[str, str] = Field(default_factory=dict)
    tokens_used: Optional[int] = None


class DocumentAnalysisResult(BaseModel):
    """Final result of the entire document analysis job."""
    task_description: str
    documents: List[PerDocumentSummary] = Field(default_factory=list)
    overall_summary: str = ""
    recommendations: List[str] = Field(default_factory=list)
    generated_report_path: Optional[str] = None
