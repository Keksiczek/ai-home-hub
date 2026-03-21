"""WebSocket router – real-time updates for agents, tasks, and notifications."""
import asyncio
import json
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
    - type: "agent_update"      → agent progress
    - type: "task_update"       → background task progress
    - type: "notification"      → push notification
    - type: "activity_update"   → live activity bar data
    - type: "agent_status"      → resident agent live state
    - type: "pong"              → heartbeat reply

    Clients may send:
    - type: "ping"          → server replies with {"type": "pong"}
    """
    ws_manager = get_ws_manager()
    await ws_manager.connect(websocket)
    try:
        # Send connection acknowledgement
        await ws_manager.send_to(
            websocket,
            {"type": "connected", "message": "AI Home Hub WebSocket connected"},
        )
        # Keep the connection alive; handle incoming messages
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                # Ignore malformed frames – don't close the connection
                continue
            if data.get("type") == "ping":
                await ws_manager.send_to(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected normally")
    except Exception as exc:
        logger.debug("WebSocket error: %s", exc)
    finally:
        ws_manager.disconnect(websocket)


@router.websocket("/ws/activity")
async def ws_activity_endpoint(websocket: WebSocket) -> None:
    """Dedicated WebSocket for live activity bar updates (pushed every 3s)."""
    await websocket.accept()
    try:
        from app.services.activity_service import get_activity_service
        activity = get_activity_service()
        while True:
            snapshot = activity.get_snapshot()
            await websocket.send_json({"type": "activity_update", **snapshot})
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.debug("Activity WS error: %s", exc)


@router.websocket("/ws/jobs")
async def ws_jobs_endpoint(websocket: WebSocket) -> None:
    """WebSocket for real-time job lifecycle updates.

    Pushes job_update, job_completed, job_failed events.
    Also pushes periodic job queue snapshots every 5s.
    """
    ws_manager = get_ws_manager()
    await ws_manager.connect(websocket)
    try:
        await ws_manager.send_to(
            websocket,
            {"type": "connected", "channel": "jobs"},
        )
        while True:
            raw = await asyncio.wait_for(websocket.receive_text(), timeout=30)
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if data.get("type") == "ping":
                await ws_manager.send_to(websocket, {"type": "pong"})
    except (WebSocketDisconnect, asyncio.TimeoutError):
        pass
    except Exception as exc:
        logger.debug("Jobs WS error: %s", exc)
    finally:
        ws_manager.disconnect(websocket)


@router.websocket("/ws/agent-status")
async def ws_agent_status_endpoint(websocket: WebSocket) -> None:
    """Dedicated WebSocket for resident agent live status (pushed every 5s)."""
    await websocket.accept()
    try:
        from app.services.resident_agent import get_resident_agent
        agent = get_resident_agent()
        while True:
            state = agent.get_state()
            await websocket.send_json({
                "type": "agent_status",
                "status": state.get("status", "idle"),
                "current_thought": state.get("current_thought", ""),
                "last_action": state.get("last_action"),
                "cycle_count": state.get("tick_count", 0),
                "next_run_in": state.get("next_run_in", 0),
                "last_heartbeat": state.get("last_heartbeat"),
                "is_running": state.get("is_running", False),
            })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.debug("Agent status WS error: %s", exc)
