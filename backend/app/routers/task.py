from datetime import date
import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import Date
from sqlalchemy.sql import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Task, User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("/", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.is_deleted == False).all()


@router.get("/today", response_model=list[TaskResponse])
def get_today_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()

    return (
        db.query(Task)
        .filter(Task.is_deleted == False)
        .filter(Task.due_date.isnot(None))
        .filter(Task.due_date.cast(Date) == today)
        .all()
    )


@router.get(
    "/export",
    summary="Export tasks as CSV",
    description="Downloads all non-deleted tasks as a CSV file.",
)
def export_tasks_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.is_deleted == False).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Title", "Description", "Priority", "Status", "Due Date", "Created At"])

    for task in tasks:
        writer.writerow([
            task.id,
            task.title,
            task.description or "",
            task.priority.value if hasattr(task.priority, "value") else str(task.priority),
            "Done" if task.is_completed else "Pending",
            task.due_date.strftime("%Y-%m-%d") if task.due_date else "",
            task.created_at.strftime("%Y-%m-%d %H:%M:%S") if task.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tasks.csv"},
    )


@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_task = Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        lead_id=task.lead_id,
        contact_id=task.contact_id,
        deal_id=task.deal_id,
        assigned_to_id=task.assigned_to_id or current_user.id,
        is_completed=False,
    )
    new_task.created_by = current_user.id

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_by = current_user.id
    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted == False).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_deleted = True
    task.deleted_at = func.now()
    task.updated_by = current_user.id
    db.commit()

    return {"message": "Task deleted successfully"}