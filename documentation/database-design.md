# Database Design

## Overview

The Customer Relationship Management (CRM) system uses PostgreSQL as its primary relational database. The database is designed to efficiently store and manage customer information, sales data, tasks, and activity logs while maintaining data integrity and scalability.

---

# Database Technology

| Database | PostgreSQL |
|----------|------------|
| Type | Relational Database Management System (RDBMS) |
| ORM | SQLAlchemy |
| Migration Tool | Alembic |

---

# Database Design Principles

The database is designed following these principles:

- Proper Relationships
- Foreign Keys
- Data Integrity
- Normalized Tables
- Soft Delete
- Audit Columns
- Indexing
- Scalability

---

# Core Database Tables

The CRM system consists of the following core tables:

## Users

Stores user account information.

### Fields

- ID (Primary Key)
- Email (Unique)
- Full Name
- Hashed Password
- Refresh Token
- Role (Admin, Manager, Sales Rep)
- Is Active
- Created At, Updated At, Created By, Updated By
- Is Deleted, Deleted At

---

## Companies

Stores organization information.

### Fields

- ID (Primary Key)
- Name
- Industry
- Website
- Phone
- Address
- Created At, Updated At, Created By, Updated By
- Is Deleted, Deleted At

---

## Contacts

Stores individual contacts associated with companies.

### Fields

- ID (Primary Key)
- Company ID (Foreign Key → Companies)
- First Name
- Last Name
- Email
- Phone
- Created At, Updated At, Created By, Updated By
- Is Deleted, Deleted At

---

## Leads

Stores potential sales opportunities.

### Fields

- ID (Primary Key)
- Owner ID (Foreign Key → Users)
- Name
- Email
- Phone
- Status (New, Contacted, Qualified, Lost, Converted)
- Source
- Created At, Updated At, Created By, Updated By
- Is Deleted, Deleted At

---

## Deals

Stores active business opportunities in the sales pipeline.

### Fields

- ID (Primary Key)
- Contact ID (Foreign Key → Contacts)
- Owner ID (Foreign Key → Users)
- Title
- Value
- Stage (Prospecting, Proposal, Negotiation, Closed Won, Closed Lost)
- Expected Close Date
- Created At, Updated At, Created By, Updated By
- Is Deleted, Deleted At

---

## Tasks

Stores tasks assigned to users, optionally linked to a lead, contact, or deal.

### Fields

- ID (Primary Key)
- Assigned To ID (Foreign Key → Users)
- Lead ID (Foreign Key → Leads, optional)
- Contact ID (Foreign Key → Contacts, optional)
- Deal ID (Foreign Key → Deals, optional)
- Title
- Description
- Priority (Low, Medium, High)
- Due Date
- Is Completed
- Created At, Updated At, Created By, Updated By
- Is Deleted, Deleted At

---

## Activities

Stores logged interactions (calls, emails, notes, meetings), optionally linked to a lead, contact, or deal.

### Fields

- ID (Primary Key)
- Created By ID (Foreign Key → Users)
- Lead ID (Foreign Key → Leads, optional)
- Contact ID (Foreign Key → Contacts, optional)
- Deal ID (Foreign Key → Deals, optional)
- Type (Call, Email, Note, Meeting)
- Note
- Created At
- Is Deleted, Deleted At

> Note: Activities do not track Updated At / Updated By, since activity logs are treated as immutable once created.

---

## Follow-ups (Planned)

> Status: Not yet implemented. No `Follow-up` table currently exists in the schema — planned for a future phase.

---

# Entity Relationships

```text
Users
  │
  ├── owns ──────────► Leads
  ├── owns ──────────► Deals
  ├── assigned_to ───► Tasks
  └── created_by ────► Activities

Companies
  │
  └── has ───────────► Contacts
                          │
                          ├── linked_to ─► Deals
                          ├── linked_to ─► Tasks
                          └── linked_to ─► Activities

Leads ──linked_to──► Tasks, Activities
Deals ──linked_to──► Tasks, Activities
```

---

# Foreign Keys

The database uses foreign keys to maintain relationships between tables.

Examples include:

- Companies → Contacts
- Contacts → Deals
- Users → Leads (owner)
- Users → Deals (owner)
- Users → Tasks (assigned_to)
- Users → Activities (created_by)
- Leads / Contacts / Deals → Tasks (optional polymorphic links)
- Leads / Contacts / Deals → Activities (optional polymorphic links)

---

# Audit Columns

Most tables include audit fields to track record creation and updates:

- Created At
- Updated At
- Created By
- Updated By

> Activities intentionally exclude Updated At / Updated By, since activity logs are immutable.

---

# Soft Delete

Instead of permanently deleting records, all core tables support soft deletion.

Fields:

- Is Deleted
- Deleted At

Benefits include:

- Data recovery
- Audit support
- Prevent accidental data loss

---

# Database Indexing

Indexed columns for frequently searched fields:

- Email (Users, Contacts, Leads)
- ID fields (all primary/foreign keys)

---

# Data Export

The system supports CSV export for Leads, Contacts, and Companies via dedicated `/export` endpoints on each router (e.g. `GET /api/leads/export`), returning a streamed CSV file generated directly from the current table data.

CSV import is not yet implemented — see Future Enhancements.

---

# ER Diagram

The Entity Relationship (ER) Diagram illustrates the relationships between all CRM entities.

- Interactive (Mermaid): [`docs/ER_DIAGRAM.md`](../docs/ER_DIAGRAM.md)
- Static image: `documentation/er-diagram.png`

---

# Future Enhancements

The database design can be extended to support:

- CSV Import for Leads, Contacts, and Companies
- Follow-up / Reminder Tracking
- Customer Support Tickets
- Email History
- File Attachments
- Calendar Events
- Notifications
- AI Lead Scoring
- Multi-Tenant Architecture

---

# Conclusion

The database design provides a structured, scalable, and secure foundation for the CRM system. By following relational database principles, using PostgreSQL, and implementing proper relationships, foreign keys, audit columns, soft delete, and indexing, the design supports efficient data management and future project growth.