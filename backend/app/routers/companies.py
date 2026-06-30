from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List

from app.database import get_db
from app.models.models import Company
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
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


@router.put(
    "/{company_id}",
    response_model=CompanyResponse,
    summary="Update a company",
    description="Updates one or more fields on an existing company.",
)
def update_company(company_id: int, company_update: CompanyUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == company_id, Company.is_deleted == False).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    for key, value in company_update.dict(exclude_unset=True).items():
        setattr(company, key, value)

    company.updated_by = current_user.id
    db.commit()
    db.refresh(company)
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