from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.ingestion_service import ingest_records


router = APIRouter(
    prefix="/api",
    tags=["ingestion"],
)


class IngestResponse(BaseModel):
    records_received: int
    records_inserted: int
    inserted_ids: list[int]
    scrape_run_id: int | None = None

@router.post(
    "/ingest",
    response_model=IngestResponse,
    status_code=status.HTTP_201_CREATED,
)
def ingest(
    request_body: list[dict[str, Any]],
) -> IngestResponse:
    try:
        result = ingest_records(request_body)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {type(e).__name__}",
        ) from e

    return IngestResponse(**result)