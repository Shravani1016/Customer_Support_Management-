# Customer Relationship Management (CRM)

## Project Overview

Customer Support Management (CRM) is a modern web-based application designed to streamline customer relationship and support processes. The system enables organizations to efficiently manage companies, contacts, leads, sales opportunities, customer interactions, follow-ups, and support activities through a centralized dashboard.

The application provides secure authentication, role-based access control, real-time data management, and detailed analytics to improve customer engagement and business productivity.

---

# Objectives

The primary objectives of this project are:

* Centralize customer and company information.
* Manage sales leads and deal pipelines.
* Track customer interactions and follow-up activities.
* Improve task management among team members.
* Provide real-time dashboard analytics.
* Secure user authentication using JWT.
* Build a scalable CRM architecture using modern technologies.

---

# Key Features

## Authentication

* Secure Login
* Logout
* Forgot Password
* Reset Password
* Change Password
* JWT Access Token
* Refresh Token
* Protected Routes
* Role-Based Authorization

---

## Dashboard

The dashboard provides a quick overview of business activities, including:

* Total Companies
* Total Contacts
* Active Leads
* Deals Pipeline
* Pending Tasks
* Upcoming Follow-ups
* Recent Activities
* Dashboard Analytics

---

## CRM Modules

* Company Management
* Contact Management
* Lead Management
* Deal Pipeline Management
* Task Management
* Follow-up Tracking
* Activity Management
* Notes Management

---

# Technology Stack

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Bootstrap / Tailwind CSS

## Backend

* Python FastAPI
* SQLAlchemy ORM
* Alembic Migrations
* Pydantic Validation

## Database

* PostgreSQL

## Authentication

* JWT Access Token
* Refresh Token

## Documentation

* Swagger / OpenAPI

## Version Control

* Git
* GitHub

---

# Project Structure

```text
Customer_Support_Management/
│
├── backend/
├── frontend/
├── documentation/
│   ├── architecture.md
│   ├── modules.md
│   ├── tech-stack.md
│   ├── workflow.md
│   ├── api-overview.md
│   ├── database-design.md
│   ├── authentication.md
│   └── screenshots.md
│
├── README.md
└── .gitignore
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Shravani1016/Customer_Support_Management-.git
cd Customer_Support_Management-
```

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate      # macOS/Linux

pip install -r requirements.txt

uvicorn app.main:app --reload
```

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# Development Guidelines

* Follow Git branching strategy.
* Write meaningful commit messages.
* Keep documentation updated.
* Follow REST API conventions.
* Use proper exception handling.
* Maintain clean and reusable code.

---

# Future Enhancements

* Email Notifications
* AI-based Lead Scoring
* Calendar Integration
* File Attachments
* Customer Support Tickets
* Email Automation
* Reports & Export
* Multi-Tenant Support

---

# Repository

Repository:
https://github.com/Shravani1016/Customer_Support_Management-

This project is collaboratively developed using Git and GitHub. Team members work on separate branches and merge changes through Pull Requests.

# Team Members

* Priyal
* Shravani
* Yashi

---

# License

This project is developed as part of an internship and learning initiative. It demonstrates the implementation of a modern Customer Relationship Management (CRM) system using Next.js, FastAPI, and PostgreSQL.