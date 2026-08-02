from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select

from ..deps import CurrentUser, DbSession
from ..models import Post, ReadingProgress, ReviewEvent

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/export")
def export_owner_data(db: DbSession, user: CurrentUser) -> dict[str, object]:
    posts = list(db.scalars(select(Post).order_by(Post.created_at.asc())).all())
    progress = list(
        db.scalars(
            select(ReadingProgress)
            .where(ReadingProgress.user_id == user.id)
            .order_by(ReadingProgress.updated_at.asc())
        ).all()
    )
    reviews = list(
        db.scalars(
            select(ReviewEvent)
            .where(ReviewEvent.user_id == user.id)
            .order_by(ReviewEvent.reviewed_at.asc())
        ).all()
    )
    return {
        "format": "readmark-os-backup",
        "version": 2,
        "exported_at": datetime.now(timezone.utc),
        "owner": {
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
        },
        "posts": jsonable_encoder(posts),
        "reading_progress": jsonable_encoder(progress),
        "review_history": jsonable_encoder(reviews),
    }
