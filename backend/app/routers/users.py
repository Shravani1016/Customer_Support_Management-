from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.utils.audit import create_audit_log

from app.database import get_db
from app.models.models import User, RoleEnum
from app.utils.auth import hash_password, get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    department: str | None = None


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    department: str | None = None
    is_active: bool | None = None


class AdminCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class AdminUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    is_active: bool | None = None


class ResetPasswordRequest(BaseModel):
    new_password: str


def require_super_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.super_admin:
        raise HTTPException(status_code=403, detail="Only Super Admin allowed")
    return current_user


def require_admin_or_super_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in [RoleEnum.admin, RoleEnum.super_admin]:
        raise HTTPException(status_code=403, detail="Only Admin or Super Admin allowed")
    return current_user


@router.get("/employees")
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    return db.query(User).filter(
        User.role == RoleEnum.sales_rep,
        User.is_deleted == False,
    ).all()


@router.post("/employees")
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    existing = db.query(User).filter(User.email == data.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    employee = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=RoleEnum.sales_rep,
        is_active=True,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    create_audit_log(
    db=db,
    action="CREATE_EMPLOYEE",
    target_type="User",
    target_id=employee.id,
    performed_by=current_user.id,
    description=f"Created employee {employee.email}",
)

    return employee


@router.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == RoleEnum.sales_rep,
        User.is_deleted == False,
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if data.full_name is not None:
        employee.full_name = data.full_name

    if data.email is not None:
        employee.email = data.email

    if data.is_active is not None:
        employee.is_active = data.is_active

    db.commit()
    db.refresh(employee)

    create_audit_log(
    db=db,
    action="UPDATE_EMPLOYEE",
    target_type="User",
    target_id=employee.id,
    performed_by=current_user.id,
    description=f"Updated employee {employee.email}",
)

    return employee


@router.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == RoleEnum.sales_rep,
        User.is_deleted == False,
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.is_deleted = True
    db.commit()

    create_audit_log(
    db=db,
    action="DELETE_EMPLOYEE",
    target_type="User",
    target_id=employee.id,
    performed_by=current_user.id,
    description=f"Deleted employee {employee.email}",
)
    return {"message": "Employee deleted successfully"}


@router.patch("/employees/{employee_id}/reset-password")
def reset_employee_password(
    employee_id: int,
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == RoleEnum.sales_rep,
        User.is_deleted == False,
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.hashed_password = hash_password(data.new_password)
    db.commit()

    create_audit_log(
    db=db,
    action="RESET_EMPLOYEE_PASSWORD",
    target_type="User",
    target_id=employee.id,
    performed_by=current_user.id,
    description=f"Reset password for employee {employee.email}",
)

    return {"message": "Employee password reset successfully"}


@router.patch("/employees/{employee_id}/status")
def update_employee_status(
    employee_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_super_admin),
):
    employee = db.query(User).filter(
        User.id == employee_id,
        User.role == RoleEnum.sales_rep,
        User.is_deleted == False,
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.is_active = is_active
    db.commit()

    create_audit_log(
    db=db,
    action="UPDATE_EMPLOYEE_STATUS",
    target_type="User",
    target_id=employee.id,
    performed_by=current_user.id,
    description=f"Changed employee status for {employee.email}",
)

    return {"message": "Employee status updated successfully"}


@router.get("/admins")
def get_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    return db.query(User).filter(
        User.role == RoleEnum.admin,
        User.is_deleted == False,
    ).all()


@router.post("/admins")
def create_admin(
    data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    existing = db.query(User).filter(User.email == data.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    admin = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=RoleEnum.admin,
        is_active=True,
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    create_audit_log(
    db=db,
    action="CREATE_ADMIN",
    target_type="User",
    target_id=admin.id,
    performed_by=current_user.id,
    description=f"Created admin {admin.email}",
)

    return admin


@router.put("/admins/{admin_id}")
def update_admin(
    admin_id: int,
    data: AdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == RoleEnum.admin,
        User.is_deleted == False,
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    if data.full_name is not None:
        admin.full_name = data.full_name

    if data.email is not None:
        admin.email = data.email

    if data.is_active is not None:
        admin.is_active = data.is_active

    db.commit()
    db.refresh(admin)

    create_audit_log(
    db=db,
    action="UPDATE_ADMIN",
    target_type="User",
    target_id=admin.id,
    performed_by=current_user.id,
    description=f"Updated admin {admin.email}",
)

    return admin


@router.delete("/admins/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == RoleEnum.admin,
        User.is_deleted == False,
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.is_deleted = True
    db.commit()

    create_audit_log(
    db=db,
    action="DELETE_ADMIN",
    target_type="User",
    target_id=admin.id,
    performed_by=current_user.id,
    description=f"Deleted admin {admin.email}",
)

    return {"message": "Admin deleted successfully"}


@router.patch("/admins/{admin_id}/reset-password")
def reset_admin_password(
    admin_id: int,
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == RoleEnum.admin,
        User.is_deleted == False,
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.hashed_password = hash_password(data.new_password)
    db.commit()

    create_audit_log(
    db=db,
    action="RESET_ADMIN_PASSWORD",
    target_type="User",
    target_id=admin.id,
    performed_by=current_user.id,
    description=f"Reset password for admin {admin.email}",
)

    return {"message": "Admin password reset successfully"}


@router.patch("/admins/{admin_id}/status")
def update_admin_status(
    admin_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == RoleEnum.admin,
        User.is_deleted == False,
    ).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.is_active = is_active
    db.commit()

    create_audit_log(
    db=db,
    action="UPDATE_ADMIN_STATUS",
    target_type="User",
    target_id=admin.id,
    performed_by=current_user.id,
    description=f"Changed status of admin {admin.email}",
)
    return {"message": "Admin status updated successfully"}