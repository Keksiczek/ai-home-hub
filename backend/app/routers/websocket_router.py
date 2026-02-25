"""WebSocket router – real-time updates for agents, tasks, and notifications."""
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ws_manager import get_ws_manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """
    WebSocket endpoint for real-time updates.

    Clients receive JSON messages with:
    - type: "agent_update"  → agent progress
    - type: "task_update"   → background task progress
    - type: "notification"  → push notification
    - type: "ping"          → heartbeat
    """
    ws_manager = get_ws_manager()
    await ws_manager.connect(websocket)
    try:
        # Send connection acknowledgement
        await ws_manager.send_to(
            websocket,
            {"type": "connected", "message": "AI Home Hub WebSocket connected"},
        )
        # Keep the connection alive; handle incoming pings
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await ws_manager.send_to(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected normally")
    except Exception as exc:
        logger.debug("WebSocket error: %s", exc)
    finally:
        ws_manager.disconnect(websocket)
