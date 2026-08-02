from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(120), default="Owner")
    role: Mapped[str] = mapped_column(String(30), default="owner")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    progress_items: Mapped[list["ReadingProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    review_events: Mapped[list["ReviewEvent"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(240), index=True)
    excerpt: Mapped[str] = mapped_column(Text, default="")
    raw_note: Mapped[str] = mapped_column(Text, default="")
    content_markdown: Mapped[str] = mapped_column(Text)

    key_insight: Mapped[str] = mapped_column(Text, default="")
    personal_reflection: Mapped[str] = mapped_column(Text, default="")
    action_step: Mapped[str] = mapped_column(Text, default="")
    one_minute_recap: Mapped[str] = mapped_column(Text, default="")

    book_title: Mapped[str] = mapped_column(String(220), default="Untitled Book", index=True)
    book_author: Mapped[str] = mapped_column(String(180), default="")
    chapter: Mapped[str] = mapped_column(String(120), default="")
    category: Mapped[str] = mapped_column(String(100), default="Self Development", index=True)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)

    cover_url: Mapped[str] = mapped_column(String(500), default="")
    accent: Mapped[str] = mapped_column(String(30), default="amber")
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    saved_for_review: Mapped[bool] = mapped_column(Boolean, default=False)
    review_due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    read_time: Mapped[int] = mapped_column(Integer, default=5)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    review_events: Mapped[list["ReviewEvent"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )


class ReadingProgress(Base):
    __tablename__ = "reading_progress"
    __table_args__ = (UniqueConstraint("user_id", "book_title", name="uq_user_book_progress"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    book_title: Mapped[str] = mapped_column(String(220), index=True)
    book_author: Mapped[str] = mapped_column(String(180), default="")
    cover_url: Mapped[str] = mapped_column(String(500), default="")
    current_chapter: Mapped[int] = mapped_column(Integer, default=1)
    total_chapters: Mapped[int] = mapped_column(Integer, default=1)
    progress_percent: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(30), default="reading")
    last_opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    user: Mapped[User] = relationship(back_populates="progress_items")


class ReviewEvent(Base):
    __tablename__ = "review_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    result: Mapped[str] = mapped_column(String(20))
    interval_days: Mapped[int] = mapped_column(Integer, default=1)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    next_due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    post: Mapped[Post] = relationship(back_populates="review_events")
    user: Mapped[User] = relationship(back_populates="review_events")
