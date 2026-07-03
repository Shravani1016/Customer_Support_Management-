from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
import csv
import io

from app.database import get_db
from app.models.models import Contact
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])


@router.get(
    "/",
    response_model=List[ContactResponse],
    summary="List all contacts",
    description="Returns all non-deleted contacts.",
)
def get_contacts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Contact).filter(Contact.is_deleted == False).all()


@router.post(
    "/",
    response_model=ContactResponse,
    status_code=201,
    summary="Create a new contact",
    description="Creates a new contact, optionally linked to a company.",
)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_contact = Contact(**contact.dict())
    db_contact.created_by = current_user.id
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.get(
    "/export",
    summary="Export contacts as CSV",
    description="Downloads all non-deleted contacts as a CSV file.",
)
def export_contacts_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contacts = db.query(Contact).filter(Contact.is_deleted == False).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write header row
    writer.writerow(["ID", "First Name", "Last Name", "Email", "Phone", "Created At"])

    # Write data rows
    for contact in contacts:
        writer.writerow([
            contact.id,
            contact.first_name,
            contact.last_name,
            contact.email or "",
            contact.phone or "",
            contact.created_at.strftime("%Y-%m-%d %H:%M:%S") if contact.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=contacts.csv"},
    )


@router.get(
    "/{contact_id}",
    response_model=ContactResponse,
    summary="Get a single contact",
    description="Returns a single contact by ID, if it exists and is not deleted.",
)
def get_contact(contact_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contact = db.query(Contact).filter(Contact.id == contact_id, Contact.is_deleted == False).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.put(
    "/{contact_id}",
    response_model=ContactResponse,
    summary="Update a contact",
    description="Updates one or more fields on an existing contact.",
)
def update_contact(contact_id: int, contact_update: ContactUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contact = db.query(Contact).filter(Contact.id == contact_id, Contact.is_deleted == False).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for key, value in contact_update.dict(exclude_unset=True).items():
        setattr(contact, key, value)

    contact.updated_by = current_user.id
    db.commit()
    db.refresh(contact)
    return contact


@router.delete(
    "/{contact_id}",
    status_code=204,
    summary="Delete a contact",
    description="Soft-deletes a contact, removing it from listings without permanently deleting the record.",
)
def delete_contact(contact_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contact = db.query(Contact).filter(Contact.id == contact_id, Contact.is_deleted == False).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.is_deleted = True
    contact.deleted_at = func.now()
    contact.updated_by = current_user.id
    db.commit()
    return None