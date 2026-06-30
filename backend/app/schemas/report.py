from pydantic import BaseModel
from typing import List


class LeadsSummaryItem(BaseModel):
    status: str
    count: int


class PipelineSummaryItem(BaseModel):
    stage: str
    deal_count: int
    total_value: float


class SalesPerformanceItem(BaseModel):
    rep_name: str
    deals_won: int
    total_value: float


class ActivitySummaryItem(BaseModel):
    activity_type: str
    count: int