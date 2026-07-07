from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import AuditLog, User, RoleEnum
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])


@router.get("/")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [RoleEnum.admin, RoleEnum.super_admin]:
        return []

    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()