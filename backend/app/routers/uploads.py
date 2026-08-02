from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from ..config import settings
from ..deps import CurrentUser
from ..schemas import UploadResponse

router = APIRouter(prefix="/uploads", tags=["uploads"])
ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}


@router.post("", response_model=UploadResponse)
async def upload_image(
    request: Request,
    _: CurrentUser,
    file: UploadFile = File(...),
) -> UploadResponse:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Only JPG, PNG and WebP images are allowed.")
    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Image must be under {settings.max_upload_mb} MB.")
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{ALLOWED_TYPES[file.content_type]}"
    path = settings.upload_path / filename
    path.write_bytes(content)
    base = str(request.base_url).rstrip("/")
    return UploadResponse(url=f"{base}/uploads/{filename}", filename=filename)
