from __future__ import annotations

import os
from pathlib import Path

TEST_DB = Path(__file__).resolve().parents[1] / "data" / "pytest-readmark.db"
TEST_DB.parent.mkdir(parents=True, exist_ok=True)
TEST_DB.unlink(missing_ok=True)

# These values are set before test modules import the FastAPI application.
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB.as_posix()}"
os.environ["SECRET_KEY"] = "pytest-secret-key-with-at-least-thirty-two-characters"
os.environ["ADMIN_EMAIL"] = "admin@example.com"
os.environ["ADMIN_PASSWORD"] = "ChangeMe123!"
os.environ["ADMIN_NAME"] = "Test Owner"
os.environ["SEED_DEMO_DATA"] = "true"
os.environ["OPENAI_API_KEY"] = ""
os.environ["AI_FALLBACK_ON_ERROR"] = "true"


def pytest_sessionfinish(session, exitstatus):  # type: ignore[no-untyped-def]
    try:
        from app.database import engine

        engine.dispose()
    finally:
        TEST_DB.unlink(missing_ok=True)
