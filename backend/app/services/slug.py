from __future__ import annotations

import re
import unicodedata

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Post


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).strip().lower()
    value = "".join(
        char for char in value
        if unicodedata.category(char)[0] in {"L", "M", "N"} or char.isspace() or char in {"-", "_"}
    )
    value = re.sub(r"[-_\s]+", "-", value).strip("-")
    return value[:180] or "reading-note"


def unique_slug(db: Session, title: str, requested: str | None = None, exclude_id: int | None = None) -> str:
    base = slugify(requested or title)
    candidate = base
    number = 2
    while True:
        query = select(Post).where(Post.slug == candidate)
        if exclude_id is not None:
            query = query.where(Post.id != exclude_id)
        if db.scalar(query) is None:
            return candidate
        candidate = f"{base}-{number}"
        number += 1
