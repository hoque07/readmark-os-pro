from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from ..deps import CurrentUser, DbSession
from ..models import Post
from ..schemas import GenerateAndSaveRequest, GenerateRequest, GeneratedBlog, PostOut
from ..services.ai_service import generator
from ..services.content import estimate_read_time
from ..services.slug import unique_slug

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate", response_model=GeneratedBlog)
def generate_blog(payload: GenerateRequest, _: CurrentUser) -> GeneratedBlog:
    return generator.generate(payload)


@router.post("/generate-and-save", response_model=PostOut, status_code=201)
def generate_and_save(
    payload: GenerateAndSaveRequest,
    db: DbSession,
    _: CurrentUser,
) -> Post:
    generated = generator.generate(payload)
    now = datetime.now(timezone.utc)
    post = Post(
        slug=unique_slug(db, generated.title),
        title=generated.title,
        excerpt=generated.excerpt,
        raw_note=payload.raw_note,
        content_markdown=generated.content_markdown,
        key_insight=generated.main_concept,
        personal_reflection=generated.personal_reflection,
        action_step=generated.action_step,
        one_minute_recap=generated.one_minute_recap,
        book_title=payload.book_title,
        book_author=payload.book_author,
        chapter=payload.chapter,
        category=payload.category,
        tags=generated.tags,
        cover_url=payload.cover_url,
        accent=payload.accent,
        status=payload.status,
        featured=payload.featured,
        read_time=estimate_read_time(generated.content_markdown),
        published_at=now if payload.status == "published" else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post
