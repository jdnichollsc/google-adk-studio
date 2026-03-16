from fastapi import APIRouter

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("")
async def list_sessions():
    """Placeholder – ADK DatabaseSessionService integration can come later."""
    return {"sessions": []}
