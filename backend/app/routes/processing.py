from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.processing_service import process_pending_records


router = APIRouter(
    prefix="/api",
    tags=["processing"],
)


class ProcessResponse(BaseModel):
    records_checked: int
    processed: int
    duplicates: int
    needs_review: int
    failed: int


@router.post(
    "/process",
    response_model=ProcessResponse,
    status_code=status.HTTP_200_OK,
)
def process() -> ProcessResponse:
    try:
        result = process_pending_records()

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {type(exc).__name__}",
        ) from exc

    return ProcessResponse(**result)