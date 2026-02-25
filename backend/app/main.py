import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routers import actions, chat, files

app = FastAPI(
    title="AI Home Hub",
    description="Backend API for the AI Home Hub – a personal AI assistant hub accessible via Tailscale.",
    version="0.1.0",
)

# API routes – registered first so /api/* always takes priority over static files
app.include_router(files.router, prefix="/api", tags=["files"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(actions.router, prefix="/api", tags=["actions"])


@app.get("/api/health", tags=["health"])
async def health() -> dict:
    """Health-check endpoint."""
    return {"status": "ok", "message": "AI Home Hub is running"}


# Serve the SPA from backend/static/.
# Mounted last so every /api/* route above has priority.
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
