from __future__ import annotations

from typing import Any

from app.database import supabase


TABLE_RAW = "raw_scraped_records"
TABLE_SCRAPE_RUNS = "scrape_runs"


def calculate_scrape_run_metrics(
    scrape_run_id: int,
) -> dict[str, Any]:
    """Calculate and store data-quality metrics for one scrape run."""

    response = (
        supabase
        .table(TABLE_RAW)
        .select("processing_status")
        .eq("scrape_run_id", scrape_run_id)
        .execute()
    )

    records = response.data or []

    processed_count = 0
    duplicate_count = 0
    needs_review_count = 0
    failed_count = 0

    for record in records:
        status = record.get("processing_status")

        if status == "processed":
            processed_count += 1

        elif status == "duplicate":
            duplicate_count += 1

        elif status == "needs_review":
            needs_review_count += 1

        elif status == "failed":
            failed_count += 1

    metrics = {
        "processed_count": processed_count,
        "duplicate_count": duplicate_count,
        "needs_review_count": needs_review_count,
        "failed_count": failed_count,
    }

    # Store the counts in scrape_runs.
    (
        supabase
        .table(TABLE_SCRAPE_RUNS)
        .update(metrics)
        .eq("id", scrape_run_id)
        .execute()
    )

    # Calculate rates for the response.
    total = len(records)

    acceptance_rate = (
        processed_count / total
        if total > 0
        else 0
    )

    duplicate_rate = (
        duplicate_count / total
        if total > 0
        else 0
    )

    review_rate = (
        needs_review_count / total
        if total > 0
        else 0
    )

    failure_rate = (
        failed_count / total
        if total > 0
        else 0
    )

    return {
        **metrics,
        "records_received": total,
        "acceptance_rate": round(
            acceptance_rate * 100,
            2,
        ),
        "duplicate_rate": round(
            duplicate_rate * 100,
            2,
        ),
        "review_rate": round(
            review_rate * 100,
            2,
        ),
        "failure_rate": round(
            failure_rate * 100,
            2,
        ),
    }