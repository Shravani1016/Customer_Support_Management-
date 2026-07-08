import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import File as FileModel
from app.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/files", tags=["Files"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB, adjust as needed


@router.post("/upload")
async def upload_file(
    company_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Read file into memory once to check size (fine for small/medium files;
    # for very large files, switch to chunked streaming with a running counter)
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    # Generate a safe, collision-proof filename; keep original name for display only
    original_name = Path(file.filename).name  # strips any directory components
    ext = Path(original_name).suffix
    unique_name = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / unique_name

    with open(filepath, "wb") as buffer:
        buffer.write(contents)

    db_file = FileModel(
        filename=original_name,       # original name shown to users
        filepath=str(filepath),       # actual unique path on disk
        company_id=company_id,
        uploaded_by=current_user.id,
    )

    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return db_file


@router.get("/{file_id}/download")
async def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    filepath = Path(db_file.filepath)
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File missing on server")

    return FileResponse(
        path=filepath,
        filename=db_file.filename,  # sends back the original name, not the UUID one
    )


@router.get("/company/{company_id}")
async def list_company_files(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    files = db.query(FileModel).filter(FileModel.company_id == company_id).all()
    return files