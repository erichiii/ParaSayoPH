from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlparse

from app.schemas.program import ProgramData, VALID_STATUSES


VALID_FLAG_CODES = {
    "MISSING",
    "INVALID",
    "SUSPICIOUS",
    "CONFLICT",
    "UNCERTAIN",
}

VALID_SEVERITIES = {
    "warning",
    "error",
}

VALID_INCOME_PERIODS = {
    "annual",
    "monthly",
    "weekly",
    "daily",
}

VALID_COVERAGE_TYPES = {
    "nationwide",
    "regional",
    "provincial",
    "city",
    "municipal",
    "unknown",
}


def _make_flag(
    field: str,
    code: str,
    reason: str,
    severity: str = "warning",
) -> dict[str, str]:
    """Create one standardized field-level validation flag."""

    if code not in VALID_FLAG_CODES:
        raise ValueError(f"Unsupported flag code: {code}")

    if severity not in VALID_SEVERITIES:
        raise ValueError(f"Unsupported severity: {severity}")

    return {
        "field": field,
        "code": code,
        "severity": severity,
        "reason": reason,
    }


def _is_valid_url(value: Any) -> bool:
    """Return True when value is a valid HTTP/HTTPS URL."""

    if not isinstance(value, str):
        return False

    parsed = urlparse(value)

    return (
        parsed.scheme in {"http", "https"}
        and bool(parsed.netloc)
    )


def _validate_provider(
    program: ProgramData,
) -> list[dict[str, str]]:
    """Validate provider information."""

    flags: list[dict[str, str]] = []

    if not program.provider or not program.provider.strip():
        flags.append(
            _make_flag(
                field="provider",
                code="MISSING",
                reason="Program provider is missing or blank.",
            )
        )

    return flags


def _validate_description(
    program: ProgramData,
) -> list[dict[str, str]]:
    """Validate program description."""

    flags: list[dict[str, str]] = []

    if not program.description or not program.description.strip():
        flags.append(
            _make_flag(
                field="description",
                code="MISSING",
                reason="Program description is missing or blank.",
            )
        )

    elif len(program.description.strip()) < 30:
        flags.append(
            _make_flag(
                field="description",
                code="SUSPICIOUS",
                reason="Program description is unusually short.",
            )
        )

    return flags


def _validate_source(
    program: ProgramData,
) -> list[dict[str, str]]:
    """Validate source information."""

    flags: list[dict[str, str]] = []

    source = program.source

    if not isinstance(source, dict):
        flags.append(
            _make_flag(
                field="source",
                code="INVALID",
                reason="Source must be an object.",
                severity="error",
            )
        )
        return flags

    source_url = source.get("url")

    if not source_url or not str(source_url).strip():
        flags.append(
            _make_flag(
                field="source.url",
                code="MISSING",
                reason="Source URL is missing or blank.",
                severity="error",
            )
        )

    elif not _is_valid_url(source_url):
        flags.append(
            _make_flag(
                field="source.url",
                code="INVALID",
                reason="Source URL is not a valid HTTP/HTTPS URL.",
                severity="error",
            )
        )

    return flags


def _validate_application(
    program: ProgramData,
) -> list[dict[str, str]]:
    """Validate application information."""

    flags: list[dict[str, str]] = []

    application = program.application

    if not isinstance(application, dict):
        flags.append(
            _make_flag(
                field="application",
                code="INVALID",
                reason="Application information must be an object.",
                severity="error",
            )
        )
        return flags

    application_url = application.get("url")

    # Application URL is optional. Only validate it when present.
    if application_url and not _is_valid_url(application_url):
        flags.append(
            _make_flag(
                field="application.url",
                code="INVALID",
                reason=(
                    "Application URL is not a valid "
                    "HTTP/HTTPS URL."
                ),
            )
        )

    return flags


def _validate_status(
    program: ProgramData,
) -> list[dict[str, str]]:
    """Validate program status."""

    flags: list[dict[str, str]] = []

    if program.status not in VALID_STATUSES:
        flags.append(
            _make_flag(
                field="status",
                code="INVALID",
                reason=f"Unsupported program status: {program.status}",
                severity="error",
            )
        )

    elif program.status == "unknown":
        flags.append(
            _make_flag(
                field="status",
                code="UNCERTAIN",
                reason="Program application status could not be determined.",
            )
        )

    return flags


