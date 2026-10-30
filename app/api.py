import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SocialPulse CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "publications.json"


@app.get("/")
def home():
    return {"message": "SocialPulse CRM API работает"}

@app.get("/api/leads")
def get_leads():
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        publications = json.load(file)

    return publications

@app.get("/api/stats")
def get_stats():
    if not DATA_FILE.exists():
        return {"total": 0}

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        publications = json.load(file)

    return {"total": len(publications)}