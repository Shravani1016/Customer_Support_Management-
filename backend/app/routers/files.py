from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from pathlib import Path
import shutil

from app.database import get_db
from app.models.models import File as FileModel
from app.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/files", tags=["Files"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_file(
    company_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filepath = UPLOAD_DIR / file.filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_file = FileModel(
        filename=file.filename,
        filepath=str(filepath),
        company_id=company_id,
        uploaded_by=current_user.id,
    )

    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return db_file