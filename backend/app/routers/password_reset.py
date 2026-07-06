from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
import secrets

from app.database import get_db
from app.models.models import User, PasswordResetOTP, RoleEnum
from app.utils.email import send_otp_email, send_admin_reset_email, generate_otp
from app.utils.auth import hash_password

router = APIRouter(prefix="/api/auth", tags=["Password Reset"])


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


class AdminResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == request.email,
        User.is_active == True
    ).first()

    if not user:
        return {"message": "If this email exists, a reset link/OTP has been sent."}

    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == request.email
    ).delete()
    db.commit()

    if user.role in [RoleEnum.admin, RoleEnum.super_admin]:
        token = secrets.token_urlsafe(32)

        otp_record = PasswordResetOTP(
            email=user.email,
            otp="",
            reset_token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=30)
        )

        db.add(otp_record)
        db.commit()

        reset_link = f"http://localhost:3000/reset-password?token={token}&email={user.email}"

        send_admin_reset_email(
            user.email,
            reset_link,
            user.full_name
        )

    else:
        otp = generate_otp()

        otp_record = PasswordResetOTP(
            email=user.email,
            otp=otp,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
        )

        db.add(otp_record)
        db.commit()

        send_otp_email(
            user.email,
            otp,
            user.full_name
        )

    return {"message": "If this email exists, a reset link/OTP has been sent."}


@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    record = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == request.email,
        PasswordResetOTP.otp == request.otp,
        PasswordResetOTP.is_used == False
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP has expired")

    return {"message": "OTP verified", "valid": True}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == request.email,
        PasswordResetOTP.otp == request.otp,
        PasswordResetOTP.is_used == False
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP has expired")

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(request.new_password)
    record.is_used = True

    db.commit()

    return {"message": "Password reset successfully"}


@router.post("/reset-password-admin")
def reset_password_admin(
    request: AdminResetPasswordRequest,
    db: Session = Depends(get_db)
):
    record = db.query(PasswordResetOTP).filter(
        PasswordResetOTP.reset_token == request.token,
        PasswordResetOTP.is_used == False
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    if record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link has expired")

    user = db.query(User).filter(
        User.email == record.email
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(request.new_password)
    record.is_used = True

    db.commit()

    return {"message": "Admin password reset successfully"}