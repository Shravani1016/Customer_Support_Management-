from pydantic import BaseModel

from typing import Optional

from datetime import datetime

from enum import Enum

class DealStageEnum(str, Enum):

    prospecting = "prospecting"

    proposal = "proposal"

    negotiation = "negotiation"

    closed_won = "closed_won"

    closed_lost = "closed_lost"

class DealCreate(BaseModel):

    title: str

    value: Optional[float] = 0.0

    stage: DealStageEnum = DealStageEnum.prospecting

    contact_id: Optional[int] = None

    expected_close_date: Optional[datetime] = None

class DealUpdate(BaseModel):

    title: Optional[str] = None

    value: Optional[float] = None

    stage: Optional[DealStageEnum] = None

    contact_id: Optional[int] = None

    expected_close_date: Optional[datetime] = None

class DealResponse(BaseModel):
    id: int
    title: str
    value: float
    stage: DealStageEnum
    contact_id: Optional[int]
    owner_id: Optional[int]
    expected_close_date: Optional[datetime]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DealContactSummary(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    company_id: Optional[int]
    company_name: Optional[str]


class DealOwnerSummary(BaseModel):
    id: int
    full_name: str


class DealDetailResponse(DealResponse):
    contact: Optional[DealContactSummary] = None
    owner: Optional[DealOwnerSummary] = None
class ActiveStatusUpdate(BaseModel):
    is_active: bool

    class Config:
        from_attributes = True