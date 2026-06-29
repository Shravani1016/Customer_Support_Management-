from pydantic import BaseModel

from typing import Optional

from datetime import datetime

from enum import Enum

class TaskPriorityEnum(str, Enum):

    low = "low"

    medium = "medium"

    high = "high"

class TaskCreate(BaseModel):

    title: str

    description: Optional[str] = None

    due_date: Optional[datetime] = None

    priority: TaskPriorityEnum = TaskPriorityEnum.medium

    lead_id: Optional[int] = None

    contact_id: Optional[int] = None

    deal_id: Optional[int] = None

class TaskUpdate(BaseModel):

    title: Optional[str] = None

    description: Optional[str] = None

    due_date: Optional[datetime] = None

    priority: Optional[TaskPriorityEnum] = None

    is_completed: Optional[bool] = None

class TaskResponse(BaseModel):

    id: int

    title: str

    description: Optional[str]

    due_date: Optional[datetime]

    priority: TaskPriorityEnum

    is_completed: bool

    assigned_to_id: Optional[int]

    lead_id: Optional[int]

    contact_id: Optional[int]

    deal_id: Optional[int]

    created_at: datetime

    class Config:

        from_attributes = True
