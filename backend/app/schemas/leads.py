from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class LeadStatusEnum(str, Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    lost = "lost"
    converted = "converted"

class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: LeadStatusEnum = LeadStatusEnum.new
    source: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[LeadStatusEnum] = None
    source: Optional[str] = None

class LeadResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    status: LeadStatusEnum
    source: Optional[str]
    owner_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True