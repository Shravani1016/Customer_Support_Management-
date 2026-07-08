from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company_id: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v:
            cleaned = v.replace(' ', '')
            if not cleaned.startswith('+'):
                raise ValueError('Phone must include a country code, e.g. +91 9876543210')
            digits = cleaned[1:]
            if not digits.isdigit() or not (6 <= len(digits) <= 15):
                raise ValueError('Phone number must be 6–15 digits after the country code')
        return v


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_id: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v:
            cleaned = v.replace(' ', '')
            if not cleaned.startswith('+'):
                raise ValueError('Phone must include a country code, e.g. +91 9876543210')
            digits = cleaned[1:]
            if not digits.isdigit() or not (6 <= len(digits) <= 15):
                raise ValueError('Phone number must be 6–15 digits after the country code')
        return v


class ContactResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    company_id: Optional[int]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ActiveStatusUpdate(BaseModel):
    is_active: bool


# ─── NEW: nested schemas for the connected detail view ──────────────

class ContactCompanySummary(BaseModel):
    id: int
    name: str
    industry: Optional[str]
    website: Optional[str]

    class Config:
        from_attributes = True


class ContactDealSummary(BaseModel):
    id: int
    title: str
    value: float
    stage: str
    expected_close_date: Optional[datetime]

    class Config:
        from_attributes = True


class ContactTaskSummary(BaseModel):
    id: int
    title: str
    priority: str
    is_completed: bool
    due_date: Optional[datetime]

    class Config:
        from_attributes = True


class ContactActivitySummary(BaseModel):
    id: int
    type: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ContactDetailResponse(ContactResponse):
    """
    Extends ContactResponse with the contact's company, deals, tasks,
    and activity history. Used only by GET /api/contacts/{id}/detail;
    the existing GET /api/contacts/{id} endpoint is untouched.
    """
    company: Optional[ContactCompanySummary] = None
    deals: List[ContactDealSummary] = []
    tasks: List[ContactTaskSummary] = []
    activities: List[ContactActivitySummary] = []

    class Config:
        from_attributes = True