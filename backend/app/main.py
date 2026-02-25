from fastapi import FastAPI

from app.routers import actions, chat, files

app = FastAPI(
    title="AI Home Hub",
    description="Backend API for the AI Home Hub – a personal AI assistant hub accessible via Tailscale.",
    version="0.1.0",
)

app.include_router(files.router, prefix="/api", tags=["files"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(actions.router, prefix="/api", tags=["actions"])


@app.get("/", tags=["health"])
async def root() -> dict:
    """Health-check endpoint."""
    return {"status": "ok", "message": "AI Home Hub is running"}
