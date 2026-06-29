from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company_id: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def phone_must_be_10_digits(cls, v):
        if v and (not v.isdigit() or len(v) != 10):
            raise ValueError('Phone must be exactly 10 digits')
        return v

class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_id: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def phone_must_be_10_digits(cls, v):
        if v and (not v.isdigit() or len(v) != 10):
            raise ValueError('Phone must be exactly 10 digits')
        return v

class ContactResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    company_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True