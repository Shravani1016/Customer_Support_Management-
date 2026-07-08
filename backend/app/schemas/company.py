from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    email: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

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


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

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


class CompanyResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    industry: Optional[str]
    website: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


class ActiveStatusUpdate(BaseModel):
    is_active: bool


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
    contacts: List[CompanyContactSummary] = []
    deals: List[CompanyDealSummary] = []
    tasks: List[CompanyTaskSummary] = []
    activities: List[CompanyActivitySummary] = []

    class Config:
        from_attributes = True