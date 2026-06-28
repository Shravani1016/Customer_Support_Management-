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
- JWT Authentication
- Role-Based Authorization
- Request Validation
- Exception Handling
- API Documentation using Swagger/OpenAPI
- Secure Data Access

---

# Authentication APIs

These APIs manage user authentication and authorization.

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh-token` | Generate new access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| POST | `/auth/change-password` | Change password |

---

# Company APIs

These APIs manage company records.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/companies` | Get all companies |
| GET | `/companies/{id}` | Get company details |
| POST | `/companies` | Create company |
| PUT | `/companies/{id}` | Update company |
| DELETE | `/companies/{id}` | Delete company |

---

# Contact APIs

These APIs manage company contacts.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/contacts` | Get all contacts |
| GET | `/contacts/{id}` | Get contact details |
| POST | `/contacts` | Create contact |
| PUT | `/contacts/{id}` | Update contact |
| DELETE | `/contacts/{id}` | Delete contact |

---

# Lead APIs

These APIs manage customer leads.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/leads` | Get all leads |
| GET | `/leads/{id}` | Get lead details |
| POST | `/leads` | Create lead |
| PUT | `/leads/{id}` | Update lead |
| DELETE | `/leads/{id}` | Delete lead |

---

# Deal APIs

These APIs manage the sales pipeline.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/deals` | Get all deals |
| GET | `/deals/{id}` | Get deal details |
| POST | `/deals` | Create deal |
| PUT | `/deals/{id}` | Update deal |
| DELETE | `/deals/{id}` | Delete deal |

---

# Task APIs

These APIs manage user tasks.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/{id}` | Get task details |
| POST | `/tasks` | Create task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |

---

# Follow-up APIs

These APIs manage follow-up activities.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/follow-ups` | Get all follow-ups |
| GET | `/follow-ups/{id}` | Get follow-up details |
| POST | `/follow-ups` | Schedule follow-up |
| PUT | `/follow-ups/{id}` | Update follow-up |
| DELETE | `/follow-ups/{id}` | Delete follow-up |

---

# Activity APIs

These APIs record and retrieve activity logs.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/activities` | Get activity logs |
| GET | `/activities/{id}` | Get activity details |

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

- JWT Authentication
- Refresh Token Support
- Role-Based Authorization
- Protected Endpoints

---

# API Documentation

FastAPI automatically generates interactive API documentation using Swagger/OpenAPI.

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
| 500 | Internal Server Error |

---

# Future Enhancements

The API can be extended to support:

- Email Notifications
- File Upload APIs
- Dashboard Analytics APIs
- AI Lead Scoring APIs
- Calendar Integration
- Third-party Integrations

---

# Conclusion

The CRM API is designed following RESTful principles and modern security practices. By using FastAPI, JWT authentication, SQLAlchemy, and Swagger/OpenAPI, the system provides a scalable and maintainable backend that supports efficient communication between the frontend and the database.