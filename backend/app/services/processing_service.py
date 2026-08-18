from __future__ import annotations

from typing import Any

from pydantic import ValidationError

from urllib.parse import urlparse

from app.database import supabase
from app.schemas.program import ProgramData, VALID_STATUSES
from app.services.normalization import normalize_program
from app.services.duplicate_service import find_duplicate_program


TABLE_RAW = "raw_scraped_records"
TABLE_PROGRAMS = "programs"

def _is_valid_url(value: Any) -> bool:
    if not isinstance(value, str):
        return False

    parsed = urlparse(value)

    return (
        parsed.scheme in {"http", "https"}
        and bool(parsed.netloc)
    )

def _classify(
    raw_data: dict[str, Any],
) -> tuple[str, str | None, ProgramData | None]:
    """Validate and classify one raw scraped record."""

    normalized_data = normalize_program(raw_data)

    try:
        program = ProgramData.model_validate(normalized_data)

    except ValidationError as exc:
        reasons = "; ".join(
            f"{'.'.join(map(str, error['loc']))}: {error['msg']}"
            for error in exc.errors()
        )

        return (
            "failed",
            f"Structural validation failed: {reasons}",
            None,
        )

    # Quality checks
    review_reasons: list[str] = []

    if not program.provider or not program.provider.strip():
        review_reasons.append(
            "provider is missing or blank"
        )

    source_url = program.source.get("url")

    if not source_url or not str(source_url).strip():
        review_reasons.append(
            "source.url is missing or blank"
        )

    elif not _is_valid_url(source_url):
        review_reasons.append(
            "source.url is not a valid HTTP/HTTPS URL"
        )

    if not program.description or not program.description.strip():
        review_reasons.append(
            "description is missing or blank"
        )

    if program.status not in VALID_STATUSES:
        review_reasons.append(
            f"status '{program.status}' is invalid"
        )

    if review_reasons:
        return (
            "needs_review",
            "; ".join(review_reasons),
            program,
        )

    return "processed", None, program


def process_pending_records() -> dict[str, int]:
    """Process all raw records currently marked as pending."""

    response = (
        supabase
        .table(TABLE_RAW)
        .select("*")
        .eq("processing_status", "pending")
        .execute()
    )

    pending_records = response.data or []

    counts = {
        "records_checked": len(pending_records),
        "processed": 0,
        "duplicates": 0,
        "needs_review": 0,
        "failed": 0,
    }

    for raw_record in pending_records:
        raw_id = raw_record["id"]
        raw_data = raw_record.get("raw_data")

        # Protect against malformed/non-object raw_data
        if not isinstance(raw_data, dict):
            supabase.table(TABLE_RAW).update({
                "processing_status": "failed",
                "processing_error": (
                    "Structural validation failed: "
                    "raw_data must be a JSON object"
                ),
            }).eq("id", raw_id).execute()

            counts["failed"] += 1
            continue

        classification, error_detail, program = _classify(raw_data)

        # Structurally invalid
        if classification == "failed":
            supabase.table(TABLE_RAW).update({
                "processing_status": "failed",
                "processing_error": error_detail,
            }).eq("id", raw_id).execute()

            counts["failed"] += 1
            continue

        # Valid structure but suspicious/incomplete
        if classification == "needs_review":
            supabase.table(TABLE_RAW).update({
                "processing_status": "needs_review",
                "processing_error": error_detail,
            }).eq("id", raw_id).execute()

            counts["needs_review"] += 1
            continue

        # This should always exist for a processed record.
        if program is None:
            supabase.table(TABLE_RAW).update({
                "processing_status": "failed",
                "processing_error": (
                    "Internal processing error: "
                    "validated program is missing"
                ),
            }).eq("id", raw_id).execute()

            counts["failed"] += 1
            continue

        program_data = program.model_dump()

        duplicate = find_duplicate_program(program_data)

        if duplicate:
            supabase.table(TABLE_RAW).update({
                "processing_status": "duplicate",
                "processing_error": (
                    f"Duplicate of program {duplicate['id']}"
                ),
                "duplicate_of_program_id": duplicate["id"],
            }).eq("id", raw_id).execute()

            counts["duplicates"] += 1
            continue

        # Build the clean programs row from validated Pydantic data.
        program_row = program.model_dump()
        program_row["raw_record_id"] = raw_id

        # Insert into programs.
        try:
            supabase.table(TABLE_PROGRAMS).insert(
                program_row
            ).execute()

        except Exception as exc:
            # Database insertion failed, so DO NOT mark as processed.
            supabase.table(TABLE_RAW).update({
                "processing_status": "failed",
                "processing_error": (
                    f"Program insert failed: {type(exc).__name__}"
                ),
            }).eq("id", raw_id).execute()

            counts["failed"] += 1
            continue

        # Only mark processed after successful program insertion.
        supabase.table(TABLE_RAW).update({
            "processing_status": "processed",
            "processing_error": None,
        }).eq("id", raw_id).execute()

        counts["processed"] += 1

    return counts
