# API Overview

## Overview

The Customer Relationship Management (CRM) system is designed using a RESTful API architecture. The backend, built with FastAPI, exposes APIs that enable communication between the frontend and the PostgreSQL database.

All APIs are designed to exchange data in JSON format and are secured using JWT-based authentication.

---

# API Architecture

```text
Client (Next.js)
        │
        │ HTTP/HTTPS
        ▼
REST APIs (FastAPI)
        │
        ▼
Business Logic
        │
        ▼
SQLAlchemy ORM
        │
        ▼
PostgreSQL Database
```

---

# API Features

The CRM APIs are designed to support:

- RESTful Architecture
- JSON Request and Response
- JWT Authentication (access + refresh tokens)
- Role-Based Authorization
- Request Validation
- Exception Handling
- API Documentation using Swagger/OpenAPI
- Secure Data Access
- CSV Import/Export for bulk data operations

---

# Authentication APIs

These APIs manage user authentication and authorization.

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | User login (returns access + refresh token) |
| POST | `/api/auth/refresh` | Generate new access token using refresh token |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current logged-in user details |

---

# Company APIs

These APIs manage company records.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/companies` | Get all companies |
| GET | `/api/companies/{id}` | Get company details |
| POST | `/api/companies` | Create company |
| PUT | `/api/companies/{id}` | Update company |
| DELETE | `/api/companies/{id}` | Delete company (soft delete) |

---

# Contact APIs

These APIs manage company contacts.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/contacts` | Get all contacts |
| GET | `/api/contacts/{id}` | Get contact details |
| POST | `/api/contacts` | Create contact |
| PUT | `/api/contacts/{id}` | Update contact |
| DELETE | `/api/contacts/{id}` | Delete contact (soft delete) |

---

# Lead APIs

These APIs manage customer leads.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/leads` | Get all leads |
| GET | `/api/leads/{id}` | Get lead details |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/{id}` | Update lead |
| DELETE | `/api/leads/{id}` | Delete lead (soft delete) |
| POST | `/api/leads/{id}/convert` | Convert a qualified lead into a Contact, Company, and Deal |

---

# Deal APIs

These APIs manage the sales pipeline.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/deals` | Get all deals |
| GET | `/api/deals/{id}` | Get deal details |
| POST | `/api/deals` | Create deal |
| PUT | `/api/deals/{id}` | Update deal |
| PATCH | `/api/deals/{id}/stage` | Update deal stage (used by Kanban drag-and-drop) |
| DELETE | `/api/deals/{id}` | Delete deal (soft delete) |

---

# Task APIs

These APIs manage user tasks.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

---

# Activity APIs

These APIs record and retrieve activity logs.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/activities` | Get activity logs |
| POST | `/api/activities` | Create activity log |
| DELETE | `/api/activities/{id}` | Delete activity log |

---

# Reports & Analytics APIs

These APIs provide aggregated analytics computed from existing CRM data (Leads, Deals, Tasks, Activities). There is no dedicated Reports table — all data is calculated on request.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reports/summary` | Key metrics: total revenue, pipeline value, win rate, active deals |
| GET | `/api/reports/leads-by-status` | Lead distribution by status (pie chart data) |
| GET | `/api/reports/deals-by-stage` | Deal distribution by pipeline stage (bar chart data) |
| GET | `/api/reports/revenue-trend` | Revenue trend for closed-won deals over time |

---

# Data Import & Export APIs

> **Note:** This feature is under active development. Endpoints below will be confirmed and finalized once merged into the main branch.

The system supports CSV-based bulk import and export for key entities.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/leads/export` | Export leads to CSV/Excel |
| POST | `/api/leads/import` | Bulk import leads from CSV |
| GET | `/api/contacts/export` | Export contacts to CSV/Excel |
| GET | `/api/companies/export` | Export companies to CSV/Excel |

---

# Follow-up APIs (Planned)

> Status: Not yet implemented — planned for a future phase. No `Follow-up` database table currently exists.

---

# Request Validation

The CRM APIs use Pydantic models to validate incoming request data before processing.

Validation helps:

- Ensure correct data types
- Prevent invalid input
- Improve API reliability

---

# Authentication & Authorization

Protected APIs require a valid JWT Access Token.

Security features include:

- JWT Authentication (30-min access token, 7-day refresh token)
- Refresh Token Support
- Role-Based Authorization (Admin, Manager, Sales Rep)
- Protected Endpoints

---

# API Documentation

FastAPI automatically generates interactive API documentation using Swagger/OpenAPI, available at `/docs`.

Developers can:

- View all endpoints
- Test APIs
- Review request and response models
- Explore authentication requirements

---

# Error Handling

The API is designed to return standard HTTP status codes.

Common responses include:

| Status Code | Meaning |
|-------------|----------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 422 | Unprocessable Content (validation error) |
| 500 | Internal Server Error |

---

# Future Enhancements

The API can be extended to support:

- Follow-up Management APIs
- Email Notifications
- File Upload APIs
- AI Lead Scoring APIs
- Calendar Integration
- Third-party Integrations

---

# Conclusion

The CRM API is designed following RESTful principles and modern security practices. By using FastAPI, JWT authentication, SQLAlchemy, and Swagger/OpenAPI, the system provides a scalable and maintainable backend that supports efficient communication between the frontend and the database.