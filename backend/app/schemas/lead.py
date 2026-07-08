from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class LeadStatusEnum(str, Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    converted = "converted"

class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: LeadStatusEnum = LeadStatusEnum.new
    source: Optional[str] = None
    company_name: Optional[str] = None  # NEW

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

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[LeadStatusEnum] = None
    source: Optional[str] = None
    company_name: Optional[str] = None  # NEW

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

class LeadResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    status: LeadStatusEnum
    source: Optional[str]
    company_name: Optional[str] = None  # NEW
    owner_id: Optional[int]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ActiveStatusUpdate(BaseModel):
    is_active: bool


# ─── NEW: response for the conversion action ─────────────────────────
class LeadConvertResponse(BaseModel):
    """
    Returned by POST /api/leads/{lead_id}/convert.
    Tells the frontend exactly what got created (or reused), so it can
    show a confirmation with links to the new Contact/Company/Deal.
    """
    lead_id: int
    contact_id: int
    contact_created: bool          # False if an existing contact (by email) was reused
    company_id: Optional[int] = None
    company_created: bool = False  # False if an existing company (by name) was reused
    deal_id: int

    class Config:
        from_attributes = True