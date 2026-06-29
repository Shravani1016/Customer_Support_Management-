from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from typing import List

from app.database import get_db

from app.models.models import Deal

from app.schemas.deal import DealCreate, DealUpdate, DealResponse

from app.dependencies import get_current_user

from app.models.models import User

router = APIRouter(prefix="/api/deals", tags=["Deals"])

@router.get("/", response_model=List[DealResponse])

def get_deals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    return db.query(Deal).all()

@router.post("/", response_model=DealResponse, status_code=201)

def create_deal(deal: DealCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    db_deal = Deal(**deal.dict(), owner_id=current_user.id)

    db.add(db_deal)

    db.commit()

    db.refresh(db_deal)

    return db_deal

@router.get("/{deal_id}", response_model=DealResponse)

def get_deal(deal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    deal = db.query(Deal).filter(Deal.id == deal_id).first()

    if not deal:

        raise HTTPException(status_code=404, detail="Deal not found")

    return deal

@router.put("/{deal_id}", response_model=DealResponse)

def update_deal(deal_id: int, deal_update: DealUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    deal = db.query(Deal).filter(Deal.id == deal_id).first()

    if not deal:

        raise HTTPException(status_code=404, detail="Deal not found")

    for key, value in deal_update.dict(exclude_unset=True).items():

        setattr(deal, key, value)

    db.commit()

    db.refresh(deal)

    return deal

@router.delete("/{deal_id}", status_code=204)

def delete_deal(deal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    deal = db.query(Deal).filter(Deal.id == deal_id).first()

    if not deal:

        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(deal)

    db.commit()