def _validate_coverage(
    program: ProgramData,
) -> list[dict[str, str]]:
    """Validate geographic coverage information."""

    flags: list[dict[str, str]] = []

    coverage = program.coverage

    if not isinstance(coverage, dict):
        flags.append(
            _make_flag(
                field="coverage",
                code="INVALID",
                reason="Coverage must be an object.",
                severity="error",
            )
        )
        return flags

    coverage_type = coverage.get("type")
    locations = coverage.get("locations")

    if coverage_type is not None:
        if not isinstance(coverage_type, str):
            flags.append(
                _make_flag(
                    field="coverage.type",
                    code="INVALID",
                    reason="Coverage type must be a string.",
                )
            )

        elif coverage_type not in VALID_COVERAGE_TYPES:
            flags.append(
                _make_flag(
                    field="coverage.type",
                    code="SUSPICIOUS",
                    reason=(
                        f"Unrecognized coverage type: "
                        f"{coverage_type}"
                    ),
                )
            )

    if locations is not None and not isinstance(locations, list):
        flags.append(
            _make_flag(
                field="coverage.locations",
                code="INVALID",
                reason="Coverage locations must be a list.",
            )
        )

    return flags


def _validate_age(
    eligibility: dict[str, Any],
) -> list[dict[str, str]]:
    """Validate extracted age requirements."""

    flags: list[dict[str, str]] = []

    age = eligibility.get("age")

    # Missing age requirement is allowed.
    if age is None or age == {}:
        return flags

    if not isinstance(age, dict):
        flags.append(
            _make_flag(
                field="eligibility.age",
                code="INVALID",
                reason="Age eligibility must be an object.",
            )
        )
        return flags

    minimum = age.get("min")
    maximum = age.get("max")

    if minimum is not None:
        if not isinstance(minimum, (int, float)):
            flags.append(
                _make_flag(
                    field="eligibility.age.min",
                    code="INVALID",
                    reason="Minimum age must be numeric.",
                )
            )

        elif minimum < 10 or minimum > 65:
            flags.append(
                _make_flag(
                    field="eligibility.age.min",
                    code="SUSPICIOUS",
                    reason=(
                        f"Extracted minimum age of {minimum} "
                        "is outside the expected range."
                    ),
                )
            )

    if maximum is not None:
        if not isinstance(maximum, (int, float)):
            flags.append(
                _make_flag(
                    field="eligibility.age.max",
                    code="INVALID",
                    reason="Maximum age must be numeric.",
                )
            )

        elif maximum < 10 or maximum > 65:
            flags.append(
                _make_flag(
                    field="eligibility.age.max",
                    code="SUSPICIOUS",
                    reason=(
                        f"Extracted maximum age of {maximum} "
                        "is outside the expected range."
                    ),
                )
            )

    if (
        isinstance(minimum, (int, float))
        and isinstance(maximum, (int, float))
        and minimum > maximum
    ):
        flags.append(
            _make_flag(
                field="eligibility.age",
                code="CONFLICT",
                reason=(
                    "Minimum age is greater than maximum age."
                ),
                severity="error",
            )
        )

    return flags


def _validate_income(
    eligibility: dict[str, Any],
) -> list[dict[str, str]]:
    """Validate extracted income requirements."""

    flags: list[dict[str, str]] = []

    income = eligibility.get("income")

    # No explicit income requirement is acceptable.
    if income is None or income == {}:
        return flags

    if not isinstance(income, dict):
        flags.append(
            _make_flag(
                field="eligibility.income",
                code="INVALID",
                reason="Income eligibility must be an object.",
            )
        )
        return flags

    maximum = income.get("max")
    period = income.get("period")
    raw_text = income.get("raw_text")

    if maximum is not None:
        if not isinstance(maximum, (int, float)):
            flags.append(
                _make_flag(
                    field="eligibility.income.max",
                    code="INVALID",
                    reason="Maximum income must be numeric.",
                )
            )

        elif maximum <= 0:
            flags.append(
                _make_flag(
                    field="eligibility.income.max",
                    code="INVALID",
                    reason="Maximum income must be greater than zero.",
                )
            )

    if period is not None and period not in VALID_INCOME_PERIODS:
        flags.append(
            _make_flag(
                field="eligibility.income.period",
                code="INVALID",
                reason=f"Unrecognized income period: {period}",
            )
        )

    # Check obvious annual/monthly conflicts using the
    # scraper-provided raw evidence.
    if isinstance(raw_text, str):
        raw_lower = raw_text.lower()

        annual_words = {
            "annual",
            "annually",
            "per year",
            "yearly",
        }

        monthly_words = {
            "monthly",
            "per month",
        }

        mentions_annual = any(
            word in raw_lower
            for word in annual_words
        )

        mentions_monthly = any(
            word in raw_lower
            for word in monthly_words
        )

        if period == "monthly" and mentions_annual and not mentions_monthly:
            flags.append(
                _make_flag(
                    field="eligibility.income.period",
                    code="CONFLICT",
                    reason=(
                        "Income period was extracted as monthly, "
                        "but the source text describes an annual amount."
                    ),
                )
            )

        elif period == "annual" and mentions_monthly and not mentions_annual:
            flags.append(
                _make_flag(
                    field="eligibility.income.period",
                    code="CONFLICT",
                    reason=(
                        "Income period was extracted as annual, "
                        "but the source text describes a monthly amount."
                    ),
                )
            )

        # Catch obvious cases where a benefit amount appears to
        # have been incorrectly extracted as an income threshold.
        benefit_terms = {
            "subsidy",
            "allowance",
            "stipend",
            "grant",
            "benefit",
            "financial assistance",
        }

        income_terms = {
            "income",
            "gross income",
            "family income",
            "household income",
            "parents' income",
            "parent income",
        }

        mentions_benefit = any(
            term in raw_lower
            for term in benefit_terms
        )

        mentions_income = any(
            term in raw_lower
            for term in income_terms
        )

        if mentions_benefit and not mentions_income:
            flags.append(
                _make_flag(
                    field="eligibility.income",
                    code="SUSPICIOUS",
                    reason=(
                        "Extracted income evidence appears to describe "
                        "a program benefit rather than an applicant "
                        "income requirement."
                    ),
                )
            )

    return flags


