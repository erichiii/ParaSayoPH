import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ingestion import router as ingestion_router
from app.routes.processing import router as processing_router
from app.routes.programs import router as programs_router
from app.routes.metrics import router as metrics_router
from app.routes.matching import router as matching_router


def _get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    if not raw.strip():
        return ["http://localhost:5173", "http://127.0.0.1:5173"]
    origins = [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]
    origins = [origin for origin in origins if origin != "*"]
    return origins if origins else ["http://localhost:5173", "http://127.0.0.1:5173"]


app = FastAPI(
    title="ParaSayoPH API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(ingestion_router)
app.include_router(processing_router)
app.include_router(programs_router)
app.include_router(metrics_router)
app.include_router(matching_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
    }