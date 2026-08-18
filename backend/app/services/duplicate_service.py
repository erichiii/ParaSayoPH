from __future__ import annotations

from typing import Any

from app.database import supabase


TABLE_PROGRAMS = "programs"


def _normalize_text(value: Any) -> str | None:
    if not isinstance(value, str):
        return None

    value = " ".join(value.lower().split())

    return value or None


def find_duplicate_program(
    program_data: dict[str, Any],
) -> dict[str, Any] | None:
    """Find an existing canonical program matching this record."""

    source = program_data.get("source") or {}
    source_url = source.get("url")

    # Strongest check: exact source URL.
    if source_url:
        response = (
            supabase
            .table(TABLE_PROGRAMS)
            .select("id,title,provider,source")
            .contains("source", {"url": source_url})
            .limit(1)
            .execute()
        )

        if response.data:
            return response.data[0]

    # Secondary check: normalized title + provider.
    incoming_title = _normalize_text(program_data.get("title"))
    incoming_provider = _normalize_text(program_data.get("provider"))

    if not incoming_title or not incoming_provider:
        return None

    response = (
        supabase
        .table(TABLE_PROGRAMS)
        .select("id,title,provider,source")
        .execute()
    )

    for existing in response.data or []:
        existing_title = _normalize_text(existing.get("title"))
        existing_provider = _normalize_text(existing.get("provider"))

        if (
            incoming_title == existing_title
            and incoming_provider == existing_provider
        ):
            return existing

    return None