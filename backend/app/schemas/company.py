from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    @field_validator('phone')
    @classmethod
    def phone_must_be_10_digits(cls, v):
        if v and (not v.isdigit() or len(v) != 10):
            raise ValueError('Phone must be exactly 10 digits')
        return v


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    @field_validator('phone')
    @classmethod
    def phone_must_be_10_digits(cls, v):
        if v and (not v.isdigit() or len(v) != 10):
            raise ValueError('Phone must be exactly 10 digits')
        return v


class CompanyResponse(BaseModel):
    id: int
    name: str
    industry: Optional[str]
    website: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── NEW: nested schemas for the connected detail view ──────────────
# Kept intentionally minimal (just what's needed to display in a table)
# to avoid circular-import issues between company/contact/deal schemas.

class CompanyContactSummary(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]

    class Config:
        from_attributes = True


class CompanyDealSummary(BaseModel):
    id: int
    title: str
    value: float
    stage: str
    contact_id: Optional[int]
    expected_close_date: Optional[datetime]

    class Config:
        from_attributes = True

class CompanyTaskSummary(BaseModel):
    id: int
    title: str
    priority: str
    due_date: Optional[datetime]
    is_completed: bool
    contact_id: Optional[int]
    deal_id: Optional[int]

    class Config:
        from_attributes = True


class CompanyActivitySummary(BaseModel):
    id: int
    type: str
    note: Optional[str]
    created_at: datetime
    contact_id: Optional[int]
    deal_id: Optional[int]

    class Config:
        from_attributes = True

class CompanyDetailResponse(CompanyResponse):
    """
    Extends CompanyResponse with the company's contacts, and — through
    those contacts and deals — every task and activity linked to this
    company. Used only by the /api/companies/{id}/detail endpoint; the
    existing /api/companies/{id} endpoint and its response_model are
    untouched.
    """
    contacts: List[CompanyContactSummary] = []
    deals: List[CompanyDealSummary] = []
    tasks: List[CompanyTaskSummary] = []
    activities: List[CompanyActivitySummary] = []

    class Config:
        from_attributes = True