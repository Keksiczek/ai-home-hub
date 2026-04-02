"""Pydantic models for Creative Studio endpoints."""

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class CreativeGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000)
    model: Optional[str] = None

    @field_validator("prompt", mode="before")
    @classmethod
    def strip_prompt(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Prompt nesmí být prázdný")
        return v


class AsciiGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000)
    model: Optional[str] = None
    width: int = Field(default=60, ge=20, le=200)

    @field_validator("prompt", mode="before")
    @classmethod
    def strip_prompt(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Prompt nesmí být prázdný")
        return v


class GameGenerateResponse(BaseModel):
    title: str
    html: str
    preview_html: str
    prompt: str
    model: str
    warnings: list[str] = []


class ScadGenerateResponse(BaseModel):
    title: str
    scad_code: str
    preview_spec: dict
    prompt: str
    model: str
    warnings: list[str] = []


class AsciiGenerateResponse(BaseModel):
    title: str
    art: str
    prompt: str
    model: str
    warnings: list[str] = []


class CreativeHistoryItem(BaseModel):
    id: str
    type: str
    title: str
    prompt: str
    model: str
    created_at: str
    result_preview: str


class CreativeHistoryResponse(BaseModel):
    items: list[CreativeHistoryItem]


class CreativeHistoryDetail(BaseModel):
    id: str
    type: str
    title: str
    prompt: str
    model: str
    created_at: str
    payload: dict
