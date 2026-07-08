from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from app.database import get_db
from app.models.models import Activity, User
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.dependencies import get_current_user

router = APIRouter(tags=["Activities"])

@router.get(
    "/api/activities",
    response_model=List[ActivityResponse],
    summary="Get all activities",
    description="""
Returns a list of all activities ordered by most recent first.

**Activity types:**
- `call` → Phone call log
- `email` → Email log
- `note` → General note
- `meeting` → Meeting log

**Note:** Soft deleted activities are excluded.
    """
)
def get_activities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Activity).filter(Activity.is_deleted == False).order_by(Activity.created_at.desc()).all()


@router.get(
    "/api/activities/export",
    summary="Export activities as CSV",
    description="Downloads all non-deleted activities as a CSV file.",
)
def export_activities_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activities = db.query(Activity).filter(Activity.is_deleted == False).order_by(Activity.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Type", "Note", "Lead ID", "Contact ID", "Deal ID", "Created At"])

    for act in activities:
        writer.writerow([
            act.id,
            act.type.value if hasattr(act.type, "value") else str(act.type),
            act.note or "",
            act.lead_id or "",
            act.contact_id or "",
            act.deal_id or "",
            act.created_at.strftime("%Y-%m-%d %H:%M:%S") if act.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=activities.csv"},
    )


@router.get(
    "/api/activities/trash",
    response_model=List[ActivityResponse],
    summary="List deleted activities",
    description="Returns all soft-deleted activities, most recently deleted first.",
)
def get_deleted_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Activity)
        .filter(Activity.is_deleted == True)
        .order_by(Activity.deleted_at.desc())
        .all()
    )


@router.post(
    "/api/activities/{activity_id}/restore",
    response_model=ActivityResponse,
    summary="Restore a deleted activity",
    description="Restores a soft-deleted activity by setting is_deleted = False and clearing deleted_at.",
)
def restore_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    activity = (
        db.query(Activity)
        .filter(Activity.id == activity_id, Activity.is_deleted == True)
        .first()
    )
    if not activity:
        raise HTTPException(status_code=404, detail="Deleted activity not found")

    activity.is_deleted = False
    activity.deleted_at = None
    db.commit()
    db.refresh(activity)

    return activity


@router.post(
    "/api/activities",
    response_model=ActivityResponse,
    status_code=201,
    summary="Create a new activity",
    description="""
Log a new activity in the CRM system.

**Required fields:**
- `type` → Activity type (call, email, note, meeting)

**Optional fields:**
- `note` → Activity description
- `lead_id` → Link to a lead
- `contact_id` → Link to a contac
- `deal_id` → Link to a deal
    """
)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_activity = Activity(
        **activity.dict(),
        created_by_id=current_user.id
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


@router.put(
    "/api/activities/{activity_id}",
    response_model=ActivityResponse,
    summary="Update an activity",
    description="Updates the type and/or note of an existing activity.",
)
def update_activity(activity_id: int, activity_update: ActivityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.is_deleted == False).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    for key, value in activity_update.dict(exclude_unset=True).items():
        setattr(activity, key, value)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete(
    "/api/activities/{activity_id}",
    status_code=204,
    summary="Delete an activity",
    description="""
Soft deletes an activity by setting `is_deleted = True`.

The activity is not permanently removed from the database.

**Returns 404** if activity not found or already deleted.
    """
)
def delete_activity(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.is_deleted == False).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    activity.is_deleted = True
    db.commit()