"""WebSocket connection manager – broadcast messages to all connected clients."""
import asyncio
import json
import logging
from typing import Any, Dict, List

from fastapi import WebSocket

from app.services.metrics_service import ws_connected_clients, ws_messages_total

logger = logging.getLogger(__name__)

# WebSocket event type constants
WS_EVENT_RESOURCE_UPDATE = "resource_update"
WS_EVENT_RESIDENT_TICK = "resident_tick"
WS_EVENT_RESIDENT_ACTION = "resident_action"
WS_EVENT_KB_FILTERED = "kb_context_filtered"
WS_EVENT_NIGHT_JOB_STARTED = "night_job_started"
WS_EVENT_NIGHT_JOB_DONE = "night_job_done"
WS_EVENT_NIGHTLY_SUMMARY = "nightly_summary_ready"
WS_EVENT_JOB_UPDATE = "job_update"
WS_EVENT_JOB_COMPLETED = "job_completed"
WS_EVENT_JOB_FAILED = "job_failed"


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: List[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.append(websocket)
        ws_connected_clients.set(len(self._connections))
        logger.info("WS client connected. Total: %d", len(self._connections))

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self._connections:
            self._connections.remove(websocket)
        ws_connected_clients.set(len(self._connections))
        logger.info("WS client disconnected. Total: %d", len(self._connections))

    async def broadcast(self, message: Dict[str, Any]) -> None:
        """Send a JSON message to all connected clients in parallel.

        Uses asyncio.gather so a slow or dead client never blocks the event loop
        while other clients are being served. Disconnected clients are pruned
        automatically after each broadcast.
        """
        data = json.dumps(message)
        msg_type = message.get("type", "unknown")
        ws_messages_total.labels(type=msg_type).inc()
        async with self._lock:
            conns = list(self._connections)  # snapshot under lock
        if not conns:
            return
        results = await asyncio.gather(
            *[c.send_text(data) for c in conns],
            return_exceptions=True,
        )
        for conn, result in zip(conns, results):
            if isinstance(result, Exception):
                logger.debug("WS client disconnected during broadcast: %s", result)
                self.disconnect(conn)

    async def send_to(self, websocket: WebSocket, message: Dict[str, Any]) -> None:
        """Send a JSON message to a single client."""
        try:
            await websocket.send_json(message)
        except Exception as exc:
            logger.debug("Send to client failed: %s", exc)
            self.disconnect(websocket)

    @property
    def connection_count(self) -> int:
        return len(self._connections)


# Shared singleton
manager = ConnectionManager()


def get_ws_manager() -> ConnectionManager:
    return manager
