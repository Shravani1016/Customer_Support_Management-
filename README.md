# ClientFlow CRM — Customer Relationship Management System

**Team 2:** Priyal · Shravani · Yashi

A full-stack CRM for managing leads, contacts, companies, deals, tasks, and activities — with a Kanban-style deals pipeline, a real-time analytics dashboard, and full dark/light mode support.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the App](#running-the-app)
- [What to Test](#what-to-test)
- [API Documentation](#api-documentation)
- [Database & ER Diagram](#database--er-diagram)
- [Logging](#logging)
- [Screenshots](#screenshots)
- [Documentation Index](#documentation-index)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| ORM / Migrations | SQLAlchemy + Alembic |
| Auth | JWT (access token + refresh token) |
| Validation | Pydantic |
| API Docs | Swagger / OpenAPI |
| Logging | Python `logging` (console + `app.log` file) |

---

## Features

- **Auth** — Login/Logout with JWT (30-min access token, 7-day auto-refreshing refresh token), Role-Based Access (Admin, Manager, Sales Rep)
- **Dashboard** — Live stats cards, Performance Overview chart (weekly pipeline trend), dark/light mode
- **Leads** — Create, search, filter by status/source, soft delete, convert qualified leads into Contact + Company + Deal
- **Contacts** — Create, search, soft delete, linked to companies
- **Companies** — Create, search, filter by industry, soft delete
- **Deals Pipeline** — Kanban board with drag-and-drop stage updates, pipeline value tracking
- **Tasks** — Priority levels, completion tracking, linked to leads/contacts/deals
- **Activities** — Calls, emails, notes, meetings logged against any record
- **Reports & Analytics** — Leads by status (pie), deals by stage (bar), revenue trend
- **UI Polish** — Toast notifications, loading skeletons/spinners, phone number validation (10 digits), consistent dark mode across all pages
- **Structured Logging** — Request logs + auth event logs (login, register, failed attempts)
- **CSV Export** — Export leads, contacts, and companies to CSV for backup or reporting. (CSV import planned — not yet implemented.)

---

## Project Structure
```
Customer_Support_Management/
│
├── backend/                         # FastAPI server
│   ├── app/
│   │   ├── core/                    # Logging configuration
│   │   ├── models/                  # SQLAlchemy models
│   │   │   ├── models.py
│   │   │   └── mixins.py
│   │   ├── routers/                 # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── leads.py
│   │   │   ├── contacts.py
│   │   │   ├── companies.py
│   │   │   ├── deals.py
│   │   │   ├── tasks.py
│   │   │   ├── activities.py
│   │   │   └── reports.py
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── utils/                   # Authentication helpers
│   │   │   └── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── main.py
│   │
│   ├── alembic/                     # Database migrations
│   └── app.log                      # Runtime log file
│
├── docs/
│   └── ER_DIAGRAM.md                # Mermaid ER diagram
│
├── documentation/
│   ├── architecture.md
│   ├── api-overview.md
│   ├── authentication.md
│   ├── database-design.md
│   ├── modules.md
│   ├── tech-stack.md
│   ├── workflow.md
│   ├── screenshots.md
│   ├── er-diagram.png
│   └── screenshots/
│
├── frontend/                        # Next.js web application
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   ├── contacts/
│   │   │   ├── companies/
│   │   │   ├── deals/
│   │   │   ├── tasks/
│   │   │   ├── activities/
│   │   │   └── reports/
│   │   └── login/
│   │
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── DealCard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── AddDealModal.tsx
│   │
│   └── lib/
│       ├── api.ts
│       └── AuthContext.tsx
│
└── README.md
```

---

## Setup Instructions

### 1. Clone & Pull
```bash
git pull origin main
```

### 2. Backend Setup
```bash
cd backend
source venv/bin/activate        # Mac
.\venv\Scripts\Activate.ps1     # Windows

pip install -r requirements.txt
```

### 3. Create `.env` (inside `backend/`)

**Mac:**
DATABASE_URL=postgresql://YOUR_MAC_USERNAME@localhost:5432/crmdb
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

**Windows:**
DATABASE_URL=postgresql://postgres:Root@localhost:5432/crmdb
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

### 4. Database Setup

**Mac:**
```bash
psql -U YOUR_USERNAME -d postgres -c "CREATE DATABASE crmdb;"
```

**Windows (in psql):**
```sql
CREATE DATABASE crmdb;
```

**Run migrations:**
```bash
alembic upgrade head
```

**Create admin user:**
```bash
python -c "from app.database import SessionLocal; from app.models.models import User, RoleEnum; from app.utils.auth import hash_password; db=SessionLocal(); user=User(email='admin@crm.com', full_name='Admin User', hashed_password=hash_password('admin123'), role=RoleEnum.admin); db.add(user); db.commit(); print('User created!')"
```

---

## Running the App

### Backend
```bash
cd backend
uvicorn app.main:app --reload
```
- API: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

### Frontend
Open a **new terminal**:
```bash
cd frontend
npm install
npm run dev
```
- App: `http://localhost:3000`

> ⚠️ Run backend first, then frontend — keep both terminals open.

**Login Credentials:**
- Email: `admin@crm.com`
- Password: `admin123`

---

## What to Test

| Page | What to check |
|---|---|
| Dashboard | Stats cards + Performance chart load correctly |
| Leads | Add/Delete works, filters (status/source) work |
| Contacts | Add/Delete works |
| Companies | Add/Delete works, industry filter works |
| Deals | Kanban drag-and-drop updates stage, stage badges show |
| Tasks | Checkbox toggle + priority badges work |
| Activities | Loading state + list renders |
| Validation | 11+ digit phone shows error |
| Auth | Login persists across refresh; session survives past 30 min without logging out |
| Theme | Dark/Light toggle is consistent across all pages |

---

## API Documentation

Interactive docs: `http://localhost:8000/docs`

**Key endpoint groups:**
- `/api/auth` — register, login, refresh, logout, current user
- `/api/leads`, `/api/contacts`, `/api/companies` — CRUD + soft delete
- `/api/deals` — CRUD + Kanban stage updates
- `/api/tasks`, `/api/activities` — task and activity management
- `/api/reports` — analytics endpoints for the dashboard

---

## Database & ER Diagram

- **Interactive (Mermaid, renders directly on GitHub):** [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md)
- **Static image:** [`documentation/er-diagram.png`](documentation/er-diagram.png)
- **Design notes:** [`documentation/database-design.md`](documentation/database-design.md)

All tables use soft delete (`is_deleted`, `deleted_at`) and audit columns (`created_at`, `updated_at`, `created_by`, `updated_by`).

---

## Logging

Structured logging is enabled via `app/core/logging_config.py`:
- Every request is logged with method, path, status code, and duration
- Auth events are logged: successful registration, successful login, failed login attempts
- Logs go to **both** the console and `backend/app.log`

---

## Screenshots

Full walkthrough: [`documentation/screenshots.md`](documentation/screenshots.md)

| | |
|---|---|
| **Login** | ![Login](documentation/screenshots/login.png) |
| **Dashboard** | ![Dashboard](documentation/screenshots/dashboard.png) |
| **Dashboard (Dark Mode)** | ![Dashboard Dark](documentation/screenshots/dashboard-dark.png) |
| **Leads** | ![Leads](documentation/screenshots/leads.png) |
| **Deals (Kanban)** | ![Deals](documentation/screenshots/deals.png) |
| **Contacts** | ![Contacts](documentation/screenshots/contacts.png) |
| **Companies** | ![Companies](documentation/screenshots/companies.png) |
| **Tasks** | ![Tasks](documentation/screenshots/tasks.png) |
| **Activities** | ![Activities](documentation/screenshots/activities.png) |
| **Reports** | ![Reports](documentation/screenshots/reports.png) |
| **Swagger — Overview** | ![Swagger Overview](documentation/screenshots/swagger-overview.png) |
| **Swagger — Reports** | ![Swagger Reports](documentation/screenshots/swagger-reports.png) |
---

## Future Enhancements

The following features are planned for future releases of ClientFlow CRM:

- **Email Integration** – Integrate Gmail and Outlook APIs to send, receive, and track customer emails directly within the CRM.
- **Real-Time Notifications** – Notify users about task deadlines, deal updates, new assignments, and important activities.
- **Calendar Integration** – Synchronize meetings, reminders, and follow-ups with Google Calendar and Microsoft Outlook.
- **Advanced Reporting & Analytics** – Support custom dashboards, advanced filters, and PDF/Excel report generation.
- **File & Document Management** – Upload and organize contracts, proposals, invoices, and other documents for CRM records.
- **Granular Role-Based Permissions** – Extend role management with customizable permissions for different user groups.
- **Global Search** – Provide fast, unified search across leads, contacts, companies, deals, tasks, and activities.
- **Mobile Application** – Develop native or cross-platform mobile apps for Android and iOS.
- **Third-Party Integrations** – Connect with Slack, Microsoft Teams, Zapier, and other business productivity tools.
- **AI-Powered CRM Features** – Implement lead scoring, sales forecasting, intelligent follow-up suggestions, and chatbot assistance.

---

## Documentation Index

Deeper docs live in [`documentation/`](documentation/):
- [`architecture.md`](documentation/architecture.md) — system design overview
- [`api-overview.md`](documentation/api-overview.md) — endpoint summary
- [`authentication.md`](documentation/authentication.md) — JWT auth + refresh token flow
- [`database-design.md`](documentation/database-design.md) — schema design
- [`modules.md`](documentation/modules.md) — module-by-module breakdown
- [`tech-stack.md`](documentation/tech-stack.md) — tech stack rationale
- [`workflow.md`](documentation/workflow.md) — project workflow
- [`../docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) — interactive ER diagram
