from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    display_name: str
    role: str


class GeneratedBlog(BaseModel):
    title: str
    excerpt: str
    story: str
    main_concept: str
    practical_example: str
    three_lessons: list[str] = Field(min_length=3, max_length=3)
    personal_reflection: str
    action_step: str
    one_minute_recap: str
    tags: list[str] = Field(default_factory=list)
    content_markdown: str
    provider: str = "offline"
    warning: str | None = None


class GenerateRequest(BaseModel):
    raw_note: str = Field(min_length=20, max_length=30000)
    book_title: str = Field(default="Untitled Book", max_length=220)
    book_author: str = Field(default="", max_length=180)
    chapter: str = Field(default="", max_length=120)
    category: str = Field(default="Self Development", max_length=100)
    language: Literal["bn", "en"] = "bn"
    tone: Literal["story", "concise", "reflective"] = "story"


class PostBase(BaseModel):
    title: str = Field(min_length=3, max_length=240)
    excerpt: str = Field(default="", max_length=1200)
    raw_note: str = Field(default="", max_length=30000)
    content_markdown: str = Field(min_length=10)
    key_insight: str = ""
    personal_reflection: str = ""
    action_step: str = ""
    one_minute_recap: str = ""
    book_title: str = Field(default="Untitled Book", max_length=220)
    book_author: str = Field(default="", max_length=180)
    chapter: str = Field(default="", max_length=120)
    category: str = Field(default="Self Development", max_length=100)
    tags: list[str] = Field(default_factory=list)
    cover_url: str = Field(default="", max_length=500)
    accent: str = Field(default="amber", max_length=30)
    status: Literal["draft", "published"] = "draft"
    featured: bool = False
    is_applied: bool = False
    saved_for_review: bool = False

    @field_validator("tags")
    @classmethod
    def clean_tags(cls, value: list[str]) -> list[str]:
        cleaned: list[str] = []
        for item in value:
            tag = item.strip()
            if tag and tag.lower() not in {x.lower() for x in cleaned}:
                cleaned.append(tag[:60])
        return cleaned[:12]


class PostCreate(PostBase):
    slug: str | None = Field(default=None, max_length=220)


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=240)
    excerpt: str | None = Field(default=None, max_length=1200)
    raw_note: str | None = Field(default=None, max_length=30000)
    content_markdown: str | None = Field(default=None, min_length=10)
    key_insight: str | None = None
    personal_reflection: str | None = None
    action_step: str | None = None
    one_minute_recap: str | None = None
    book_title: str | None = Field(default=None, max_length=220)
    book_author: str | None = Field(default=None, max_length=180)
    chapter: str | None = Field(default=None, max_length=120)
    category: str | None = Field(default=None, max_length=100)
    tags: list[str] | None = None
    cover_url: str | None = Field(default=None, max_length=500)
    accent: str | None = Field(default=None, max_length=30)
    status: Literal["draft", "published"] | None = None
    featured: bool | None = None
    is_applied: bool | None = None
    saved_for_review: bool | None = None


class PostOut(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    read_time: int
    review_due_at: datetime | None
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None


class GenerateAndSaveRequest(GenerateRequest):
    status: Literal["draft", "published"] = "published"
    cover_url: str = ""
    accent: str = "amber"
    featured: bool = False


class PaginatedPosts(BaseModel):
    items: list[PostOut]
    total: int
    page: int
    page_size: int
    pages: int


class ActivityPoint(BaseModel):
    date: str
    count: int


class StatsOut(BaseModel):
    total_posts: int
    published_posts: int
    draft_posts: int
    books_count: int
    applied_lessons: int
    review_due: int
    categories: dict[str, int]
    monthly_days: int
    streak_days: int
    daily_activity: list[ActivityPoint] = Field(default_factory=list)


class ProgressBase(BaseModel):
    book_title: str = Field(min_length=1, max_length=220)
    book_author: str = Field(default="", max_length=180)
    cover_url: str = Field(default="", max_length=500)
    current_chapter: int = Field(default=1, ge=0)
    total_chapters: int = Field(default=1, ge=1)
    status: Literal["reading", "completed", "paused", "want-to-read"] = "reading"


class ProgressOut(ProgressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    progress_percent: float
    last_opened_at: datetime
    updated_at: datetime


class ReviewGrade(BaseModel):
    result: Literal["forgot", "partly", "easy"]


class ReviewResult(BaseModel):
    post: PostOut
    interval_days: int
    next_due_at: datetime


class UploadResponse(BaseModel):
    url: str
    filename: str
