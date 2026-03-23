"""Per-document LLM summarization with chunking support (DA4).

For long documents the text is split into chunks, each chunk gets a partial
summary, and partial summaries are merged into a final PerDocumentSummary.
"""

from __future__ import annotations

import json
import logging
import re
from typing import TYPE_CHECKING, Any, Dict, Optional

from app.models.document_analysis_models import PerDocumentSummary

if TYPE_CHECKING:
    from app.services.document_analysis_engine import ParsedDocument

logger = logging.getLogger(__name__)


# Max characters per chunk sent to LLM (conservative to fit context windows)
_CHUNK_SIZE = 3000
_CHUNK_OVERLAP = 200


async def summarize_document(
    doc: Any,  # ParsedDocument
    task_description: str,
    llm_profile: Optional[str],
    language: str = "cs",
) -> PerDocumentSummary:
    """Summarize a single parsed document, handling long texts via chunking."""
    from app.services.llm_service import get_llm_service
    from app.utils.text_chunker import chunk_text

    llm = get_llm_service()
    text = doc.text

    chunks = chunk_text(text, chunk_size=_CHUNK_SIZE, overlap=_CHUNK_OVERLAP)
    if not chunks:
        chunks = [text[:_CHUNK_SIZE]]

    lang_instruction = (
        "Odpovídej česky." if language == "cs" else f"Respond in {language}."
    )

    total_tokens = 0

    if len(chunks) == 1:
        # Single-chunk: direct summarization
        summary_data, tokens = await _summarize_single(
            llm, chunks[0], doc.title, task_description, llm_profile, lang_instruction
        )
        total_tokens += tokens
    else:
        # Multi-chunk: iterative summarization
        partial_summaries = []
        for i, chunk in enumerate(chunks):
            partial, tokens = await _summarize_chunk(
                llm,
                chunk,
                i + 1,
                len(chunks),
                doc.title,
                task_description,
                llm_profile,
                lang_instruction,
            )
            partial_summaries.append(partial)
            total_tokens += tokens

        # Merge partial summaries
        summary_data, tokens = await _merge_partial_summaries(
            llm,
            partial_summaries,
            doc.title,
            task_description,
            llm_profile,
            lang_instruction,
        )
        total_tokens += tokens

    return PerDocumentSummary(
        file_path=doc.file_path,
        title=summary_data.get("title", doc.title),
        summary=summary_data.get("summary", ""),
        key_points=summary_data.get("key_points", []),
        risks_or_gaps=summary_data.get("risks_or_gaps", []),
        metrics=summary_data.get("metrics", {}),
        tokens_used=total_tokens,
    )


async def _summarize_single(
    llm, text, title, task_description, profile, lang_instruction
):
    """Summarize a short document (single chunk)."""
    prompt = f"""{lang_instruction}
Analyzuj následující dokument a vytvoř strukturované shrnutí.

Úloha: {task_description}
Dokument: {title}

Text dokumentu:
{text}

Odpověz PŘESNĚ v tomto JSON formátu (žádný další text):
{{
  "title": "název dokumentu",
  "summary": "stručné shrnutí (2-3 věty)",
  "key_points": ["bod 1", "bod 2", "bod 3"],
  "risks_or_gaps": ["riziko nebo mezera 1", "riziko 2"],
  "metrics": {{"metrika1": "hodnota1", "metrika2": "hodnota2"}}
}}"""

    try:
        reply, meta = await llm.generate(
            message=prompt, mode="general", profile=profile
        )
        tokens = meta.get("tokens_estimated", 0)
        parsed = _parse_json_response(reply)
        if not parsed.get("summary"):
            parsed["summary"] = reply[:500]
        return parsed, tokens
    except Exception as exc:
        logger.error("Single-chunk summarization failed for %s: %s", title, exc)
        return {
            "title": title,
            "summary": f"Summarization failed: {exc}",
            "key_points": [],
            "risks_or_gaps": [],
            "metrics": {},
        }, 0


async def _summarize_chunk(
    llm,
    chunk_text_content,
    chunk_idx,
    total_chunks,
    title,
    task_description,
    profile,
    lang_instruction,
):
    """Summarize a single chunk of a long document."""
    prompt = f"""{lang_instruction}
Toto je část {chunk_idx}/{total_chunks} dokumentu "{title}".
Úloha: {task_description}

Text:
{chunk_text_content}

Vytvoř stručné shrnutí této části (2-3 věty) a seznam klíčových bodů.
Odpověz PŘESNĚ v JSON:
{{
  "partial_summary": "shrnutí této části",
  "key_points": ["bod 1", "bod 2"]
}}"""

    try:
        reply, meta = await llm.generate(
            message=prompt, mode="general", profile=profile
        )
        tokens = meta.get("tokens_estimated", 0)
        parsed = _parse_json_response(reply)
        if not parsed.get("partial_summary"):
            parsed["partial_summary"] = reply[:300]
        return parsed, tokens
    except Exception as exc:
        logger.warning(
            "Chunk %d/%d summarization failed: %s", chunk_idx, total_chunks, exc
        )
        return {
            "partial_summary": f"Chunk {chunk_idx} failed: {exc}",
            "key_points": [],
        }, 0


async def _merge_partial_summaries(
    llm, partials, title, task_description, profile, lang_instruction
):
    """Merge partial summaries into a final document summary."""
    partials_text = ""
    all_key_points = []
    for i, p in enumerate(partials, 1):
        partials_text += f"\nČást {i}: {p.get('partial_summary', '')}\n"
        all_key_points.extend(p.get("key_points", []))

    prompt = f"""{lang_instruction}
Na základě následujících dílčích shrnutí dokumentu "{title}" vytvoř celkové strukturované shrnutí.
Úloha: {task_description}

Dílčí shrnutí:
{partials_text}

Dílčí klíčové body: {'; '.join(all_key_points[:20])}

Odpověz PŘESNĚ v tomto JSON formátu (žádný další text):
{{
  "title": "název dokumentu",
  "summary": "celkové shrnutí (2-3 věty)",
  "key_points": ["bod 1", "bod 2", "bod 3"],
  "risks_or_gaps": ["riziko nebo mezera 1"],
  "metrics": {{"metrika1": "hodnota1"}}
}}"""

    try:
        reply, meta = await llm.generate(
            message=prompt, mode="general", profile=profile
        )
        tokens = meta.get("tokens_estimated", 0)
        parsed = _parse_json_response(reply)
        if not parsed.get("summary"):
            parsed["summary"] = reply[:500]
        return parsed, tokens
    except Exception as exc:
        logger.error("Merge summarization failed for %s: %s", title, exc)
        combined = " ".join(p.get("partial_summary", "") for p in partials)
        return {
            "title": title,
            "summary": combined[:500],
            "key_points": all_key_points[:10],
            "risks_or_gaps": [],
            "metrics": {},
        }, 0


def _parse_json_response(text: str) -> Dict[str, Any]:
    """Try to extract JSON from LLM response text."""
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            pass

    return {}
