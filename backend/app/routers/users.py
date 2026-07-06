from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.models import User, RoleEnum
from app.utils.auth import hash_password

router = APIRouter(prefix="/api/users", tags=["Users"])


class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str | None = None


@router.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == RoleEnum.EMPLOYEE).all()


@router.post("/employees")
def create_employee(data: CreateUserRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=RoleEnum.EMPLOYEE,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/admins")
def get_admins(db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == RoleEnum.ADMIN).all()


@router.post("/admins")
def create_admin(data: CreateUserRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=RoleEnum.ADMIN,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user