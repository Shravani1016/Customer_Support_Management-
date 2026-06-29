# CRM - Customer Relationship Management System

## Team 2: Priyal, Shravani, Yashi

## Tech Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Python FastAPI
- **Database:** PostgreSQL
- **Auth:** JWT
- **ORM:** SQLAlchemy + Alembic
- **Docs:** Swagger/OpenAPI

## Project Structure
Customer_Support_Management/

├── backend/          ← Python FastAPI server

├── frontend/         ← Next.js web app

└── documentation/    ← ER diagram, API docs

## Setup Instructions

### Step 1 — Clone & Pull
```bash
git pull origin main
```

### Step 2 — Backend Setup
```bash
cd backend
source venv/bin/activate        # Mac
.\venv\Scripts\Activate.ps1     # Windows

pip install email-validator python-multipart bcrypt==4.0.1
```

### Step 3 — Create .env File (inside backend folder)

**Mac:**

DATABASE_URL=postgresql://YOUR_MAC_USERNAME@localhost:5432/crmdb
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

**Windows:**

DATABASE_URL=postgresql://postgres:Root@localhost:5432/crmdb
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30


### Step 4 — Database Setup

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

### Step 5 — Start Backend
```bash
uvicorn app.main:app --reload
```

### Step 6 — Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Step 7 — Open App
http://localhost:3000
**Login Credentials:**
- Email: admin@crm.com
- Password: admin123

## Features
- Login / Logout with JWT
- Role-Based Access (Admin, Manager, Sales Rep)
- Dashboard with stats
- Leads management
- Contacts management
- Companies management
- Deals pipeline
- Tasks with completion tracking
- Phone number validation (10 digits)
- Swagger API docs at http://localhost:8000/docs

## What to Test
| Page | What to check |
|------|--------------|
| Dashboard | Stats cards load |
| Leads | Add/Delete works |
| Contacts | Add/Delete works |
| Companies | Add/Delete works |
| Deals | Stage badges show |
| Tasks | Checkbox toggle works |
| Validation | 11+ digit phone shows error |

## API Documentation
Available at: http://localhost:8000/docs
