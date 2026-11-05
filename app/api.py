import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
STATUS_FILE = BASE_DIR / "data" / "lead_statuses.json"

VALID_STATUSES = ["Новая", "В работе", "Успешно", "Отклонена"]


class StatusUpdate(BaseModel):
    status: str


def read_statuses():
    if not STATUS_FILE.exists():
        return {}

    with open(STATUS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_statuses(statuses):
    with open(STATUS_FILE, "w", encoding="utf-8") as file:
        json.dump(statuses, file, ensure_ascii=False, indent=2)


@app.get("/")
def home():
    return {"message": "SocialPulse CRM API работает"}


@app.get("/api/leads")
def get_leads():
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


@app.get("/api/stats")
def get_stats():
    publications = get_leads()
    return {"total": len(publications)}


@app.get("/api/statuses")
def get_statuses():
    return read_statuses()


@app.put("/api/leads/{lead_id}/status")
def update_lead_status(lead_id: int, update: StatusUpdate):
    if update.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Недопустимый статус")

    publications = get_leads()

    if not any(str(item["id"]) == str(lead_id) for item in publications):
        raise HTTPException(status_code=404, detail="Публикация не найдена")

    statuses = read_statuses()
    statuses[str(lead_id)] = update.status
    save_statuses(statuses)

    return {
        "message": "Статус сохранён",
        "id": lead_id,
        "status": update.status,
    }