def _validate_education(
    eligibility: dict[str, Any],
) -> list[dict[str, str]]:
    """Validate extracted education requirements."""

    flags: list[dict[str, str]] = []

    education = eligibility.get("education")

    if education is None or education == {}:
        return flags

    if not isinstance(education, dict):
        flags.append(
            _make_flag(
                field="eligibility.education",
                code="INVALID",
                reason="Education eligibility must be an object.",
            )
        )
        return flags

    levels = education.get("levels")
    raw_text = education.get("raw_text")

    if levels is not None and not isinstance(levels, list):
        flags.append(
            _make_flag(
                field="eligibility.education.levels",
                code="INVALID",
                reason="Education levels must be a list.",
            )
        )

    # If substantial education-related source text was captured
    # but no education level was identified, extraction may need
    # review.
    if (
        isinstance(levels, list)
        and not levels
        and isinstance(raw_text, str)
        and len(raw_text.strip()) >= 50
    ):
        flags.append(
            _make_flag(
                field="eligibility.education.levels",
                code="UNCERTAIN",
                reason=(
                    "Education-related text was extracted, but no "
                    "education level was identified."
                ),
            )
        )

    return flags


def _validate_residency(
    eligibility: dict[str, Any],
) -> list[dict[str, str]]:
    """Validate residency requirements."""

    flags: list[dict[str, str]] = []

    residency = eligibility.get("residency")

    if residency is None or residency == {}:
        return flags

    if not isinstance(residency, dict):
        flags.append(
            _make_flag(
                field="eligibility.residency",
                code="INVALID",
                reason="Residency eligibility must be an object.",
            )
        )
        return flags

    locations = residency.get("locations")
    raw_text = residency.get("raw_text")

    if locations is not None and not isinstance(locations, list):
        flags.append(
            _make_flag(
                field="eligibility.residency.locations",
                code="INVALID",
                reason="Residency locations must be a list.",
            )
        )

    # Source text appears to contain a residency restriction,
    # but the scraper failed to identify a location.
    if (
        isinstance(locations, list)
        and not locations
        and isinstance(raw_text, str)
        and raw_text.strip()
    ):
        residency_terms = {
            "resident",
            "residency",
            "residing",
            "municipality",
            "province",
            "city",
            "region",
        }

        raw_lower = raw_text.lower()

        if any(term in raw_lower for term in residency_terms):
            flags.append(
                _make_flag(
                    field="eligibility.residency.locations",
                    code="UNCERTAIN",
                    reason=(
                        "Residency-related text was extracted, but "
                        "no location was identified."
                    ),
                )
            )

    return flags


def _validate_eligibility(
    program: ProgramData,
) -> list[dict[str, str]]:
    """Validate nested eligibility fields."""

    flags: list[dict[str, str]] = []

    eligibility = program.eligibility

    if not isinstance(eligibility, dict):
        flags.append(
            _make_flag(
                field="eligibility",
                code="INVALID",
                reason="Eligibility must be an object.",
                severity="error",
            )
        )
        return flags

    flags.extend(_validate_age(eligibility))
    flags.extend(_validate_income(eligibility))
    flags.extend(_validate_education(eligibility))
    flags.extend(_validate_residency(eligibility))

    return flags


def validate_program_fields(
    program: ProgramData,
) -> list[dict[str, str]]:
    """
    Run deterministic field-level quality checks.

    This function assumes ProgramData structural validation has
    already succeeded.

    Missing optional eligibility fields are not automatically
    treated as errors because a source may legitimately omit a
    requirement.

    Returns a list of structured field flags.
    """

    flags: list[dict[str, str]] = []

    flags.extend(_validate_provider(program))
    flags.extend(_validate_description(program))
    flags.extend(_validate_source(program))
    flags.extend(_validate_application(program))
    flags.extend(_validate_status(program))
    flags.extend(_validate_coverage(program))
    flags.extend(_validate_eligibility(program))

    return flags