from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import json
import uvicorn

app = FastAPI(title="Smart Parking API")

# JSON файл для хранения состояния (можно заменить БД)
DATA_FILE = "parking_state.json"


# ---------- Модель входных данных ----------
class ParkingSpot(BaseModel):
    id: int
    status: str  # "free" или "busy"


class ParkingUpdate(BaseModel):
    spots: List[ParkingSpot]


# ---------- ХЕЛПЕРЫ ----------
def load_state():
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except:
        return []


def save_state(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)


# ---------- API РОУТЫ ----------
@app.post("/update")
def update_parking(data: ParkingUpdate):
    save_state([s.dict() for s in data.spots])
    return {"message": "Parking status updated", "count": len(data.spots)}


@app.get("/status")
def get_status():
    return load_state()


@app.get("/free")
def get_free():
    data = load_state()
    free_count = len([p for p in data if p["status"] == "free"])
    return {"free": free_count, "total": len(data)}


# Запуск сервера
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8080, reload=True)
