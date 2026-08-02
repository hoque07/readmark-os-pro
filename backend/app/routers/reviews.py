from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import desc, select

from ..deps import CurrentUser, DbSession
from ..models import Post, ReviewEvent
from ..schemas import PostOut, ReviewGrade, ReviewResult

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/due", response_model=list[PostOut])
def due_reviews(db: DbSession, _: CurrentUser) -> list[Post]:
    now = datetime.now(timezone.utc)
    return list(
        db.scalars(
            select(Post)
            .where(
                Post.saved_for_review.is_(True),
                Post.review_due_at.is_not(None),
                Post.review_due_at <= now,
            )
            .order_by(Post.review_due_at.asc())
        ).all()
    )


@router.post("/{post_id}/schedule", response_model=PostOut)
def schedule_review(post_id: int, db: DbSession, _: CurrentUser) -> Post:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    post.saved_for_review = True
    post.review_due_at = datetime.now(timezone.utc) + timedelta(days=1)
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/grade", response_model=ReviewResult)
def grade_review(post_id: int, payload: ReviewGrade, db: DbSession, user: CurrentUser) -> ReviewResult:
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    last_event = db.scalar(
        select(ReviewEvent)
        .where(ReviewEvent.post_id == post_id, ReviewEvent.user_id == user.id)
        .order_by(desc(ReviewEvent.reviewed_at))
        .limit(1)
    )
    previous = last_event.interval_days if last_event else 1
    if payload.result == "forgot":
        interval = 1
    elif payload.result == "partly":
        interval = max(3, round(previous * 1.6))
    else:
        interval = max(7, round(previous * 2.5))

    next_due = datetime.now(timezone.utc) + timedelta(days=interval)
    db.add(
        ReviewEvent(
            post_id=post.id,
            user_id=user.id,
            result=payload.result,
            interval_days=interval,
            next_due_at=next_due,
        )
    )
    post.saved_for_review = True
    post.review_due_at = next_due
    db.commit()
    db.refresh(post)
    return ReviewResult(post=post, interval_days=interval, next_due_at=next_due)
