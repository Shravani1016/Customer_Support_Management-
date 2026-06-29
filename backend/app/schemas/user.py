from pydantic import BaseModel, EmailStr

from enum import Enum

from typing import Optional

from datetime import datetime

class RoleEnum(str, Enum):

    admin = "admin"

    manager = "manager"

    sales_rep = "sales_rep"

class UserCreate(BaseModel):

    email: EmailStr

    full_name: str

    password: str

    role: RoleEnum = RoleEnum.sales_rep

class UserResponse(BaseModel):

    id: int

    email: str

    full_name: str

    role: RoleEnum

    is_active: bool

    created_at: datetime

    class Config:

        from_attributes = True

class Token(BaseModel):

    access_token: str

    token_type: str

class TokenData(BaseModel):

    email: Optional[str] = None

    role: Optional[str] = None
