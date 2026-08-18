from fastapi import FastAPI

from app.routes.ingestion import router as ingestion_router
from app.routes.processing import router as processing_router
from app.routes.programs import router as programs_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.metrics import router as metrics_router

app = FastAPI(title="ParaSayoPH API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingestion_router)
app.include_router(processing_router)
app.include_router(programs_router)
app.include_router(metrics_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
