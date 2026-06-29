from pydantic import BaseModel

from typing import Optional

from datetime import datetime

from enum import Enum

class ActivityTypeEnum(str, Enum):

    call = "call"

    email = "email"

    note = "note"

    meeting = "meeting"

class ActivityCreate(BaseModel):

    type: ActivityTypeEnum

    note: Optional[str] = None

    lead_id: Optional[int] = None

    contact_id: Optional[int] = None

    deal_id: Optional[int] = None

class ActivityResponse(BaseModel):

    id: int

    type: ActivityTypeEnum

    note: Optional[str]

    created_by_id: Optional[int]

    lead_id: Optional[int]

    contact_id: Optional[int]

    deal_id: Optional[int]

    created_at: datetime

    class Config:

        from_attributes = True
