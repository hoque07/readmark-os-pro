from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import select

from ..deps import CurrentUser, DbSession
from ..models import ReadingProgress
from ..schemas import ProgressBase, ProgressOut

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=list[ProgressOut])
def list_progress(db: DbSession, user: CurrentUser) -> list[ReadingProgress]:
    return list(
        db.scalars(
            select(ReadingProgress)
            .where(ReadingProgress.user_id == user.id)
            .order_by(ReadingProgress.updated_at.desc())
        ).all()
    )


@router.post("", response_model=ProgressOut)
def upsert_progress(payload: ProgressBase, db: DbSession, user: CurrentUser) -> ReadingProgress:
    item = db.scalar(
        select(ReadingProgress).where(
            ReadingProgress.user_id == user.id,
            ReadingProgress.book_title == payload.book_title,
        )
    )
    percent = min(100.0, round((payload.current_chapter / max(payload.total_chapters, 1)) * 100, 1))
    if not item:
        item = ReadingProgress(user_id=user.id, **payload.model_dump(), progress_percent=percent)
        db.add(item)
    else:
        for field, value in payload.model_dump().items():
            setattr(item, field, value)
        item.progress_percent = percent
        item.last_opened_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item
