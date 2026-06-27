from fastapi import FastAPI
from app.database import Base, engine
from app.models import models

app = FastAPI(title="CRM API", version="1.0.0")

@app.get("/")
def root():
    return {"message": "CRM API is running"}