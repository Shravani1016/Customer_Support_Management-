from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import Deal, Lead, Activity, User
from app.schemas.report import (
    LeadsSummaryItem,
    PipelineSummaryItem,
    SalesPerformanceItem,
    ActivitySummaryItem,
)

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def scope_by_role(query, model, current_user: User):
    """Sales reps only see their own records; managers/admins see everything."""
    if current_user.role == "sales_rep":
        return query.filter(model.owner_id == current_user.id)
    return query


@router.get("/leads-summary", response_model=List[LeadsSummaryItem])
def leads_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Lead.status, func.count(Lead.id)).filter(Lead.is_deleted == False)
    q = scope_by_role(q, Lead, current_user)
    results = q.group_by(Lead.status).all()
    return [{"status": status.value, "count": count} for status, count in results]


@router.get("/deals-pipeline", response_model=List[PipelineSummaryItem])
def deals_pipeline(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Deal.stage, func.count(Deal.id), func.sum(Deal.value)).filter(Deal.is_deleted == False)
    q = scope_by_role(q, Deal, current_user)
    results = q.group_by(Deal.stage).all()
    return [{"stage": stage.value, "deal_count": count, "total_value": total or 0} for stage, count, total in results]


@router.get("/sales-performance", response_model=List[SalesPerformanceItem])
def sales_performance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = (
        db.query(User.full_name, func.count(Deal.id), func.sum(Deal.value))
        .join(Deal, Deal.owner_id == User.id)
        .filter(Deal.is_deleted == False, Deal.stage == "closed_won")
        .group_by(User.full_name)
        .all()
    )
    return [{"rep_name": name, "deals_won": count, "total_value": total or 0} for name, count, total in results]


@router.get("/activity-summary", response_model=List[ActivitySummaryItem])
def activity_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Activity.type, func.count(Activity.id)).filter(Activity.is_deleted == False)
    results = q.group_by(Activity.type).all()
    return [{"activity_type": atype.value, "count": count} for atype, count in results]