"""Creative Studio service – game, OpenSCAD, and ASCII generation via Ollama."""

import asyncio
import json
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from app.db.creative import get_creative_db
from app.services.llm_providers.ollama import OllamaProvider
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────

MAX_HTML_SIZE = 300 * 1024  # 300 KB
MAX_SCAD_SIZE = 100 * 1024  # 100 KB
MAX_ASCII_LINES = 200
DEFAULT_MODEL = "qwen2.5:latest"

# ── System prompts ─────────────────────────────────────────────

GAME_SYSTEM_PROMPT = """\
You are a senior HTML5 game developer.
Generate a complete, self-contained browser game in a single HTML document.

Rules:
- Output ONLY raw HTML, no markdown fences, no explanation.
- Use only vanilla JavaScript, HTML, and CSS.
- No external libraries.
- Must work offline.
- Must render inside an iframe.
- Include:
  - <title>
  - responsive layout
  - canvas or DOM gameplay
  - keyboard controls on desktop
  - touch controls on mobile
  - visible score or status
  - restart/game over flow
- Keep the game simple and stable.
- Avoid excessive code size.
- Do not use alert(), prompt(), confirm(), localStorage, sessionStorage, window.open(), top navigation, or network calls."""

SCAD_SYSTEM_PROMPT = """\
You are an OpenSCAD expert.
Generate valid OpenSCAD code for the described object.

Rules:
- Output ONLY raw OpenSCAD code, no markdown fences, no explanation.
- Use simple, robust primitives and transforms.
- Prefer: cube, sphere, cylinder, union, difference, intersection, hull, translate, rotate, scale.
- Keep the model printable and reasonably simple.
- Include brief comments inside the SCAD code only when useful.
- The object should be centered near origin when possible."""

ASCII_SYSTEM_PROMPT = """\
You are an ASCII artist.
Generate clean ASCII art for the requested subject.

Rules:
- Output ONLY the ASCII art.
- Keep width close to the requested width.
- Use readable monospace-safe characters.
- No explanation."""


def _get_ollama_url() -> str:
    from app.services.settings_service import LOCAL_LLM_BASE_URL

    try:
        svc = get_settings_service()
        cfg = svc.load()
        return cfg.get("ollama", {}).get("url", LOCAL_LLM_BASE_URL)
    except Exception:
        return LOCAL_LLM_BASE_URL


def _resolve_model(model: Optional[str]) -> str:
    if model and model.strip():
        return model.strip()
    return DEFAULT_MODEL


# ── LLM call wrapper ──────────────────────────────────────────


async def _call_ollama(
    system_prompt: str,
    user_prompt: str,
    model: str,
    timeout: float = 120.0,
) -> Tuple[str, List[str]]:
    """Call Ollama and return (response_text, warnings)."""
    warnings: List[str] = []
    provider = OllamaProvider(base_url=_get_ollama_url())

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        text, meta = await provider.generate(
            messages=messages,
            model=model,
            options={"num_predict": 8192},
            timeout=timeout,
        )
    except Exception as exc:
        logger.error("Ollama call failed for creative generation: %s", exc)
        raise RuntimeError(f"Ollama nedostupná nebo model selhal: {exc}") from exc

    if not text or not text.strip():
        raise RuntimeError("Model vrátil prázdnou odpověď")

    return text.strip(), warnings


# ── HTML sanitization / wrapping ──────────────────────────────


def _strip_markdown_fences(text: str) -> str:
    """Remove ```html ... ``` or ``` ... ``` wrapping."""
    text = text.strip()
    # Remove opening fence
    text = re.sub(r'^```(?:html|HTML)?\s*\n?', '', text)
    # Remove closing fence
    text = re.sub(r'\n?```\s*$', '', text)
    return text.strip()


def _extract_title_from_html(html: str) -> str:
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    if m:
        return m.group(1).strip()[:100]
    return ""


