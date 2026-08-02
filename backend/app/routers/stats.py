from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from sqlalchemy import func, select

from ..deps import DbSession, OptionalUser
from ..models import Post
from ..schemas import ActivityPoint, StatsOut

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
def get_stats(db: DbSession, user: OptionalUser) -> StatsOut:
    published_filter = Post.status == "published"
    if user:
        total = db.scalar(select(func.count()).select_from(Post)) or 0
        draft = db.scalar(select(func.count()).select_from(Post).where(Post.status == "draft")) or 0
        book_query = select(func.count(func.distinct(Post.book_title)))
        applied_query = select(func.count()).select_from(Post).where(Post.is_applied.is_(True))
    else:
        total = db.scalar(select(func.count()).select_from(Post).where(published_filter)) or 0
        draft = 0
        book_query = select(func.count(func.distinct(Post.book_title))).where(published_filter)
        applied_query = select(func.count()).select_from(Post).where(
            published_filter, Post.is_applied.is_(True)
        )

    published = db.scalar(select(func.count()).select_from(Post).where(published_filter)) or 0
    books = db.scalar(book_query) or 0
    applied = db.scalar(applied_query) or 0
    now = datetime.now(timezone.utc)
    due = 0
    if user:
        due = db.scalar(
            select(func.count()).select_from(Post).where(
                Post.saved_for_review.is_(True),
                Post.review_due_at.is_not(None),
                Post.review_due_at <= now,
            )
        ) or 0

    category_rows = db.execute(
        select(Post.category, func.count(Post.id))
        .where(published_filter)
        .group_by(Post.category)
    ).all()
    categories = {name: count for name, count in category_rows}

    first_day = now.date() - timedelta(days=29)
    activity_query = (
        select(func.date(Post.created_at), func.count(Post.id))
        .where(Post.created_at >= datetime.combine(first_day, datetime.min.time(), tzinfo=timezone.utc))
        .group_by(func.date(Post.created_at))
    )
    if not user:
        activity_query = activity_query.where(published_filter)
    activity_rows = db.execute(activity_query).all()
    activity_map = {str(day): int(count) for day, count in activity_rows}
    daily_activity = [
        ActivityPoint(
            date=(first_day + timedelta(days=index)).isoformat(),
            count=activity_map.get((first_day + timedelta(days=index)).isoformat(), 0),
        )
        for index in range(30)
    ]
    day_strings = {point.date for point in daily_activity if point.count > 0}
    streak = 0
    cursor = now.date()
    while cursor.isoformat() in day_strings:
        streak += 1
        cursor -= timedelta(days=1)

    return StatsOut(
        total_posts=total,
        published_posts=published,
        draft_posts=draft,
        books_count=books,
        applied_lessons=applied,
        review_due=due,
        categories=categories,
        monthly_days=len(day_strings),
        streak_days=streak,
        daily_activity=daily_activity,
    )
