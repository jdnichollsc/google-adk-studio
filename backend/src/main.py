from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.agents import router as agents_router
from src.api.sessions import router as sessions_router
from src.api.tools import router as tools_router
from src.api.workflows import router as workflows_router
from src.config import settings

app = FastAPI(title="ADK Studio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents_router)
app.include_router(sessions_router)
app.include_router(tools_router)
app.include_router(workflows_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
