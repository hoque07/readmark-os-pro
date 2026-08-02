from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, or_, select

from ..deps import CurrentUser, DbSession, OptionalUser
from ..models import Post
from ..schemas import PaginatedPosts, PostCreate, PostOut, PostUpdate
from ..services.content import estimate_read_time
from ..services.slug import unique_slug

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=PaginatedPosts, response_model_exclude={"items": {"__all__": {"raw_note"}}})
def list_posts(
    db: DbSession,
    user: OptionalUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
    search: str = Query(default="", max_length=200),
    category: str = Query(default="", max_length=100),
    book: str = Query(default="", max_length=220),
    status_filter: Literal["published", "draft", "all"] = Query(default="published", alias="status"),
    sort: Literal["newest", "oldest", "title"] = "newest",
) -> PaginatedPosts:
    if status_filter in {"draft", "all"} and user is None:
        raise HTTPException(status_code=401, detail="Owner login is required to view drafts.")

    query = select(Post)
    count_query = select(func.count()).select_from(Post)

    if status_filter != "all":
        query = query.where(Post.status == status_filter)
        count_query = count_query.where(Post.status == status_filter)
    if search:
        pattern = f"%{search.strip()}%"
        search_clause = or_(
            Post.title.ilike(pattern),
            Post.excerpt.ilike(pattern),
            Post.book_title.ilike(pattern),
            Post.content_markdown.ilike(pattern),
        )
        query = query.where(search_clause)
        count_query = count_query.where(search_clause)
    if category:
        query = query.where(Post.category == category)
        count_query = count_query.where(Post.category == category)
    if book:
        query = query.where(Post.book_title == book)
        count_query = count_query.where(Post.book_title == book)

    if sort == "oldest":
        query = query.order_by(Post.created_at.asc())
    elif sort == "title":
        query = query.order_by(Post.title.asc())
    else:
        query = query.order_by(func.coalesce(Post.published_at, Post.created_at).desc())

    total = db.scalar(count_query) or 0
    items = db.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()
    return PaginatedPosts(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)) if total else 0,
    )


@router.get("/featured", response_model=list[PostOut], response_model_exclude={"__all__": {"raw_note"}})
def featured_posts(db: DbSession) -> list[Post]:
    return list(
        db.scalars(
            select(Post)
            .where(Post.status == "published", Post.featured.is_(True))
            .order_by(Post.published_at.desc())
            .limit(6)
        ).all()
    )


@router.get("/id/{post_id}", response_model=PostOut)
def get_post_by_id(post_id: int, db: DbSession, _: CurrentUser) -> Post:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    return post


@router.get("/{slug}", response_model=PostOut, response_model_exclude={"raw_note"})
def get_post(slug: str, db: DbSession, user: OptionalUser) -> Post:
    post = db.scalar(select(Post).where(Post.slug == slug))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    if post.status == "draft" and user is None:
        raise HTTPException(status_code=404, detail="Post not found.")
    return post


@router.post("", response_model=PostOut, status_code=201)
def create_post(payload: PostCreate, db: DbSession, _: CurrentUser) -> Post:
    data = payload.model_dump(exclude={"slug"})
    now = datetime.now(timezone.utc)
    post = Post(
        **data,
        slug=unique_slug(db, payload.title, payload.slug),
        read_time=estimate_read_time(payload.content_markdown),
        published_at=now if payload.status == "published" else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.patch("/{post_id}", response_model=PostOut)
def update_post(post_id: int, payload: PostUpdate, db: DbSession, _: CurrentUser) -> Post:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    updates = payload.model_dump(exclude_unset=True)
    old_status = post.status
    for field, value in updates.items():
        setattr(post, field, value)
    if "title" in updates:
        post.slug = unique_slug(db, post.title, exclude_id=post.id)
    if "content_markdown" in updates:
        post.read_time = estimate_read_time(post.content_markdown)
    if old_status != "published" and post.status == "published" and not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    if post.status == "draft":
        post.published_at = None
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204)
def delete_post(post_id: int, db: DbSession, _: CurrentUser) -> None:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    db.delete(post)
    db.commit()
