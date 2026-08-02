from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "ReadMark OS API"
    environment: str = "development"
    api_prefix: str = "/api"
    secret_key: str = "local-development-secret-key-change-before-production-2026"
    access_token_expire_minutes: int = 60 * 24 * 7

    database_url: str = "sqlite:///./data/readmark.db"
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"]
    )

    admin_email: str = "admin@example.com"
    admin_password: str = "ChangeMe123!"
    admin_name: str = "Tanvir"
    seed_demo_data: bool = True

    openai_api_key: str | None = None
    openai_model: str = "gpt-5-mini"
    openai_base_url: str | None = None
    ai_fallback_on_error: bool = True

    upload_dir: str = "uploads"
    max_upload_mb: int = 5

    serve_frontend: bool = False
    frontend_dist: str = "../frontend/dist"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: Any) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def backend_root(self) -> Path:
        return Path(__file__).resolve().parents[1]

    @property
    def upload_path(self) -> Path:
        path = Path(self.upload_dir)
        if not path.is_absolute():
            path = self.backend_root / path
        return path

    @property
    def frontend_dist_path(self) -> Path:
        path = Path(self.frontend_dist)
        if not path.is_absolute():
            path = self.backend_root / path
        return path.resolve()


@lru_cache

def get_settings() -> Settings:
    return Settings()


settings = get_settings()
