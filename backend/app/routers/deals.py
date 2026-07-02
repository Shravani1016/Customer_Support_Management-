from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.models import Deal, DealStageEnum
from app.schemas.deal import DealCreate, DealUpdate, DealResponse
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
    db.commit()
