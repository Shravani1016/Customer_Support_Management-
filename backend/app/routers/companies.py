from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
import csv
import io

from app.database import get_db
from app.models.models import Company, Contact, Deal, Task, Activity
from app.schemas.company import (
    CompanyCreate, CompanyUpdate, CompanyResponse, CompanyDetailResponse,
)
from app.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/companies", tags=["Companies"])


@router.get(
    "/",
    response_model=List[CompanyResponse],
    summary="List all companies",
    description="Returns all non-deleted companies.",
)
def get_companies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Company).filter(Company.is_deleted == False).all()


@router.post(
    "/",
    response_model=CompanyResponse,
    status_code=201,
    summary="Create a new company",
    description="Creates a new company record.",
)
def create_company(company: CompanyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_company = Company(**company.dict())
    db_company.created_by = current_user.id
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.get(
    "/export",
    summary="Export companies as CSV",
    description="Downloads all non-deleted companies as a CSV file.",
)
def export_companies_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    companies = db.query(Company).filter(Company.is_deleted == False).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write header row
    writer.writerow(["ID", "Name", "Industry", "Website", "Phone", "Created At"])

    # Write data rows
    for company in companies:
        writer.writerow([
            company.id,
            company.name,
            company.industry or "",
            company.website or "",
            company.phone or "",
            company.created_at.strftime("%Y-%m-%d %H:%M:%S") if company.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=companies.csv"},
    )


# ─── NEW: connected detail view ──────────────────────────────────────
# Kept as a separate route (/detail suffix) rather than changing the
# existing GET /{company_id} response_model, so nothing that already
# depends on the plain CompanyResponse shape breaks.
@router.get(
    "/{company_id}/detail",
    response_model=CompanyDetailResponse,
    summary="Get a company with its contacts and deals",
    description=(
        "Returns a single company plus every non-deleted contact linked to it, "
        "and every non-deleted deal linked through those contacts."
    ),
)
def get_company_detail(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id, Company.is_deleted == False).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    contacts = (
        db.query(Contact)
        .filter(Contact.company_id == company_id, Contact.is_deleted == False)
        .all()
    )
    contact_ids = [c.id for c in contacts]

    deals = []
    if contact_ids:
        deals = (
            db.query(Deal)
            .filter(Deal.contact_id.in_(contact_ids), Deal.is_deleted == False)
            .all()
        )
    deal_ids = [d.id for d in deals]

    # Tasks and Activities have no direct company_id — they're reached
    # through this company's contacts and deals.
    tasks = []
    activities = []
    if contact_ids or deal_ids:
        task_query = db.query(Task).filter(Task.is_deleted == False)
        activity_query = db.query(Activity).filter(Activity.is_deleted == False)

        conditions_t = []
        conditions_a = []
        if contact_ids:
            conditions_t.append(Task.contact_id.in_(contact_ids))
            conditions_a.append(Activity.contact_id.in_(contact_ids))
        if deal_ids:
            conditions_t.append(Task.deal_id.in_(deal_ids))
            conditions_a.append(Activity.deal_id.in_(deal_ids))

        from sqlalchemy import or_
        tasks = task_query.filter(or_(*conditions_t)).all()
        activities = activity_query.filter(or_(*conditions_a)).all()

    response = CompanyDetailResponse.model_validate(company)
    response.contacts = contacts
    response.deals = deals
    response.tasks = tasks
    response.activities = activities
    return response

@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
    summary="Get a single company",
    description="Returns a single company by ID, if it exists and is not deleted.",
)
def get_company(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id, Company.is_deleted == False).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.is_deleted == False
    ).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    print("BEFORE:", company.name)
    print("REQUEST:", company_update.dict(exclude_unset=True))

    for key, value in company_update.dict(exclude_unset=True).items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)

    print("AFTER:", company.name)

    return company

@router.delete(
    "/{company_id}",
    status_code=204,
    summary="Delete a company",
    description="Soft-deletes a company, removing it from listings without permanently deleting the record.",
)
def delete_company(company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id, Company.is_deleted == False).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_deleted = True
    company.deleted_at = func.now()
    company.updated_by = current_user.id
    db.commit()
    return None