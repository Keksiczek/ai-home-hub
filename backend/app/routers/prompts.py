"""Prompts router – AI-assisted prompt generation."""

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import PromptGeneratorRequest, PromptGeneratorResponse
from app.services.llm_service import LLMService

router = APIRouter()
logger = logging.getLogger(__name__)

_TASK_DESCRIPTIONS = {
    "chat": "konverzaci / dotazu na AI asistenta",
    "kb_search": "sémantickém vyhledávání v Knowledge Base",
    "resident_mission": "dlouhodobé misi Resident agenta",
    "file_analysis": "analýze dokumentu nebo souboru",
}

_TONE_DESCRIPTIONS = {
    "professional": "formálním, profesionálním tónem",
    "casual": "neformálním, přátelským tónem",
    "technical": "technickým, přesným tónem s terminologií",
}

_EXAMPLE_USAGE = {
    "chat": "Zkopíruj do chatovacího pole a odešli.",
    "kb_search": "Vlož do pole pro dotaz v Knowledge Base.",
    "resident_mission": "Použij jako cíl mise v Resident Agent → Mise.",
    "file_analysis": "Vlož do pole pro analýzu dokumentu v Jobs → Nová analýza.",
}

_SYSTEM_PROMPT = """Jsi expert na tvorbu promptů pro lokální AI systém (AI Home Hub).
Uživatel ti dá typ úkolu, kontext a tón.
Tvým úkolem je vygenerovat JEDEN, krátký a efektivní prompt v češtině (max 3 věty).
Vrať POUZE finální text promptu – žádný úvod, žádné vysvětlení, žádné uvozovky."""


@router.post(
    "/prompts/generate", response_model=PromptGeneratorResponse, tags=["prompts"]
)
async def generate_prompt(req: PromptGeneratorRequest) -> dict:
    """Generate an optimised prompt for the given task using the LLM."""
    task_desc = _TASK_DESCRIPTIONS.get(req.task_type, req.task_type)
    tone_desc = _TONE_DESCRIPTIONS.get(req.tone, req.tone)

    context_part = (
        f"\nKontext od uživatele: {req.context}" if req.context.strip() else ""
    )
    user_message = (
        f"Vygeneruj prompt pro {task_desc}, {tone_desc}.{context_part}\n"
        "Prompt musí být konkrétní, srozumitelný a ihned použitelný."
    )

    try:
        llm = LLMService()
        reply, meta = await llm.generate(
            message=user_message,
            mode="general",
            history=[{"role": "system", "content": _SYSTEM_PROMPT}],
            for_overnight=False,
        )

        if meta.get("status") == "llm_unavailable":
            raise HTTPException(
                status_code=503, detail="LLM nedostupné – zkontroluj Ollama."
            )

        generated = reply.strip().strip('"').strip("'")
        if not generated:
            raise HTTPException(status_code=500, detail="LLM vrátil prázdnou odpověď.")

        example = _EXAMPLE_USAGE.get(req.task_type, "Vkopíruj do příslušného pole.")
        return {"generated_prompt": generated, "example_usage": example}

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Prompt generation failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
