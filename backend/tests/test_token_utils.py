"""Tests for token estimation and context window management."""

import pytest

from app.utils.token_utils import (
    estimate_messages_tokens,
    estimate_tokens,
    get_model_context_limit,
    trim_messages_to_fit,
)


class TestEstimateTokens:
    def test_empty_string(self):
        assert estimate_tokens("") == 1  # min 1

    def test_short_text(self):
        # "hello" = 5 chars → 5 // 3 = 1
        assert estimate_tokens("hello") >= 1

    def test_longer_text(self):
        text = "a" * 300
        tokens = estimate_tokens(text)
        assert tokens == 100  # 300 // 3

    def test_czech_text(self):
        # Czech text with diacritics
        text = "Jak nainstalovat Python na macOS?"
        tokens = estimate_tokens(text)
        assert tokens > 5


class TestEstimateMessagesTokens:
    def test_single_message(self):
        msgs = [{"role": "user", "content": "Hello world"}]
        assert estimate_messages_tokens(msgs) > 0

    def test_multiple_messages(self):
        msgs = [
            {"role": "system", "content": "You are helpful."},
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello!"},
        ]
        total = estimate_messages_tokens(msgs)
        assert total > estimate_tokens("Hi")

    def test_empty_list(self):
        assert estimate_messages_tokens([]) == 0


class TestGetModelContextLimit:
    def test_known_model(self):
        assert get_model_context_limit("llama3.2") == 8192
        assert get_model_context_limit("llama3.2:latest") == 8192

    def test_large_context_model(self):
        assert get_model_context_limit("llama3.1:8b") == 131072

    def test_phi3(self):
        assert get_model_context_limit("phi3") == 4096

    def test_unknown_model_defaults(self):
        assert get_model_context_limit("totally-unknown-model") == 4096

    def test_case_insensitive(self):
        assert get_model_context_limit("Llama3.2") == 8192

    def test_qwen(self):
        assert get_model_context_limit("qwen2.5:7b") == 32768


class TestTrimMessagesToFit:
    def test_no_trimming_needed(self):
        msgs = [{"role": "user", "content": "Hi"}]
        result, trimmed = trim_messages_to_fit(msgs, max_tokens=1000)
        assert result == msgs
        assert trimmed is False

    def test_trims_oldest_messages(self):
        msgs = [
            {"role": "system", "content": "System"},
            {"role": "user", "content": "A" * 300},
            {"role": "assistant", "content": "B" * 300},
            {"role": "user", "content": "C" * 300},
            {"role": "assistant", "content": "D" * 300},
            {"role": "user", "content": "E" * 30},
            {"role": "assistant", "content": "F" * 30},
        ]
        result, trimmed = trim_messages_to_fit(msgs, max_tokens=200, preserve_last_n=2)
        assert trimmed is True
        # System message should be preserved
        assert result[0]["role"] == "system"
        # Last 2 should be preserved
        assert result[-1]["content"] == "F" * 30
        assert result[-2]["content"] == "E" * 30

    def test_preserves_system_messages(self):
        msgs = [
            {"role": "system", "content": "Important system context"},
            {"role": "user", "content": "X" * 900},
            {"role": "assistant", "content": "Y" * 900},
            {"role": "user", "content": "Z"},
            {"role": "assistant", "content": "W"},
        ]
        result, trimmed = trim_messages_to_fit(msgs, max_tokens=100, preserve_last_n=2)
        # System should still be there
        system_msgs = [m for m in result if m["role"] == "system"]
        assert len(system_msgs) == 1

    def test_preserve_last_n(self):
        msgs = [
            {"role": "user", "content": f"message number {i} " + "x" * 50}
            for i in range(10)
        ]
        result, trimmed = trim_messages_to_fit(msgs, max_tokens=100, preserve_last_n=4)
        assert trimmed is True
        # Last 4 should always be there
        assert "message number 9" in result[-1]["content"]
        assert "message number 6" in result[-4]["content"]
