from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)
DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials or credentials.scheme.lower() != "bearer":
        raise credentials_error
    subject = decode_access_token(credentials.credentials)
    if not subject:
        raise credentials_error
    user = db.scalar(select(User).where(User.email == subject))
    if not user or not user.is_active:
        raise credentials_error
    return user


def get_optional_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User | None:
    if not credentials or credentials.scheme.lower() != "bearer":
        return None
    subject = decode_access_token(credentials.credentials)
    if not subject:
        return None
    user = db.scalar(select(User).where(User.email == subject))
    return user if user and user.is_active else None


OptionalUser = Annotated[User | None, Depends(get_optional_user)]
CurrentUser = Annotated[User, Depends(get_current_user)]
