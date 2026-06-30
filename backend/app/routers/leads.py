from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List

from app.database import get_db
from app.models.models import Lead, User
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.get(
    "/",
    response_model=List[LeadResponse],
    summary="List all leads",
    description="Returns all non-deleted leads visible to the current user.",
)
def get_leads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Lead).filter(Lead.is_deleted == False).all()


@router.post(
    "/",
    response_model=LeadResponse,
    status_code=201,
    summary="Create a new lead",
    description="Creates a new lead and assigns the current user as its owner.",
)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_lead = Lead(**lead.dict(), owner_id=current_user.id)
    db_lead.created_by = current_user.id
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Get a single lead",
    description="Returns a single lead by ID, if it exists and is not deleted.",
)
def get_lead(lead_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.is_deleted == False).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Update a lead",
    description="Updates one or more fields on an existing lead.",
)
def update_lead(lead_id: int, lead_update: LeadUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.is_deleted == False).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    for key, value in lead_update.dict(exclude_unset=True).items():
        setattr(lead, key, value)

    lead.updated_by = current_user.id
    db.commit()
    db.refresh(lead)
    return lead


@router.delete(
    "/{lead_id}",
    status_code=204,
    summary="Delete a lead",
    description="Soft-deletes a lead, removing it from listings without permanently deleting the record.",
)
def delete_lead(lead_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.is_deleted == False).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.is_deleted = True
    lead.deleted_at = func.now()
    lead.updated_by = current_user.id
    db.commit()
    return None