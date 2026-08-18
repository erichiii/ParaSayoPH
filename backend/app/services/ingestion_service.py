from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.database import supabase


TABLE_RAW = "raw_scraped_records"
TABLE_SCRAPE_RUNS = "scrape_runs"


def ingest_records(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Insert scraped records and track them as one scrape run.

    Each call to the ingestion endpoint represents one scrape run.
    Each scraped program is stored as a separate raw record.
    The original object is preserved unchanged in raw_data.
    """

    # Avoid creating a scrape run for an empty request.
    if not records:
        return {
            "records_received": 0,
            "records_inserted": 0,
            "inserted_ids": [],
            "scrape_run_id": None,
        }

    # Create the scrape run first.
    run_response = (
        supabase
        .table(TABLE_SCRAPE_RUNS)
        .insert({
            "status": "running",
            "records_received": len(records),
        })
        .execute()
    )

    run_data = run_response.data or []

    if not run_data:
        raise RuntimeError("Failed to create scrape run")

    scrape_run_id = run_data[0]["id"]

    rows: list[dict[str, Any]] = []

    for record in records:
        source_url = None

        source = record.get("source")

        if isinstance(source, dict):
            source_url = source.get("url")

        rows.append({
            "raw_data": record,
            "source_url": source_url,
            "scrape_run_id": scrape_run_id,
        })

    try:
        response = (
            supabase
            .table(TABLE_RAW)
            .insert(rows)
            .execute()
        )

    except Exception:
        # The run existed, but ingestion failed.
        (
            supabase
            .table(TABLE_SCRAPE_RUNS)
            .update({
                "status": "failed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
            })
            .eq("id", scrape_run_id)
            .execute()
        )

        raise

    inserted = response.data or []

    # Ingestion succeeded, so complete the scrape run.
    (
        supabase
        .table(TABLE_SCRAPE_RUNS)
        .update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
        .eq("id", scrape_run_id)
        .execute()
    )

    return {
        "records_received": len(records),
        "records_inserted": len(inserted),
        "inserted_ids": [
            row["id"]
            for row in inserted
            if "id" in row
        ],
        "scrape_run_id": scrape_run_id,
    }