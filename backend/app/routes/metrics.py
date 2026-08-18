from fastapi import APIRouter, HTTPException

from app.services.metrics_service import calculate_scrape_run_metrics


router = APIRouter(
    prefix="/api",
    tags=["metrics"],
)


@router.get("/scrape-runs/{scrape_run_id}/metrics")
def get_scrape_run_metrics(scrape_run_id: int):
    metrics = calculate_scrape_run_metrics(scrape_run_id)

    return {
        "scrape_run_id": scrape_run_id,
        **metrics,
    }