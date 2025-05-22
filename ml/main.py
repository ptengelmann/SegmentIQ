from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from services.clustering import generate_segments

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict-segments")
async def predict_segments(req: Request):
    payload = await req.json()
    data = payload.get("data", [])

    if not data or not isinstance(data, list):
        return {"error": "Invalid or empty data"}

    result = generate_segments(data)
    return result
