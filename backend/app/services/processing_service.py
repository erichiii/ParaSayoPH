from __future__ import annotations

from typing import Any

from pydantic import ValidationError

from app.database import supabase
from app.schemas.program import ProgramData
from app.services.normalization import normalize_program
from app.services.duplicate_service import find_duplicate_program
from app.services.field_validation import validate_program_fields


TABLE_STAGING = "staging_scraper"
TABLE_PROGRAMS = "programs"


def _classify(
    scraped_data: dict[str, Any],
) -> tuple[
    str,
    str | None,
    ProgramData | None,
    list[dict[str, str]],
]:
    """
    Normalize, structurally validate, and perform field-level
    validation on one scraped program.
    """

    # Normalize scraper output before structural validation.
    normalized_data = normalize_program(scraped_data)

    # Structural validation using the canonical ProgramData schema.
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
            [],
        )

    # Deterministic field-level validation.
    field_flags = validate_program_fields(program)

    # Only error-level flags block migration.
    blocking_flags = [
        flag
        for flag in field_flags
        if flag.get("severity") == "error"
    ]

    if blocking_flags:
        reasons = "; ".join(
            f"{flag['field']}: {flag['reason']}"
            for flag in blocking_flags
        )

        return (
            "needs_review",
            reasons,
            program,
            field_flags,
        )

    # Warning-level flags are preserved but do not block migration.
    return (
        "processed",
        None,
        program,
        field_flags,
    )


def _build_scraped_data(
    staging_record: dict[str, Any],
) -> dict[str, Any]:
    """
    Extract only canonical program fields from a staging row.

    Staging metadata such as id, source_url, migration_status,
    first_seen_at, and last_scraped_at is intentionally excluded.
    """

    return {
        "title": staging_record.get("title"),
        "provider": staging_record.get("provider"),
        "category": staging_record.get("category"),
        "description": staging_record.get("description"),
        "coverage": staging_record.get("coverage"),
        "eligibility": staging_record.get("eligibility"),
        "benefits": staging_record.get("benefits"),
        "requirements": staging_record.get("requirements"),
        "application": staging_record.get("application"),
        "source": staging_record.get("source"),
        "status": staging_record.get("status"),
    }


def _update_staging_record(
    staging_id: int,
    *,
    migration_status: str,
    migration_error: str | None,
    field_flags: list[dict[str, str]],
) -> None:
    """
    Update the backend migration state of a staging record.
    """

    (
        supabase
        .table(TABLE_STAGING)
        .update({
            "migration_status": migration_status,
            "migration_error": migration_error,
            "field_flags": field_flags,
        })
        .eq("id", staging_id)
        .execute()
    )


def _find_program_by_staging_id(
    staging_id: int,
) -> dict[str, Any] | None:
    """
    Find the canonical program previously created from
    this exact staging scraper record.

    If found, the current scrape represents an update to
    that canonical program rather than a duplicate.
    """

    response = (
        supabase
        .table(TABLE_PROGRAMS)
        .select("*")
        .eq("staging_record_id", staging_id)
        .limit(1)
        .execute()
    )

    if response.data:
        return response.data[0]

    return None


def process_pending_records() -> dict[str, int]:
    """
    Process every staging scraper record currently marked
    as pending.

    Possible outcomes:
    - inserted
    - updated
    - duplicate
    - needs_review
    - failed
    """

    response = (
        supabase
        .table(TABLE_STAGING)
        .select("*")
        .eq("migration_status", "pending")
        .execute()
    )

    pending_records = response.data or []

    counts = {
        "records_checked": len(pending_records),
        "inserted": 0,
        "updated": 0,
        "duplicates": 0,
        "needs_review": 0,
        "failed": 0,
    }

    for staging_record in pending_records:
        staging_id = staging_record["id"]

        # ---------------------------------------------------------
        # 1. Build canonical program input
        # ---------------------------------------------------------

        scraped_data = _build_scraped_data(staging_record)

        (
            classification,
            error_detail,
            program,
            field_flags,
        ) = _classify(scraped_data)

        # ---------------------------------------------------------
        # 2. Structural validation failed
        # ---------------------------------------------------------

        if classification == "failed":
            _update_staging_record(
                staging_id,
                migration_status="failed",
                migration_error=error_detail,
                field_flags=field_flags,
            )

            counts["failed"] += 1
            continue

        # ---------------------------------------------------------
        # 3. Blocking field-level validation problems
        # ---------------------------------------------------------

        if classification == "needs_review":
            _update_staging_record(
                staging_id,
                migration_status="needs_review",
                migration_error=error_detail,
                field_flags=field_flags,
            )

            counts["needs_review"] += 1
            continue

        # Defensive check.
        if program is None:
            _update_staging_record(
                staging_id,
                migration_status="failed",
                migration_error=(
                    "Internal processing error: "
                    "validated program is missing"
                ),
                field_flags=field_flags,
            )

            counts["failed"] += 1
            continue

        program_data = program.model_dump()

        # ---------------------------------------------------------
        # 4. Check whether THIS staging record was migrated before
        # ---------------------------------------------------------

        existing_program = _find_program_by_staging_id(staging_id)

        if existing_program:
            # This is not a duplicate.
            # Bright Data re-scraped a program that we previously
            # migrated, so update the existing canonical row.
            try:
                (
                    supabase
                    .table(TABLE_PROGRAMS)
                    .update(program_data)
                    .eq("id", existing_program["id"])
                    .execute()
                )

            except Exception as exc:
                _update_staging_record(
                    staging_id,
                    migration_status="failed",
                    migration_error=(
                        f"Program update failed: "
                        f"{type(exc).__name__}"
                    ),
                    field_flags=field_flags,
                )

                counts["failed"] += 1
                continue

            _update_staging_record(
                staging_id,
                migration_status="migrated",
                migration_error=None,
                field_flags=field_flags,
            )

            counts["updated"] += 1
            continue

        # ---------------------------------------------------------
        # 5. Check for a true duplicate
        # ---------------------------------------------------------

        duplicate = find_duplicate_program(program_data)

        if duplicate:
            _update_staging_record(
                staging_id,
                migration_status="duplicate",
                migration_error=(
                    f"Duplicate of program {duplicate['id']}"
                ),
                field_flags=field_flags,
            )

            counts["duplicates"] += 1
            continue

        # ---------------------------------------------------------
        # 6. New program: insert into canonical programs table
        # ---------------------------------------------------------

        program_row = program.model_dump()

        # Preserve traceability back to staging_scraper.
        program_row["staging_record_id"] = staging_id

        try:
            (
                supabase
                .table(TABLE_PROGRAMS)
                .insert(program_row)
                .execute()
            )

        except Exception as exc:
            _update_staging_record(
                staging_id,
                migration_status="failed",
                migration_error=(
                    f"Program insert failed: "
                    f"{type(exc).__name__}"
                ),
                field_flags=field_flags,
            )

            counts["failed"] += 1
            continue

        # ---------------------------------------------------------
        # 7. Migration completed successfully
        # ---------------------------------------------------------

        _update_staging_record(
            staging_id,
            migration_status="migrated",
            migration_error=None,
            field_flags=field_flags,
        )

        counts["inserted"] += 1

    return counts