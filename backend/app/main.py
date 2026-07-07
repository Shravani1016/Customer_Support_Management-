from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

from app.core.logging_config import logger
from app.database import Base, engine
import app.models.models

from app.routers import (
    auth,
    leads,
    companies,
    contacts,
    deals,
    activities,
    reports,
    password_reset,
    users,
    task,
    files,
    super_admin,
)

from app.routers.audit_logs import router as audit_logs_router
from app.routers.profile import router as profile_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CRM API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(companies.router)
app.include_router(contacts.router)
app.include_router(deals.router)
app.include_router(activities.router)
app.include_router(reports.router)
app.include_router(task.router)
app.include_router(password_reset.router)
app.include_router(super_admin.router)
app.include_router(files.router)
app.include_router(users.router)
app.include_router(audit_logs_router)
app.include_router(profile_router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = round((time.time() - start_time) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration}ms")
    return response


@app.on_event("startup")
def on_startup():
    logger.info("CRM API starting up...")


@app.on_event("shutdown")
def on_shutdown():
    logger.info("CRM API shutting down...")


@app.get("/")
def root():
    return {"message": "CRM API is running"}