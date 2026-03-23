"""Tests: Prometheus metrics text format parsing (mirrors JS parseMetric logic in Python)."""

import re
import pytest

# ── Pure-Python port of the JS parseMetric function ──────────────────────────


def parse_metric(text: str, name: str) -> float | None:
    """Parse a single metric value from Prometheus text format.

    Matches:
      metric_name value
      metric_name{label="val"} value
    Returns float or None if not found.
    """
    pattern = re.compile(
        rf"^{re.escape(name)}(?:\{{[^}}]*\}})?\s+([\d.e+\-]+)",
        re.MULTILINE,
    )
    m = pattern.search(text)
    if m:
        return float(m.group(1))
    return None


# ── Sample Prometheus text fixtures ──────────────────────────────────────────

SAMPLE_METRICS = """\
# HELP chat_requests_total Total number of chat requests
# TYPE chat_requests_total counter
chat_requests_total 42

# HELP chat_latency_seconds_sum Sum of chat latency
# TYPE chat_latency_seconds_sum gauge
chat_latency_seconds_sum 88.2

# HELP chat_latency_seconds_count Count for latency histogram
# TYPE chat_latency_seconds_count gauge
chat_latency_seconds_count 42

# HELP active_jobs Currently active jobs
# TYPE active_jobs gauge
active_jobs 3

# HELP agent_cycles_total Total agent execution cycles
# TYPE agent_cycles_total counter
agent_cycles_total 156

# HELP ollama_memory_bytes Ollama RSS memory usage
# TYPE ollama_memory_bytes gauge
ollama_memory_bytes 4081741824
"""

METRICS_WITH_LABELS = """\
# HELP http_requests_total Request count by method
http_requests_total{method="GET",status="200"} 1024
http_requests_total{method="POST",status="200"} 512
http_requests_total{method="POST",status="500"} 7
"""

EMPTY_METRICS = "# HELP nothing Nothing here\n"


# ── Tests ─────────────────────────────────────────────────────────────────────


class TestParseMetricBasic:
    """Core parsing of Prometheus text format."""

    def test_parse_chat_requests_total(self):
        val = parse_metric(SAMPLE_METRICS, "chat_requests_total")
        assert val == 42.0

    def test_parse_chat_latency_sum(self):
        val = parse_metric(SAMPLE_METRICS, "chat_latency_seconds_sum")
        assert val == 88.2

    def test_parse_active_jobs(self):
        val = parse_metric(SAMPLE_METRICS, "active_jobs")
        assert val == 3.0

    def test_parse_agent_cycles_total(self):
        val = parse_metric(SAMPLE_METRICS, "agent_cycles_total")
        assert val == 156.0

    def test_parse_ollama_memory_bytes(self):
        val = parse_metric(SAMPLE_METRICS, "ollama_memory_bytes")
        assert val == 4_081_741_824.0

    def test_missing_metric_returns_none(self):
        val = parse_metric(SAMPLE_METRICS, "nonexistent_metric")
        assert val is None

    def test_empty_metrics_returns_none(self):
        val = parse_metric(EMPTY_METRICS, "chat_requests_total")
        assert val is None


class TestParseMetricWithLabels:
    """Parsing metrics that include label selectors (first match returned)."""

    def test_parses_first_label_variant(self):
        val = parse_metric(METRICS_WITH_LABELS, "http_requests_total")
        assert val == 1024.0

    def test_unlabelled_metric_not_confused_with_labelled(self):
        # A metric without labels should still parse correctly if present
        text = 'my_gauge 99\nmy_gauge{env="prod"} 50\n'
        assert parse_metric(text, "my_gauge") == 99.0


class TestAverageChatLatency:
    """Derived metric: avg latency = sum / count."""

    def test_average_latency_calculation(self):
        total = parse_metric(SAMPLE_METRICS, "chat_latency_seconds_sum")
        count = parse_metric(SAMPLE_METRICS, "chat_latency_seconds_count")
        assert total is not None and count is not None and count > 0
        avg = round(total / count, 1)
        assert avg == 2.1  # 88.2 / 42 ≈ 2.1

    def test_average_latency_zero_count_safe(self):
        text = "chat_latency_seconds_sum 10\nchat_latency_seconds_count 0\n"
        total = parse_metric(text, "chat_latency_seconds_sum")
        count = parse_metric(text, "chat_latency_seconds_count")
        # Widget should guard against division by zero
        if count == 0:
            avg = None
        else:
            avg = total / count
        assert avg is None


class TestMetricsWidgetValues:
    """Widget displays meaningful defaults when metrics are absent."""

    def test_widget_shows_dash_for_missing_metrics(self):
        # Simulate JS logic: None -> "—"
        def format_metric(val):
            return "—" if val is None else str(val)

        assert format_metric(None) == "—"
        assert format_metric(42.0) == "42.0"

    def test_all_required_metrics_parseable(self):
        required = [
            "chat_requests_total",
            "chat_latency_seconds_sum",
            "chat_latency_seconds_count",
            "active_jobs",
            "agent_cycles_total",
        ]
        for metric in required:
            val = parse_metric(SAMPLE_METRICS, metric)
            assert val is not None, f"Failed to parse required metric: {metric}"
