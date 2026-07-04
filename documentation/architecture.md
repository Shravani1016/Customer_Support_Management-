# System Architecture

## Overview

The Customer Relationship Management (CRM) system follows a modern three-tier architecture that separates the presentation layer, application layer, and data layer. This modular design improves scalability, maintainability, security, and code organization.

The application is built using **Next.js** for the frontend, **FastAPI** for the backend, and **PostgreSQL** as the database. Communication between the frontend and backend is handled through RESTful APIs secured with JWT-based authentication.

---

# Architecture Diagram

```text
                    ┌──────────────────────────┐
                    │        Client/User       │
                    │      (Web Browser)       │
                    └─────────────┬────────────┘
                                  │
                                  │ HTTP/HTTPS
                                  ▼
                    ┌──────────────────────────┐
                    │        Frontend          │
                    │   Next.js 16 + React     │
                    │      TypeScript          │
                    └─────────────┬────────────┘
                                  │
                           REST API Requests
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │        Backend           │
                    │         FastAPI          │
                    │ Business Logic & APIs    │
                    └─────────────┬────────────┘
                                  │
                            SQLAlchemy ORM
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │      PostgreSQL          │
                    │       Database           │
                    └──────────────────────────┘
```

---

# Architecture Layers

## 1. Presentation Layer (Frontend)

The presentation layer is responsible for providing an interactive and responsive user interface.

### Responsibilities

- Responsive Dashboard with live stats and performance charts
- Dark / Light Mode Theme Toggle
- API Integration
- Form Validation (including phone number length validation)
- Loading & Error States
- Toast Notifications
- Reusable Components
- Search & Filters
- Kanban Drag-and-Drop (Deals Pipeline)

### Technologies

* Next.js 16 (App Router)
* React
* TypeScript
* Tailwind CSS

---

## 2. Application Layer (Backend)

The backend contains the business logic and exposes RESTful APIs that process client requests.

### Responsibilities

* Authentication
* Authorization
* CRUD Operations
* Business Logic
* Request Validation
* Exception Handling
* Structured Logging
* API Documentation
* Analytics Aggregation (Reports)
* CSV Import/Export

### Backend Services

- RESTful APIs
- SQLAlchemy ORM
- Alembic Database Migrations
- Pydantic Data Validation
- Exception Handling
- Structured Logging (console + `app.log`)
- Environment Variable Management

### Technologies

* FastAPI
* SQLAlchemy
* Alembic
* Pydantic

---

## 3. Data Layer (Database)

The data layer stores all application data securely and efficiently.

### Database Design Principles

- Proper Relationships
- Foreign Keys
- Audit Columns
- Soft Delete
- Created At / Updated At
- Database Indexing

### Responsibilities

* Store Companies
* Store Contacts
* Store Leads
* Store Deals
* Store Tasks
* Store Activities
* Maintain Relationships
* Data Integrity

### Technology

* PostgreSQL

---

# Authentication Flow

The application uses JWT (JSON Web Token) authentication.

Authentication process:

1. User enters login credentials.
2. Backend validates the credentials.
3. JWT Access Token and Refresh Token are generated.
4. Access Token is sent with every protected API request.
5. Backend validates the token before processing the request.
6. If the Access Token expires, a Refresh Token is used to generate a new Access Token.

---

# Request Flow

A typical request follows these steps:

1. User performs an action in the frontend.
2. Frontend sends an HTTP request to the FastAPI backend.
3. Backend validates authentication and input data.
4. Business logic is executed.
5. SQLAlchemy interacts with PostgreSQL.
6. Database returns the requested data.
7. Backend sends a JSON response.
8. Frontend updates the user interface.

---

# CRM Modules

The CRM system is organized into the following functional modules:

**Implemented:**
- Authentication
- Dashboard
- Companies
- Contacts
- Leads
- Deals Pipeline (Kanban)
- Tasks
- Activity Management (calls, emails, notes, meetings)
- Reports & Analytics
- CSV Import/Export

**Planned:**
- Follow-up Management

---

# Security Architecture

The CRM system incorporates several security mechanisms:

- JWT Access Token Authentication
- Refresh Token Authentication
- Role-Based Authorization
- Protected Routes
- Password Hashing
- Input Validation using Pydantic
- Exception Handling
- Environment Variables

---

# API Documentation

The backend automatically generates interactive API documentation using Swagger/OpenAPI. Developers can test API endpoints directly through the Swagger UI during development.

Benefits include:

- Interactive API testing
- Request and response validation
- Automatic API documentation
- Faster backend development

---

# Scalability

The architecture is designed to support future enhancements, including:

* Follow-up Management
* AI-powered automation
* Email notifications
* Advanced/custom reporting
* Third-party integrations
* Microservices migration (if required)

---

# Architecture Principles

The CRM system is designed following these software engineering principles:

- Separation of Concerns
- Modular Design
- Reusability
- Scalability
- Maintainability
- Security by Design
- RESTful Architecture

---

# Benefits of the Architecture

* Clean separation of concerns
* Easy maintenance
* Scalable design
* Secure authentication
* Modular codebase
* Reusable components
* Faster development
* Better testing and debugging