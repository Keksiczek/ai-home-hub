"""WhisperService – local audio/video transcription via faster-whisper or openai-whisper."""

import asyncio
import logging
import os
import shutil
import tempfile
import time
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

from pydantic import BaseModel

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

SUPPORTED_FORMATS = {".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm", ".mov"}
VIDEO_FORMATS = {".mp4", ".webm", ".mov"}

# Detect available backend
_backend: Optional[str] = None


def _detect_backend() -> str:
    global _backend
    if _backend:
        return _backend

    try:
        import faster_whisper  # noqa: F401

        _backend = "faster-whisper"
        logger.info("Whisper backend: faster-whisper")
        return _backend
    except ImportError:
        pass

    try:
        import whisper  # noqa: F401

        _backend = "openai-whisper"
        logger.info("Whisper backend: openai-whisper")
        return _backend
    except ImportError:
        pass

    raise ImportError(
        "Neither faster-whisper nor openai-whisper is installed. "
        "Install one of them:\n"
        "  pip install faster-whisper   (recommended, faster)\n"
        "  pip install openai-whisper   (fallback)"
    )


def _check_ffmpeg() -> bool:
    """Return True if ffmpeg is available on PATH."""
    return shutil.which("ffmpeg") is not None


class TranscriptResult(BaseModel):
    """Result of a transcription."""

    text: str
    segments: List[Dict[str, Any]]
    language: str
    duration_seconds: float
    model_used: str


async def transcribe(
    file_path: str,
    language: Optional[str] = None,
    model: Optional[str] = None,
    progress_callback: Optional[Callable] = None,
) -> TranscriptResult:
    """Transcribe an audio or video file using the best available Whisper backend.

    Args:
        file_path: Path to the audio/video file.
        language: Language code (e.g. 'cs', 'en'). None for auto-detect.
        model: Whisper model name override. Uses settings if None.
        progress_callback: Optional async callable(percent: float) for progress reporting.

    Returns:
        TranscriptResult with full text, segments, language, duration, and model info.
    """
    backend = _detect_backend()
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = path.suffix.lower()
    if suffix not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported format: {suffix}. Supported: {', '.join(sorted(SUPPORTED_FORMATS))}"
        )

    # Load settings for model config
    settings = get_settings_service().load()
    whisper_settings = settings.get("whisper_settings", {})
    model_name = model or whisper_settings.get("model", "base")
    device = whisper_settings.get("device", "cpu")
    compute_type = whisper_settings.get("compute_type", "int8")

    # Extract audio from video if needed
    audio_path = file_path
    tmp_wav = None
    if suffix in VIDEO_FORMATS:
        if not _check_ffmpeg():
            raise RuntimeError(
                "ffmpeg is required for video transcription but not found. "
                "Install it: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)"
            )
        tmp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp_wav.close()
        audio_path = tmp_wav.name
        logger.info("Extracting audio from video: %s -> %s", file_path, audio_path)

        proc = await asyncio.create_subprocess_exec(
            "ffmpeg",
            "-i",
            file_path,
            "-vn",
            "-acodec",
            "pcm_s16le",
            "-ar",
            "16000",
            "-ac",
            "1",
            "-y",
            audio_path,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        await proc.wait()
        if proc.returncode != 0:
            _cleanup_temp(tmp_wav)
            raise RuntimeError(
                f"ffmpeg audio extraction failed (exit code {proc.returncode})"
            )

    try:
        if backend == "faster-whisper":
            result = await _transcribe_faster_whisper(
                audio_path,
                model_name,
                device,
                compute_type,
                language,
                progress_callback,
            )
        else:
            result = await _transcribe_openai_whisper(
                audio_path, model_name, device, language, progress_callback
            )
    finally:
        _cleanup_temp(tmp_wav)

    return result


def _cleanup_temp(tmp_file):
    """Remove temporary file if it exists."""
    if tmp_file and os.path.exists(tmp_file.name):
        try:
            os.unlink(tmp_file.name)
        except OSError:
            pass


async def _transcribe_faster_whisper(
    audio_path: str,
    model_name: str,
    device: str,
    compute_type: str,
    language: Optional[str],
    progress_callback: Optional[Callable],
) -> TranscriptResult:
    """Transcribe using faster-whisper."""
    from faster_whisper import WhisperModel

    loop = asyncio.get_event_loop()

    def _run():
        t0 = time.monotonic()
        logger.info(
            "Loading faster-whisper model '%s' (device=%s, compute=%s)",
            model_name,
            device,
            compute_type,
        )
        whisper_model = WhisperModel(
            model_name, device=device, compute_type=compute_type
        )
        load_time = time.monotonic() - t0
        logger.info("Model loaded in %.1fs", load_time)

        t1 = time.monotonic()
        kwargs = {}
        if language:
            kwargs["language"] = language

        segments_iter, info = whisper_model.transcribe(audio_path, **kwargs)

        segments = []
        full_text_parts = []
        duration = info.duration if info.duration else 0.0

        for seg in segments_iter:
            segments.append(
                {
                    "start": round(seg.start, 2),
                    "end": round(seg.end, 2),
                    "text": seg.text.strip(),
                }
            )
            full_text_parts.append(seg.text.strip())

            # Report progress based on segment end vs total duration
            if progress_callback and duration > 0:
                pct = min((seg.end / duration) * 100, 100)
                asyncio.run_coroutine_threadsafe(progress_callback(pct), loop)

        transcription_time = time.monotonic() - t1
        logger.info(
            "Transcription completed in %.1fs (%.1fs audio)",
            transcription_time,
            duration,
        )

        return TranscriptResult(
            text=" ".join(full_text_parts),
            segments=segments,
            language=info.language or "unknown",
            duration_seconds=round(duration, 2),
            model_used=f"faster-whisper/{model_name}",
        )

    return await asyncio.get_event_loop().run_in_executor(None, _run)


async def _transcribe_openai_whisper(
    audio_path: str,
    model_name: str,
    device: str,
    language: Optional[str],
    progress_callback: Optional[Callable],
) -> TranscriptResult:
    """Transcribe using openai-whisper."""
    import whisper

    loop = asyncio.get_event_loop()

    def _run():
        t0 = time.monotonic()
        logger.info("Loading openai-whisper model '%s' (device=%s)", model_name, device)
        whisper_model = whisper.load_model(model_name, device=device)
        load_time = time.monotonic() - t0
        logger.info("Model loaded in %.1fs", load_time)

        if progress_callback:
            asyncio.run_coroutine_threadsafe(progress_callback(5.0), loop)

        t1 = time.monotonic()
        kwargs = {"verbose": False}
        if language:
            kwargs["language"] = language

        result = whisper_model.transcribe(audio_path, **kwargs)

        if progress_callback:
            asyncio.run_coroutine_threadsafe(progress_callback(90.0), loop)

        segments = []
        for seg in result.get("segments", []):
            segments.append(
                {
                    "start": round(seg["start"], 2),
                    "end": round(seg["end"], 2),
                    "text": seg["text"].strip(),
                }
            )

        duration = segments[-1]["end"] if segments else 0.0
        transcription_time = time.monotonic() - t1
        logger.info(
            "Transcription completed in %.1fs (%.1fs audio)",
            transcription_time,
            duration,
        )

        detected_lang = result.get("language", "unknown")

        return TranscriptResult(
            text=result.get("text", "").strip(),
            segments=segments,
            language=detected_lang,
            duration_seconds=round(duration, 2),
            model_used=f"openai-whisper/{model_name}",
        )

    return await asyncio.get_event_loop().run_in_executor(None, _run)
