import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from app.database import supabase
from app.schemas.public_program import PublicProgram

router = APIRouter(
    prefix="/programs",
    tags=["programs"],
)

logger = logging.getLogger(__name__)

PUBLIC_PROGRAM_COLUMNS = (
    "id,title,provider,category,description,coverage,eligibility,"
    "benefits,requirements,application,source,status"
)


def normalize_public_program_row(row: dict[str, Any]) -> dict[str, Any]:
    """Fill only canonical nullable keys omitted by older stored JSON."""
    normalized = dict(row)

    program_id = normalized.get("id")
    if isinstance(program_id, int) and not isinstance(program_id, bool):
        normalized["id"] = str(program_id)

    eligibility = normalized.get("eligibility")
    if isinstance(eligibility, dict):
        normalized_eligibility = dict(eligibility)
        normalized["eligibility"] = normalized_eligibility

        if "age" not in normalized_eligibility:
            normalized_eligibility["age"] = {
                "min": None,
                "max": None,
                "raw_text": None,
            }

        for group, fields in {
            "education": ("raw_text",),
            "employment": ("raw_text",),
            "income": ("min", "max", "period", "scope", "raw_text"),
            "residency": ("raw_text",),
        }.items():
            value = normalized_eligibility.get(group)
            if isinstance(value, dict):
                normalized_group = dict(value)
                normalized_eligibility[group] = normalized_group
                for field in fields:
                    normalized_group.setdefault(field, None)

    application = normalized.get("application")
    if isinstance(application, dict):
        normalized_application = dict(application)
        normalized["application"] = normalized_application
        for field in ("start_date", "deadline", "process", "url"):
            normalized_application.setdefault(field, None)

    return normalized


def _public_programs(rows: list[object]) -> list[PublicProgram]:
    programs: list[PublicProgram] = []
    excluded = 0

    for row in rows:
        if not isinstance(row, dict):
            excluded += 1
            continue

        try:
            programs.append(PublicProgram.model_validate(normalize_public_program_row(row)))
        except ValidationError:
            excluded += 1

    if excluded:
        logger.warning("Excluded %d invalid stored program row(s) from the public response.", excluded)

    return sorted(
        programs,
        key=lambda program: (program.source.last_verified_at, program.id),
        reverse=True,
    )


@router.get("", response_model=list[PublicProgram])
def get_programs() -> list[PublicProgram]:
    try:
        response = supabase.table("programs").select(PUBLIC_PROGRAM_COLUMNS).execute()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Programs are unavailable.") from exc

    return _public_programs(response.data or [])


@router.get("/{program_id}", response_model=PublicProgram)
def get_program(program_id: int) -> PublicProgram:
    try:
        response = (
            supabase.table("programs")
            .select(PUBLIC_PROGRAM_COLUMNS)
            .eq("id", program_id)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Programs are unavailable.") from exc

    programs = _public_programs(response.data or [])
    if not programs:
        raise HTTPException(status_code=404, detail="Program not found.")

    return programs[0]