def _sanitize_game_html(raw: str, prompt: str) -> Tuple[str, str, str, List[str]]:
    """Sanitize game HTML. Returns (title, html, preview_html, warnings)."""
    warnings: List[str] = []
    html = _strip_markdown_fences(raw)

    # Size check
    if len(html) > MAX_HTML_SIZE:
        html = html[:MAX_HTML_SIZE]
        warnings.append("Výstup byl oříznut na 300 KB")

    title = _extract_title_from_html(html)
    if not title:
        title = prompt[:60].strip().title()

    # Check if it looks like valid HTML
    is_html_doc = bool(re.search(r'<html|<!doctype|<body|<head', html, re.IGNORECASE))

    if is_html_doc:
        preview_html = html
        # Add viewport meta if missing
        if '<meta name="viewport"' not in html.lower():
            viewport = '<meta name="viewport" content="width=device-width, initial-scale=1">'
            if '<head>' in html.lower():
                preview_html = re.sub(
                    r'(<head[^>]*>)',
                    rf'\1\n{viewport}',
                    preview_html,
                    count=1,
                    flags=re.IGNORECASE,
                )
            else:
                preview_html = viewport + '\n' + preview_html
                warnings.append("Přidán viewport meta tag")
    else:
        # Wrap in a basic HTML shell
        warnings.append("Výstup nebyl kompletní HTML dokument – zabalen do HTML shellu")
        preview_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>body {{ margin: 0; padding: 16px; background: #1a1a2e; color: #e0e0e0; font-family: monospace; }}</style>
</head>
<body>
<pre>{html}</pre>
</body>
</html>"""

    return title, html, preview_html, warnings


# ── OpenSCAD preview_spec parser ──────────────────────────────


def _parse_scad_preview(scad_code: str) -> Dict[str, Any]:
    """Heuristic parser for simple OpenSCAD primitives → preview_spec JSON."""
    objects: List[Dict[str, Any]] = []

    # Track current transform context (simplified – only top-level transforms)
    lines = scad_code.split('\n')
    current_translate = [0, 0, 0]
    current_rotate = [0, 0, 0]

    for line in lines:
        line_stripped = line.strip()
        if line_stripped.startswith('//'):
            continue

        # Parse translate
        t_match = re.search(r'translate\s*\(\s*\[([^\]]+)\]', line_stripped)
        if t_match:
            try:
                vals = [float(v.strip()) for v in t_match.group(1).split(',')]
                current_translate = (vals + [0, 0, 0])[:3]
            except (ValueError, IndexError):
                pass

        # Parse rotate
        r_match = re.search(r'rotate\s*\(\s*\[([^\]]+)\]', line_stripped)
        if r_match:
            try:
                vals = [float(v.strip()) for v in r_match.group(1).split(',')]
                current_rotate = (vals + [0, 0, 0])[:3]
            except (ValueError, IndexError):
                pass

        # Parse cube
        cube_match = re.search(r'cube\s*\(\s*(?:\[([^\]]+)\]|(\d+\.?\d*))', line_stripped)
        if cube_match:
            try:
                if cube_match.group(1):
                    size = [float(v.strip()) for v in cube_match.group(1).split(',')]
                    size = (size + [1, 1, 1])[:3]
                else:
                    s = float(cube_match.group(2))
                    size = [s, s, s]
                objects.append({
                    "type": "cube",
                    "size": size,
                    "position": list(current_translate),
                    "rotation": list(current_rotate),
                })
            except (ValueError, IndexError):
                pass

        # Parse sphere
        sphere_match = re.search(r'sphere\s*\(\s*(?:r\s*=\s*)?(\d+\.?\d*)', line_stripped)
        if sphere_match:
            try:
                r = float(sphere_match.group(1))
                objects.append({
                    "type": "sphere",
                    "r": r,
                    "position": list(current_translate),
                    "rotation": list(current_rotate),
                })
            except ValueError:
                pass

        # Parse cylinder
        cyl_match = re.search(r'cylinder\s*\(([^)]+)\)', line_stripped)
        if cyl_match:
            try:
                params = cyl_match.group(1)
                h_m = re.search(r'h\s*=\s*(\d+\.?\d*)', params)
                r_m = re.search(r'(?<![r12])r\s*=\s*(\d+\.?\d*)', params)
                r1_m = re.search(r'r1\s*=\s*(\d+\.?\d*)', params)
                r2_m = re.search(r'r2\s*=\s*(\d+\.?\d*)', params)
                d_m = re.search(r'(?<![r12])d\s*=\s*(\d+\.?\d*)', params)

                h = float(h_m.group(1)) if h_m else 10
                if r_m:
                    r = float(r_m.group(1))
                elif d_m:
                    r = float(d_m.group(1)) / 2
                elif r1_m:
                    r = float(r1_m.group(1))
                else:
                    r = 5

                obj: Dict[str, Any] = {
                    "type": "cylinder",
                    "h": h,
                    "r": r,
                    "position": list(current_translate),
                    "rotation": list(current_rotate),
                }
                if r1_m and r2_m:
                    obj["r1"] = float(r1_m.group(1))
                    obj["r2"] = float(r2_m.group(1))
                objects.append(obj)
            except (ValueError, AttributeError):
                pass

        # Reset transforms after a primitive (simplified heuristic)
        if any(p in line_stripped for p in ('cube(', 'sphere(', 'cylinder(')):
            current_translate = [0, 0, 0]
            current_rotate = [0, 0, 0]

    if not objects:
        return {"objects": [], "raw_only": True}

    return {
        "units": "mm",
        "objects": objects,
        "camera": {"yaw": 35, "pitch": 20, "zoom": 1.1},
    }


def _sanitize_scad(raw: str, prompt: str) -> Tuple[str, str, Dict[str, Any], List[str]]:
    """Sanitize SCAD output. Returns (title, scad_code, preview_spec, warnings)."""
    warnings: List[str] = []
    code = _strip_markdown_fences(raw)

    if len(code) > MAX_SCAD_SIZE:
        code = code[:MAX_SCAD_SIZE]
        warnings.append("SCAD kód byl oříznut na 100 KB")

    # Try to extract title from first comment
    title_match = re.search(r'//\s*(.+)', code)
    title = title_match.group(1).strip()[:80] if title_match else prompt[:60].strip().title()

    preview_spec = _parse_scad_preview(code)
    if preview_spec.get("raw_only"):
        warnings.append("Preview nedostupný pro tuto SCAD strukturu – kód je stále platný")

    return title, code, preview_spec, warnings


def _sanitize_ascii(raw: str, prompt: str, width: int) -> Tuple[str, str, List[str]]:
    """Sanitize ASCII art output. Returns (title, art, warnings)."""
    warnings: List[str] = []
    art = _strip_markdown_fences(raw)

    lines = art.split('\n')
    if len(lines) > MAX_ASCII_LINES:
        lines = lines[:MAX_ASCII_LINES]
        warnings.append(f"ASCII art oříznut na {MAX_ASCII_LINES} řádků")

    # Width guard
    trimmed_lines = []
    for line in lines:
        if len(line) > width + 20:
            line = line[:width + 20]
        trimmed_lines.append(line)

    art = '\n'.join(trimmed_lines).strip()
    title = prompt[:60].strip().title()

    return title, art, warnings


# ── Public API ─────────────────────────────────────────────────


async def generate_game(
    prompt: str, model: Optional[str] = None
) -> Dict[str, Any]:
    model = _resolve_model(model)
    raw, call_warnings = await _call_ollama(GAME_SYSTEM_PROMPT, prompt, model)
    title, html, preview_html, san_warnings = _sanitize_game_html(raw, prompt)

    result = {
        "title": title,
        "html": html,
        "preview_html": preview_html,
        "prompt": prompt,
        "model": model,
        "warnings": call_warnings + san_warnings,
    }

    # Save to history
    await _save_history("game", title, prompt, model, title, result)
    return result


async def generate_scad(
    prompt: str, model: Optional[str] = None
) -> Dict[str, Any]:
    model = _resolve_model(model)
    raw, call_warnings = await _call_ollama(SCAD_SYSTEM_PROMPT, prompt, model)
    title, scad_code, preview_spec, san_warnings = _sanitize_scad(raw, prompt)

    result = {
        "title": title,
        "scad_code": scad_code,
        "preview_spec": preview_spec,
        "prompt": prompt,
        "model": model,
        "warnings": call_warnings + san_warnings,
    }

    # Save to history – preview is first 200 chars of SCAD code
    await _save_history("scad", title, prompt, model, scad_code[:200], result)
    return result


async def generate_ascii(
    prompt: str, model: Optional[str] = None, width: int = 60
) -> Dict[str, Any]:
    model = _resolve_model(model)
    ascii_prompt = f"{prompt}\n\nTarget width: approximately {width} characters."
    raw, call_warnings = await _call_ollama(ASCII_SYSTEM_PROMPT, ascii_prompt, model)
    title, art, san_warnings = _sanitize_ascii(raw, prompt, width)

    result = {
        "title": title,
        "art": art,
        "prompt": prompt,
        "model": model,
        "warnings": call_warnings + san_warnings,
    }

    # Save to history – preview is first 3 lines
    preview = '\n'.join(art.split('\n')[:3])
    await _save_history("ascii", title, prompt, model, preview, result)
    return result


async def list_history(limit: int = 20) -> List[Dict[str, Any]]:
    db = get_creative_db()
    return await asyncio.to_thread(db.list_items, limit)


async def get_history_item(item_id: str) -> Optional[Dict[str, Any]]:
    db = get_creative_db()
    return await asyncio.to_thread(db.get_item, item_id)


async def _save_history(
    item_type: str,
    title: str,
    prompt: str,
    model: str,
    result_preview: str,
    payload: Dict[str, Any],
) -> None:
    db = get_creative_db()
    item_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    try:
        await asyncio.to_thread(
            db.save,
            item_id=item_id,
            item_type=item_type,
            title=title,
            prompt=prompt,
            model=model,
            result_preview=result_preview[:500],
            payload=payload,
            created_at=created_at,
        )
    except Exception:
        logger.exception("Failed to save creative history item")
