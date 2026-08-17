from fastapi import FastAPI

from app.routes.ingestion import router as ingestion_router
from app.routes.processing import router as processing_router

app = FastAPI(title="ParaSayoPH API")

app.include_router(ingestion_router)
app.include_router(processing_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
