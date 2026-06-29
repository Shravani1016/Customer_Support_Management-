from app.models.mixins import TimestampMixin, SoftDeleteMixin
from sqlalchemy import (
    Column, Integer, String, Enum, ForeignKey,
    DateTime, Float, Text, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base  # ← changed from app.core.database


# ─── Enums ───────────────────────────────────────────
class RoleEnum(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    sales_rep = "sales_rep"

class LeadStatusEnum(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    lost = "lost"
    converted = "converted"

class DealStageEnum(str, enum.Enum):
    prospecting = "prospecting"
    proposal = "proposal"
    negotiation = "negotiation"
    closed_won = "closed_won"
    closed_lost = "closed_lost"

class TaskPriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class ActivityTypeEnum(str, enum.Enum):
    call = "call"
    email = "email"
    note = "note"
    meeting = "meeting"


# ─── Users ───────────────────────────────────────────
class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.sales_rep, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    leads = relationship("Lead", back_populates="owner")
    deals = relationship("Deal", back_populates="owner")
    tasks = relationship("Task", back_populates="assigned_to")
    activities = relationship("Activity", back_populates="created_by")


# ─── Companies ───────────────────────────────────────
class Company(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String)
    website = Column(String)
    phone = Column(String)
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contacts = relationship("Contact", back_populates="company")


# ─── Contacts ────────────────────────────────────────
class Contact(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, index=True)
    phone = Column(String)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="contacts")
    deals = relationship("Deal", back_populates="contact")


# ─── Leads ───────────────────────────────────────────
class Lead(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, index=True)
    phone = Column(String)
    status = Column(Enum(LeadStatusEnum), default=LeadStatusEnum.new)
    source = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="leads")


# ─── Deals ───────────────────────────────────────────
class Deal(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    value = Column(Float, default=0.0)
    stage = Column(Enum(DealStageEnum), default=DealStageEnum.prospecting)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    expected_close_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contact = relationship("Contact", back_populates="deals")
    owner = relationship("User", back_populates="deals")


# ─── Tasks ───────────────────────────────────────────
class Task(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    due_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(Enum(TaskPriorityEnum), default=TaskPriorityEnum.medium)
    is_completed = Column(Boolean, default=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Polymorphic links — link to any entity
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assigned_to = relationship("User", back_populates="tasks")


# ─── Activities / Notes ──────────────────────────────
class Activity(Base, SoftDeleteMixin):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ActivityTypeEnum), nullable=False)
    note = Column(Text)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Polymorphic links
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    created_by = relationship("User", back_populates="activities")