from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import models
from app.routers import auth, leads, companies, contacts, deals, activities, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

@app.get("/")
def root():
    return {"message": "CRM API is running"}