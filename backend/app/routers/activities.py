from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Activity, Task
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.dependencies import get_current_user
from app.models.models import User

router = APIRouter(tags=["Activities & Tasks"])

# ── Activities ──────────────────────────────

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
- `contact_id` → Link to a contact
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


# ── Tasks ──────────────────────────────

@router.get(
    "/api/tasks",
    response_model=List[TaskResponse],
    summary="Get all tasks",
    description="""
Returns a list of all active tasks ordered by due date (earliest first).

**Priority levels:**
- `low` → Low priority
- `medium` → Medium priority
- `high` → High priority

**Note:** Soft deleted tasks are excluded. Tasks with no due date appear last.
    """
)
def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.is_deleted == False).order_by(Task.due_date.asc().nullslast()).all()


@router.post(
    "/api/tasks",
    response_model=TaskResponse,
    status_code=201,
    summary="Create a new task",
    description="""
Create a new task in the CRM system.

**Required fields:**
- `title` → Task name

**Optional fields:**
- `description` → Task details
- `due_date` → Task deadline
- `priority` → low, medium, high (default: medium)
- `lead_id` → Link to a lead
- `contact_id` → Link to a contact
- `deal_id` → Link to a deal
    """
)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_task = Task(
        **task.dict(),
        assigned_to_id=current_user.id,
        created_by=current_user.id,
        updated_by=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.put(
    "/api/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    description="""
Update any fields of an existing task.

All fields are optional — only provided fields will be updated.

**Commonly updated fields:**
- `is_completed` → Mark task as done/undone
- `priority` → Change priority
- `due_date` → Update deadline

**Returns 404** if task not found or is deleted.
    """
)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(task, key, value)
    task.updated_by = current_user.id
    db.commit()
    db.refresh(task)
    return task


@router.delete(
    "/api/tasks/{task_id}",
    status_code=204,
    summary="Delete a task",
    description="""
Soft deletes a task by setting `is_deleted = True`.

The task is not permanently removed from the database.

**Returns 404** if task not found or already deleted.
    """
)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.is_deleted = True
    db.commit()
