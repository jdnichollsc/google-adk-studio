from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://adk:adk@localhost:5432/adk_studio"
    adk_session_db: str = "postgresql://adk:adk@localhost:5432/adk_sessions"
    temporal_address: str = "localhost:7233"
    google_api_key: str = ""
    google_genai_use_vertexai: bool = False
    cors_origins: str = "http://localhost:5173"

    model_config = {"env_file": ".env"}


settings = Settings()
