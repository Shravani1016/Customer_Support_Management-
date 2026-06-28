# Database Design

## Overview

The Customer Relationship Management (CRM) system uses PostgreSQL as its primary relational database. The database is designed to efficiently store and manage customer information, sales data, tasks, and follow-up activities while maintaining data integrity and scalability.

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

- User ID (Primary Key)
- Full Name
- Email
- Password Hash
- Role
- Status
- Created At
- Updated At

---

## Companies

Stores organization information.

### Fields

- Company ID (Primary Key)
- Company Name
- Industry
- Email
- Phone Number
- Website
- Address
- Status
- Created At
- Updated At

---

## Contacts

Stores individual contacts associated with companies.

### Fields

- Contact ID (Primary Key)
- Company ID (Foreign Key)
- Name
- Email
- Phone
- Designation
- Created At
- Updated At

---

## Leads

Stores potential sales opportunities.

### Fields

- Lead ID (Primary Key)
- Company ID (Foreign Key)
- Contact ID (Foreign Key)
- Lead Status
- Source
- Assigned User
- Notes
- Created At
- Updated At

---

## Deals

Stores active business opportunities.

### Fields

- Deal ID (Primary Key)
- Lead ID (Foreign Key)
- Deal Value
- Deal Stage
- Expected Closing Date
- Created At
- Updated At

---

## Tasks

Stores tasks assigned to users.

### Fields

- Task ID (Primary Key)
- Assigned User
- Title
- Description
- Priority
- Due Date
- Status
- Created At
- Updated At

---

## Follow-ups

Stores follow-up activities related to leads and deals.

### Fields

- Follow-up ID (Primary Key)
- Lead ID (Foreign Key)
- Follow-up Date
- Notes
- Status
- Created At
- Updated At

---

## Activities

Stores user activity logs.

### Fields

- Activity ID (Primary Key)
- User ID (Foreign Key)
- Activity Type
- Description
- Timestamp

---

# Entity Relationships

The CRM database follows relational database principles.

```text
Company
   │
   ├──────────────┐
   ▼              ▼
Contact        Lead
                  │
                  ▼
                Deal
                  │
                  ▼
                Task
                  │
                  ▼
             Follow-up

User
  │
  ▼
Activity
```

---

# Foreign Keys

The database uses foreign keys to maintain relationships between tables.

Examples include:

- Company → Contacts
- Company → Leads
- Contact → Leads
- Lead → Deals
- Lead → Follow-ups
- User → Activities

---

# Audit Columns

Most tables include audit fields to track record creation and updates.

Common audit columns include:

- Created At
- Updated At
- Created By (optional)
- Updated By (optional)

---

# Soft Delete

Instead of permanently deleting records, the CRM system is designed to support soft deletion.

Example fields:

- Is Deleted
- Deleted At

Benefits include:

- Data recovery
- Audit support
- Prevent accidental data loss

---

# Database Indexing

Indexes are planned for frequently searched columns to improve query performance.

Examples include:

- Email
- Company Name
- Lead Status
- Deal Stage
- User ID

---

# ER Diagram

The Entity Relationship (ER) Diagram illustrates the relationships between all CRM entities.

The ER diagram is available in:

```text
documentation/er-diagram.png
```

---

# Future Enhancements

The database design can be extended to support:

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