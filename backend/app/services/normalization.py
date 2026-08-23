from __future__ import annotations

from typing import Any


# Different scraper field names that represent
# the same canonical ParaSayo field.
FIELD_ALIASES = {
    "title": ["title", "program_name", "name"],
    "provider": ["provider", "agency", "organization"],
    "category": ["category", "type", "program_type"],
    "description": ["description", "details"],
    "coverage": ["coverage"],
    "eligibility": ["eligibility"],
    "benefits": ["benefits", "benefit"],
    "requirements": ["requirements"],
    "status": ["status"],
}


# Possible scraper fields containing the source URL.
SOURCE_URL_ALIASES = [
    "source_url",
    "url",
    "link",
]


# Possible scraper fields containing the application deadline.
DEADLINE_ALIASES = [
    "deadline",
    "application_deadline",
]


def _clean_string(value: Any) -> Any:
    """Trim strings and convert blank strings to None."""

    if not isinstance(value, str):
        return value

    value = value.strip()

    if value == "":
        return None

    return value


def _get_first_value(
    data: dict[str, Any],
    aliases: list[str],
) -> Any:
    """Return the first matching field value from the scraper data."""

    for alias in aliases:
        if alias in data:
            return data[alias]

    return None


def _normalize_category(value: Any) -> str | None:
    """Convert category values to lowercase snake_case."""

    value = _clean_string(value)

    if value is None:
        return None

    if not isinstance(value, str):
        return value

    return value.lower().replace(" ", "_")


def _normalize_status(value: Any) -> str:
    """Normalize status while defaulting missing values to unknown."""

    value = _clean_string(value)

    if value is None:
        return "unknown"

    if not isinstance(value, str):
        return value

    return value.lower()


def _normalize_list(value: Any) -> list:
    """Normalize fields that should contain lists."""

    if value is None:
        return []

    if isinstance(value, list):
        return [
            item.strip() if isinstance(item, str) else item
            for item in value
            if not isinstance(item, str) or item.strip()
        ]

    if isinstance(value, str):
        value = value.strip()

        if value:
            return [value]

    return []


def normalize_program(data: dict[str, Any]) -> dict[str, Any]:
    """
    Convert raw scraper output into the canonical ParaSayo structure.

    This function normalizes data only.
    Validation is handled separately by ProgramData.
    """

    normalized: dict[str, Any] = {}

    # Normalize basic canonical fields.
    for canonical_field, aliases in FIELD_ALIASES.items():
        value = _get_first_value(data, aliases)

        if canonical_field == "category":
            value = _normalize_category(value)

        elif canonical_field == "status":
            value = _normalize_status(value)

        elif canonical_field in {"benefits", "requirements"}:
            value = _normalize_list(value)

        elif canonical_field in {"coverage", "eligibility"}:
            value = value if isinstance(value, dict) else {}

        else:
            value = _clean_string(value)

        normalized[canonical_field] = value

    # Normalize source information.
    original_source = data.get("source")

    if isinstance(original_source, dict):
        source = original_source.copy()
    else:
        source = {}

    # Preserve source.url if already provided.
    # Otherwise look for common top-level aliases.
    if not source.get("url"):
        source_url = _get_first_value(
            data,
            SOURCE_URL_ALIASES,
        )
        source["url"] = _clean_string(source_url)

    normalized["source"] = source

    # Normalize application information.
    original_application = data.get("application")

    if isinstance(original_application, dict):
        application = original_application.copy()
    else:
        application = {}

    # Preserve application.deadline if already provided.
    # Otherwise look for common top-level aliases.
    if not application.get("deadline"):
        deadline = _get_first_value(
            data,
            DEADLINE_ALIASES,
        )
        application["deadline"] = _clean_string(deadline)

    normalized["application"] = application

    return normalized