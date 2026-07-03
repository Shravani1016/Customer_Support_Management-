from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
from app.core.logging_config import logger

from app.routers import task
from app.database import Base, engine
from app.models import models
from app.routers import (
    auth,
    leads,
    companies,
    contacts,
    deals,
    activities,
    reports,
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="CRM API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(companies.router)
app.include_router(contacts.router)
app.include_router(deals.router)
app.include_router(activities.router)
app.include_router(reports.router)
app.include_router(task.router)

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

# Root endpoint
@app.get("/")
def root():
    return {"message": "CRM API is running"}