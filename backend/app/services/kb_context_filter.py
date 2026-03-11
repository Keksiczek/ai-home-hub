"""
KB Context Filter – summarizační bariéra mezi RAG výsledky a agent kontextem.

RAG výsledky NIKDY nejdou raw do hlavního LLM kontextu.
Vždy projdou tímto filtrem který extrahuje max 5 bullet points.
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# WS event type
WS_EVENT_KB_FILTERED = "kb_context_filtered"


async def filter_kb_results(
    results: list[dict],
    query: str,
    llm_service,
) -> str:
    """
    Summarizační bariéra pro RAG výsledky.

    Vezme raw RAG výsledky (list {text, file_name, score}),
    extrahuje max 5 bullet points relevantních k dotazu.
    """
    if not results:
        return ""

    # Spoj texty výsledků
    combined_text = "\n\n---\n\n".join(
        f"[{r.get('file_name', 'unknown')}]: {r.get('text', '')}"
        for r in results
    )

    # Pokud celková délka < 500 znaků → vrať přímo
    if len(combined_text) < 500:
        return combined_text

    # Zavolej LLM s profilem "summarize"
    prompt = (
        f"Z následujících úryvků dokumentů extrahuj POUZE informace relevantní k dotazu: '{query}'\n\n"
        "Výstup: maximálně 5 odrážek, každá max 1 věta, pouze fakta z textu.\n"
        "Pokud úryvky neobsahují relevantní info, vrať prázdný string.\n\n"
        f"Dokumenty:\n{combined_text}"
    )

    try:
        reply, meta = await asyncio.wait_for(
            llm_service.generate(
                message=prompt,
                mode="general",
                profile="general",
            ),
            timeout=15.0,
        )
        if reply and reply.strip():
            return reply.strip()
    except asyncio.TimeoutError:
        logger.warning("KB filter LLM call timed out after 15s, using fallback")
    except Exception as exc:
        logger.error("KB filter LLM call failed: %s", exc)

    # Fallback: první 3 výsledky zkrácené na 200 znaků
    fallback_parts = []
    for r in results[:3]:
        text = r.get("text", "")[:200]
        fname = r.get("file_name", "")
        fallback_parts.append(f"- [{fname}] {text}")
    return "\n".join(fallback_parts)


async def compress_conversation_history(
    messages: list[dict],
    llm_service,
    max_messages: int = 20,
) -> list[dict]:
    """
    Komprese konverzační historie.

    Pokud je příliš dlouhá, starší zprávy shrne do jedné system zprávy.
    """
    if len(messages) <= max_messages:
        return messages

    # Vezme zprávy starší než posledních max_messages // 2
    keep_count = max_messages // 2
    old_messages = messages[:-keep_count]
    recent_messages = messages[-keep_count:]

    # Sestav text starých zpráv pro shrnutí
    old_text = "\n".join(
        f"{m.get('role', '?')}: {m.get('content', '')[:200]}"
        for m in old_messages
    )

    prompt = (
        "Shrň následující konverzaci do max 3 vět. "
        "Zachovej klíčová fakta a rozhodnutí.\n\n"
        f"{old_text}"
    )

    try:
        reply, meta = await asyncio.wait_for(
            llm_service.generate(
                message=prompt,
                mode="general",
                profile="general",
            ),
            timeout=15.0,
        )
        summary = reply.strip() if reply else "Předchozí konverzace byla zkomprimována."
    except Exception as exc:
        logger.warning("Conversation compression failed: %s", exc)
        summary = "Předchozí konverzace byla zkomprimována (shrnutí nedostupné)."

    # Nahraď staré zprávy jednou system zprávou
    compressed = [
        {"role": "system", "content": f"[Shrnutí předchozí konverzace]: {summary}"}
    ]
    compressed.extend(recent_messages)

    return compressed
