from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.utils.auth import get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/profile", tags=["Profile"])


class ProfileUpdate(BaseModel):
    full_name: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.get("/")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
    }


@router.put("/")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.full_name:
        current_user.full_name = data.full_name

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "user": current_user,
    }


@router.patch("/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(data.new_password)

    db.commit()

    return {"message": "Password changed successfully"}