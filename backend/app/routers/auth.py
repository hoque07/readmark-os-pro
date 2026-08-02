from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..deps import CurrentUser, DbSession
from ..models import User
from ..schemas import ChangePasswordRequest, LoginRequest, Token, UserOut
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: DbSession) -> Token:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account is disabled.")
    return Token(access_token=create_access_token(user.email))


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> User:
    return user


@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, db: DbSession, user: CurrentUser) -> dict[str, str]:
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=400, detail="New password must be different.")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully."}
