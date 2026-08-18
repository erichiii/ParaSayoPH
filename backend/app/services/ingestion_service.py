from __future__ import annotations

from typing import Any

from app.database import supabase


def ingest_records(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Insert scraped records into raw_scraped_records.

    Each scraped program is stored as a separate row.
    The original object is preserved unchanged in raw_data.
    """

    # Avoid sending an empty insert to Supabase
    if not records:
        return {
            "records_received": 0,
            "records_inserted": 0,
            "inserted_ids": [],
        }

    rows: list[dict[str, Any]] = []

    for record in records:
        source_url = None

        source = record.get("source")

        if isinstance(source, dict):
            source_url = source.get("url")

        rows.append({
            "raw_data": record,
            "source_url": source_url,
        })

    response = (
        supabase
        .table("raw_scraped_records")
        .insert(rows)
        .execute()
    )

    inserted = response.data or []

    return {
        "records_received": len(records),
        "records_inserted": len(inserted),
        "inserted_ids": [
            row["id"]
            for row in inserted
            if "id" in row
        ],
    }