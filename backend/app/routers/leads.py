from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from sqlalchemy.sql import func
from typing import List

from app.database import get_db
from app.models.models import (
    Lead, User, Contact, Company, Deal, Activity,
    LeadStatusEnum, DealStageEnum, ActivityTypeEnum,
)
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadConvertResponse
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
    "/export",
    summary="Export leads as CSV",
    description="Downloads all non-deleted leads as a CSV file.",
)
def export_leads_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    leads = db.query(Lead).filter(Lead.is_deleted == False).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write header row
    writer.writerow(["ID", "Name", "Email", "Phone", "Status", "Source", "Created At"])

    # Write data rows
    for lead in leads:
        writer.writerow([
            lead.id,
            lead.name,
            lead.email or "",
            lead.phone or "",
            lead.status.value if lead.status else "",
            lead.source or "",
            lead.created_at.strftime("%Y-%m-%d %H:%M:%S") if lead.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"},
    )


# ─── NEW: the auto-conversion workflow ───────────────────────────────
# Lead (qualified) → Contact (create or reuse by email) →
# Company (create or reuse by name, only if lead had one) →
# Deal (created, linked to the contact) → Activity (note logged) →
# Lead.status flips to "converted".
@router.post(
    "/{lead_id}/convert",
    response_model=LeadConvertResponse,
    summary="Convert a qualified lead into a Contact, Company, and Deal",
    description=(
        "Only works on leads with status='qualified'. Creates a Contact "
        "(reusing an existing one if the email already matches), a Company "
        "if the lead had a company_name (reusing an existing one by name), "
        "and a new Deal linked to that contact. Logs an activity note and "
        "marks the lead as converted."
    ),
)
def convert_lead(lead_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.is_deleted == False).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.status != LeadStatusEnum.qualified:
        raise HTTPException(
            status_code=400,
            detail="Only qualified leads can be converted. Move this lead to 'qualified' first.",
        )

    # ── 1. Company: find by name, or create if the lead specified one ──
    company = None
    company_created = False
    if lead.company_name and lead.company_name.strip():
        company = (
            db.query(Company)
            .filter(func.lower(Company.name) == lead.company_name.strip().lower(), Company.is_deleted == False)
            .first()
        )
        if not company:
            company = Company(name=lead.company_name.strip())
            company.created_by = current_user.id
            db.add(company)
            db.flush()  # get company.id without a full commit yet
            company_created = True

    # ── 2. Contact: find by email, or create ──
    contact = None
    contact_created = False
    if lead.email:
        contact = (
            db.query(Contact)
            .filter(Contact.email == lead.email, Contact.is_deleted == False)
            .first()
        )

    if not contact:
        name_parts = lead.name.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else first_name

        contact = Contact(
            first_name=first_name,
            last_name=last_name,
            email=lead.email,
            phone=lead.phone,
            company_id=company.id if company else None,
        )
        contact.created_by = current_user.id
        db.add(contact)
        db.flush()
        contact_created = True
    elif company and not contact.company_id:
        # Existing contact had no company yet — attach the one we just resolved.
        contact.company_id = company.id
        contact.updated_by = current_user.id

    # ── 3. Deal: always created fresh for this conversion ──
    deal = Deal(
        title=f"{lead.name} — New Opportunity",
        value=0.0,
        stage=DealStageEnum.prospecting,
        contact_id=contact.id,
        owner_id=lead.owner_id or current_user.id,
    )
    db.add(deal)
    db.flush()

    # ── 4. Activity: log the conversion for history ──
    activity = Activity(
        type=ActivityTypeEnum.note,
        note=f"Converted from lead #{lead.id} ('{lead.name}').",
        created_by_id=current_user.id,
        contact_id=contact.id,
        deal_id=deal.id,
    )
    db.add(activity)

    # ── 5. Flip lead status ──
    lead.status = LeadStatusEnum.converted
    lead.updated_by = current_user.id

    db.commit()

    return LeadConvertResponse(
        lead_id=lead.id,
        contact_id=contact.id,
        contact_created=contact_created,
        company_id=company.id if company else None,
        company_created=company_created,
        deal_id=deal.id,
    )


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