from google.adk.cli.fast_api import get_fast_api_app

from src.config import settings

# Determine session service URI - use in-memory if no DB configured
session_uri = settings.adk_session_db if settings.adk_session_db else None

# ADK discovers agents from the agents/ directory automatically
# Provides: /list-apps, /run, /run_sse, /health, session management
app = get_fast_api_app(
    agents_dir="agents",
    web=False,
    session_service_uri=session_uri,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    host="0.0.0.0",
    port=8000,
)

# Mount our custom routes for workflows (Temporal)
from src.api.workflows import router as workflows_router

app.include_router(workflows_router)
