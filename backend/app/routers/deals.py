from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
from pydantic import BaseModel
import csv
import io
from app.database import get_db
from app.models.models import Deal, DealStageEnum
from app.schemas.deal import (
    DealCreate, DealUpdate, DealResponse,
    DealContactSummary, DealOwnerSummary, DealDetailResponse, ActiveStatusUpdate,
)
from app.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/deals", tags=["Deals"])

class StageUpdate(BaseModel):
    stage: DealStageEnum

@router.get(
    "/",
    response_model=List[DealResponse],
    summary="Get all deals",
    description="""
Returns a list of all active deals in the CRM.

**Stages available:**
- `prospecting` → Initial stage
- `proposal` → Proposal sent
- `negotiation` → In negotiation
- `closed_won` → Deal won
- `closed_lost` → Deal lost

**Note:** Soft deleted deals are excluded.
    """
)
def get_deals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Deal).filter(Deal.is_deleted == False).all()


@router.post(
    "/",
    response_model=DealResponse,
    status_code=201,
    summary="Create a new deal",
    description="""
Create a new deal in the CRM system.

**Required fields:**
- `title` → Deal name
- `value` → Deal value in dollars
- `stage` → Current pipeline stage

**Optional fields:**
- `contact_id` → Link to a contact
- `expected_close_date` → Expected closing date
    """
)
def create_deal(deal: DealCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_deal = Deal(**deal.dict(), owner_id=current_user.id, created_by=current_user.id, updated_by=current_user.id)
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


@router.get(
    "/export",
    summary="Export deals as CSV",
    description="Downloads all non-deleted deals as a CSV file.",
)
def export_deals_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deals = db.query(Deal).filter(Deal.is_deleted == False).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write header row
    writer.writerow(["ID", "Title", "Value ($)", "Stage", "Expected Close Date", "Created At"])

    # Write data rows
    for deal in deals:
        writer.writerow([
            deal.id,
            deal.title,
            deal.value,
            deal.stage.value if deal.stage else "",
            deal.expected_close_date.strftime("%Y-%m-%d") if deal.expected_close_date else "",
            deal.created_at.strftime("%Y-%m-%d %H:%M:%S") if deal.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=deals.csv"},
    )


@router.get(
    "/trash",
    response_model=List[DealResponse],
    summary="List deleted deals",
    description="Returns all soft-deleted deals, most recently deleted first.",
)
def get_deleted_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Deal)
        .filter(Deal.is_deleted == True)
        .order_by(Deal.deleted_at.desc())
        .all()
    )


@router.post(
    "/{deal_id}/restore",
    response_model=DealResponse,
    summary="Restore a deleted deal",
    description="Restores a soft-deleted deal by setting is_deleted = False and clearing deleted_at.",
)
def restore_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = (
        db.query(Deal)
        .filter(Deal.id == deal_id, Deal.is_deleted == True)
        .first()
    )
    if not deal:
        raise HTTPException(status_code=404, detail="Deleted deal not found")

    deal.is_deleted = False
    deal.deleted_at = None
    db.commit()
    db.refresh(deal)

    return deal

@router.patch(
    "/{deal_id}/active",
    response_model=DealResponse,
    summary="Toggle active/inactive status",
    description="Sets is_active to true or false for this deal.",
)
def update_deal_active_status(
    deal_id: int,
    status_update: ActiveStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.is_deleted == False).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal.is_active = status_update.is_active
    deal.updated_by = current_user.id
    db.commit()
    db.refresh(deal)
    return deal

@router.get(
    "/detail",
    response_model=List[DealDetailResponse],
    summary="Get all deals with contact, company, and owner details",
    description="Same as GET /api/deals/, but includes nested contact (with company name) and owner info — used for the table view.",
)
def get_deals_detail(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deals = db.query(Deal).filter(Deal.is_deleted == False).all()

    results = []
    for deal in deals:
        contact_summary = None
        if deal.contact:
            contact_summary = DealContactSummary(
                id=deal.contact.id,
                first_name=deal.contact.first_name,
                last_name=deal.contact.last_name,
                email=deal.contact.email,
                company_id=deal.contact.company_id,
                company_name=deal.contact.company.name if deal.contact.company else None,
            )

        owner_summary = None
        if deal.owner:
            owner_summary = DealOwnerSummary(id=deal.owner.id, full_name=deal.owner.full_name)

        results.append(
    DealDetailResponse(
        id=deal.id,
        title=deal.title,
        value=deal.value,
        stage=deal.stage,
        contact_id=deal.contact_id,
        owner_id=deal.owner_id,
        expected_close_date=deal.expected_close_date,
        is_active=deal.is_active,
        created_at=deal.created_at,
        contact=contact_summary,
        owner=owner_summary,
    )
)
    return results

@router.get(
    "/{deal_id}",
    response_model=DealResponse,
    summary="Get a single deal",
    description="""
Returns details of a specific deal by ID.

**Returns 404** if deal not found or is deleted.
    """
)
def get_deal(deal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.is_deleted == False).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.put(
    "/{deal_id}",
    response_model=DealResponse,
    summary="Update a deal",
    description="""
Update any fields of an existing deal.

All fields are optional — only provided fields will be updated.

**Returns 404** if deal not found or is deleted.
    """
)
def update_deal(deal_id: int, deal_update: DealUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.is_deleted == False).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    for key, value in deal_update.dict(exclude_unset=True).items():
        setattr(deal, key, value)
    deal.updated_by = current_user.id
    db.commit()
    db.refresh(deal)
    return deal


@router.patch(
    "/{deal_id}/stage",
    response_model=DealResponse,
    summary="Update deal stage",
    description="""
Update only the stage of a deal. Used by the Kanban board drag and drop.

**Available stages:**
- `prospecting`
- `proposal`
- `negotiation`
- `closed_won`
- `closed_lost`

**Returns 404** if deal not found or is deleted.
    """
)
def update_deal_stage(deal_id: int, stage_update: StageUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.is_deleted == False).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal.stage = stage_update.stage
    deal.updated_by = current_user.id
    db.commit()
    db.refresh(deal)
    return deal


@router.delete(
    "/{deal_id}",
    status_code=204,
    summary="Delete a deal",
    description="""
Soft deletes a deal by setting `is_deleted = True`.

The deal is not permanently removed from the database.

**Returns 404** if deal not found or already deleted.
    """
)
def delete_deal(deal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.is_deleted == False).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal.is_deleted = True
    deal.deleted_at = func.now()
    deal.updated_by = current_user.id
    db.commit()
    return None