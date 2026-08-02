from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import admin, ai, auth, posts, progress, reviews, stats, uploads
from .services.seed import ensure_owner, seed_demo_content


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    (settings.backend_root / "data").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        owner = ensure_owner(db)
        seed_demo_content(db, owner)
    yield


app = FastAPI(
    title=settings.app_name,
    version="2.0.0",
    description="Local-first reading journal, AI blog generator and review system.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(settings.upload_path), check_dir=False), name="uploads")

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)
app.include_router(posts.router, prefix=settings.api_prefix)
app.include_router(ai.router, prefix=settings.api_prefix)
app.include_router(stats.router, prefix=settings.api_prefix)
app.include_router(progress.router, prefix=settings.api_prefix)
app.include_router(reviews.router, prefix=settings.api_prefix)
app.include_router(uploads.router, prefix=settings.api_prefix)


@app.get(f"{settings.api_prefix}/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name, "environment": settings.environment}


@app.get(f"{settings.api_prefix}/config", tags=["system"])
def public_config() -> dict[str, object]:
    return {
        "ai_enabled": bool(settings.openai_api_key),
        "environment": settings.environment,
        "max_upload_mb": settings.max_upload_mb,
    }


if settings.serve_frontend and settings.frontend_dist_path.exists():
    assets_path = settings.frontend_dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="frontend-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def frontend(full_path: str, request: Request):
        if full_path.startswith(settings.api_prefix.strip("/")) or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404)
        candidate = (settings.frontend_dist_path / full_path).resolve()
        root = settings.frontend_dist_path.resolve()
        if candidate.is_file() and root in candidate.parents:
            return FileResponse(candidate)
        index_path = root / "index.html"
        return FileResponse(index_path)
