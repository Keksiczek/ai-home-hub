"""Tests for Pydantic model validation (4E – unified schemas)."""

import pytest
from pydantic import ValidationError

from app.models.schemas import (
    AddMemoryRequest,
    BaseResponse,
    ChatRequest,
    KBSearchRequest,
    MultimodalChatRequest,
    MultimodalImageData,
    SearchMemoryRequest,
    SpawnSubAgentRequest,
    SummarizeSessionRequest,
    UpdateMemoryRequest,
)


class TestBaseResponse:
    def test_minimal(self):
        r = BaseResponse(data={"key": "value"})
        assert r.data == {"key": "value"}
        assert r.meta is None
        assert r.request_id is None

    def test_full(self):
        r = BaseResponse(data=[1, 2], meta={"page": 1}, request_id="abc12345")
        assert r.request_id == "abc12345"
        assert r.meta == {"page": 1}

    def test_data_accepts_any_type(self):
        for val in ("string", 42, [1, 2], {"nested": True}, None):
            r = BaseResponse(data=val)
            assert r.data == val


class TestKBSearchRequest:
    def test_valid(self):
        r = KBSearchRequest(query="hello")
        assert r.top_k == 5

    def test_empty_query_rejected(self):
        with pytest.raises(ValidationError):
            KBSearchRequest(query="")

    def test_top_k_bounds(self):
        with pytest.raises(ValidationError):
            KBSearchRequest(query="ok", top_k=0)
        with pytest.raises(ValidationError):
            KBSearchRequest(query="ok", top_k=51)


class TestAddMemoryRequest:
    def test_defaults(self):
        r = AddMemoryRequest(text="some fact")
        assert r.importance == 5
        assert r.tags == []
        assert r.source == ""

    def test_empty_text_rejected(self):
        with pytest.raises(ValidationError):
            AddMemoryRequest(text="")


class TestSpawnSubAgentRequest:
    def test_valid_types(self):
        for t in ("general", "code", "research", "testing", "devops"):
            r = SpawnSubAgentRequest(task="do stuff", agent_type=t)
            assert r.agent_type == t

    def test_invalid_type_rejected(self):
        with pytest.raises(ValidationError):
            SpawnSubAgentRequest(task="do stuff", agent_type="invalid")


class TestMultimodalChatRequest:
    def test_defaults(self):
        r = MultimodalChatRequest(message="hi")
        assert r.images == []
        assert r.mode == "general"
        assert r.profile is None
