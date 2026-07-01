from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Lead, Deal, Contact, Company, LeadStatusEnum, DealStageEnum
from app.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_leads = db.query(Lead).filter(Lead.is_deleted == False).count()
    total_contacts = db.query(Contact).filter(Contact.is_deleted == False).count()
    total_companies = db.query(Company).filter(Company.is_deleted == False).count()

    active_deals = db.query(Deal).filter(
        Deal.is_deleted == False,
        Deal.stage.notin_([DealStageEnum.closed_won, DealStageEnum.closed_lost])
    ).count()

    won_deals = db.query(Deal).filter(
        Deal.is_deleted == False,
        Deal.stage == DealStageEnum.closed_won
    ).count()

    total_revenue = db.query(func.sum(Deal.value)).filter(
        Deal.is_deleted == False,
        Deal.stage == DealStageEnum.closed_won
    ).scalar() or 0

    pipeline_value = db.query(func.sum(Deal.value)).filter(
        Deal.is_deleted == False,
        Deal.stage.notin_([DealStageEnum.closed_won, DealStageEnum.closed_lost])
    ).scalar() or 0

    total_closed = won_deals + db.query(Deal).filter(
        Deal.is_deleted == False,
        Deal.stage == DealStageEnum.closed_lost
    ).count()

    win_rate = round((won_deals / total_closed * 100), 1) if total_closed > 0 else 0

    return {
        "total_leads": total_leads,
        "total_contacts": total_contacts,
        "total_companies": total_companies,
        "active_deals": active_deals,
        "won_deals": won_deals,
        "total_revenue": float(total_revenue),
        "pipeline_value": float(pipeline_value),
        "win_rate": win_rate,
    }

@router.get("/leads-by-status")
def leads_by_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = (
        db.query(Lead.status, func.count(Lead.id))
        .filter(Lead.is_deleted == False)
        .group_by(Lead.status)
        .all()
    )
    return [{"status": status.value, "count": count} for status, count in results]

@router.get("/deals-by-stage")
def deals_by_stage(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = (
        db.query(Deal.stage, func.count(Deal.id), func.sum(Deal.value))
        .filter(Deal.is_deleted == False)
        .group_by(Deal.stage)
        .all()
    )
    return [
        {"stage": stage.value, "count": count, "value": float(value or 0)}
        for stage, count, value in results
    ]

@router.get("/revenue-trend")
def revenue_trend(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = (
        db.query(
            func.to_char(Deal.created_at, 'Mon').label('month'),
            func.sum(Deal.value).label('value')
        )
        .filter(Deal.is_deleted == False, Deal.stage == DealStageEnum.closed_won)
        .group_by('month')
        .all()
    )
    return [{"month": month, "value": float(value or 0)} for month, value in results]