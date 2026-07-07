from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.dependencies import super_admin_required
from app.models.models import User, RoleEnum
from app.utils.auth import hash_password

router = APIRouter(
    prefix="/api/super-admin",
    tags=["Super Admin"]
)


@router.post("/create-admin")
def create_admin(
    email: str,
    full_name: str,
    password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_required)
):
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_admin = User(
        email=email,
        full_name=full_name,
        hashed_password=hash_password(password),
        role=RoleEnum.admin,
        is_active=True
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {"message": "Admin created successfully", "admin_id": new_admin.id}


@router.get("/admins")
def get_admins(
    search: str = "",
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_required)
):
    query = db.query(User).filter(User.role == RoleEnum.admin)

    if search:
        query = query.filter(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )

    total = query.count()
    admins = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "admins": admins
    }


@router.put("/admins/{admin_id}")
def update_admin(
    admin_id: int,
    full_name: str,
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_required)
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == RoleEnum.admin
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.full_name = full_name
    admin.email = email

    db.commit()
    db.refresh(admin)

    return {"message": "Admin updated successfully"}


@router.patch("/admins/{admin_id}/toggle-status")
def toggle_admin_status(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_required)
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == RoleEnum.admin
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.is_active = not admin.is_active

    db.commit()

    return {"message": "Admin status updated successfully", "is_active": admin.is_active}


@router.patch("/admins/{admin_id}/reset-password")
def reset_admin_password(
    admin_id: int,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_required)
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == RoleEnum.admin
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.hashed_password = hash_password(new_password)

    db.commit()

    return {"message": "Admin password reset successfully"}


@router.delete("/admins/{admin_id}")
def soft_delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_required)
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == RoleEnum.admin
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.is_active = False

    db.commit()

    return {"message": "Admin deactivated successfully"}

@router.post("/create-employee")
def create_employee(
    email: str,
    full_name: str,
    password: str,
    role: RoleEnum,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_required)
):
    if role not in [RoleEnum.manager, RoleEnum.sales_rep]:
        raise HTTPException(
            status_code=400,
            detail="Employee role must be manager or sales_rep"
        )

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_employee = User(
        email=email,
        full_name=full_name,
        hashed_password=hash_password(password),
        role=role,
        is_active=True
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return {
        "message": "Employee created successfully",
        "employee_id": new_employee.id
    }