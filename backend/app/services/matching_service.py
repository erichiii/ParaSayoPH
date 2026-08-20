from __future__ import annotations

from typing import Any

from app.schemas.matching import (
    CriterionResult,
    MatchStatus,
    UserProfile,
)


MATCH_WEIGHTS = {
    "location": 25,
    "education": 20,
    "age": 15,
    "category": 20,
    "interest": 10,
    "other_requirements": 10,
}

EDUCATION_ALIASES = {
    # Current scraper vocabulary
    "incoming_first_year_college": "incoming_first_year_college",
    "first_year_college": "incoming_first_year_college",
    "second_year_college": "second_year_college",
    "third_year_college": "third_year_college",
    "fourth_year_college": "fourth_year_college",
    "tvet": "tvet",

    # Future-friendly common aliases
    "1st_year_college": "incoming_first_year_college",
    "2nd_year_college": "second_year_college",
    "3rd_year_college": "third_year_college",
    "4th_year_college": "fourth_year_college",

    "technical_vocational": "tvet",
    "technical-vocational": "tvet",
    "vocational": "tvet",
}


def _unknown(
    criterion: str,
    reason: str,
) -> CriterionResult:
    """Create an UNKNOWN criterion result."""

    return CriterionResult(
        criterion=criterion,
        status=MatchStatus.UNKNOWN,
        points=0,
        max_points=MATCH_WEIGHTS[criterion],
        reason=reason,
    )


def _match(
    criterion: str,
    reason: str,
) -> CriterionResult:
    """Create a successful criterion result."""

    return CriterionResult(
        criterion=criterion,
        status=MatchStatus.MATCH,
        points=MATCH_WEIGHTS[criterion],
        max_points=MATCH_WEIGHTS[criterion],
        reason=reason,
    )


def _no_match(
    criterion: str,
    reason: str,
) -> CriterionResult:
    """Create a failed criterion result."""

    return CriterionResult(
        criterion=criterion,
        status=MatchStatus.NO_MATCH,
        points=0,
        max_points=MATCH_WEIGHTS[criterion],
        reason=reason,
    )

def _normalize_location(value: str) -> str:
    """Normalize a location string for deterministic comparison."""

    return " ".join(
        value.strip().lower().split()
    )

def _normalize_education_level(
    value: str,
) -> str | None:
    """
    Normalize a known education-level value.

    Unknown values return None instead of being guessed.
    """

    normalized = (
        value
        .strip()
        .lower()
        .replace(" ", "_")
    )

    return EDUCATION_ALIASES.get(normalized)

def _location_matches(
    user_location: str,
    allowed_location: str,
) -> bool:
    """
    Compare normalized location strings.

    This intentionally uses deterministic string matching
    rather than fuzzy/AI-based similarity.
    """

    user_value = _normalize_location(user_location)
    allowed_value = _normalize_location(allowed_location)

    if not user_value or not allowed_value:
        return False

    return (
        user_value == allowed_value
        or user_value in allowed_value
        or allowed_value in user_value
    )

def match_age(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Compare the user's age against the program's structured
    age eligibility requirement.

    Rules:
    - Missing user age -> UNKNOWN
    - Missing program age requirement -> UNKNOWN
    - Invalid/unusable program age data -> UNKNOWN
    - User inside min/max range -> MATCH
    - User outside min/max range -> NO_MATCH
    """

    criterion = "age"

    # We cannot evaluate age if the user did not provide it.
    if user.age is None:
        return _unknown(
            criterion,
            "Your age was not provided.",
        )

    eligibility = program.get("eligibility")

    if not isinstance(eligibility, dict):
        return _unknown(
            criterion,
            "The program's eligibility information could not be verified.",
        )

    age = eligibility.get("age")

    # An absent age restriction must NOT be interpreted as
    # automatically eligible.
    if not isinstance(age, dict) or not age:
        return _unknown(
            criterion,
            "The program's age requirement could not be verified.",
        )

    minimum = age.get("min")
    maximum = age.get("max")

    valid_minimum = isinstance(minimum, (int, float))
    valid_maximum = isinstance(maximum, (int, float))

    # An age object exists but contains no usable limits.
    if not valid_minimum and not valid_maximum:
        return _unknown(
            criterion,
            "The program's age requirement could not be verified.",
        )

    # Defensive check in case malformed data somehow reaches
    # the matcher.
    if (
        valid_minimum
        and valid_maximum
        and minimum > maximum
    ):
        return _unknown(
            criterion,
            "The program's age requirement contains conflicting values.",
        )

    # User is younger than the program's minimum age.
    if valid_minimum and user.age < minimum:
        return _no_match(
            criterion,
            f"Minimum eligible age is {minimum:g}.",
        )

    # User is older than the program's maximum age.
    if valid_maximum and user.age > maximum:
        return _no_match(
            criterion,
            f"Maximum eligible age is {maximum:g}.",
        )

    # At this point every known age boundary is satisfied.
    if valid_minimum and valid_maximum:
        return _match(
            criterion,
            (
                f"Your age is within the eligible range "
                f"of {minimum:g} to {maximum:g}."
            ),
        )

    if valid_minimum:
        return _match(
            criterion,
            f"You meet the minimum age requirement of {minimum:g}.",
        )

    return _match(
        criterion,
        f"You meet the maximum age requirement of {maximum:g}.",
    )

def match_location(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Match the user's location against program geographic
    availability and residency requirements.

    Priority:
    1. Explicit residency restrictions
    2. Nationwide coverage
    3. Explicit coverage locations
    4. Otherwise UNKNOWN
    """

    criterion = "location"

    if not user.location or not user.location.strip():
        return _unknown(
            criterion,
            "Your location was not provided.",
        )

    eligibility = program.get("eligibility")
    coverage = program.get("coverage")

    # ---------------------------------------------------------
    # 1. Check explicit residency restrictions first
    # ---------------------------------------------------------

    if isinstance(eligibility, dict):
        residency = eligibility.get("residency")

        if isinstance(residency, dict):
            locations = residency.get("locations")

            if isinstance(locations, list) and locations:
                valid_locations = [
                    location
                    for location in locations
                    if isinstance(location, str)
                    and location.strip()
                ]

                if valid_locations:
                    for location in valid_locations:
                        if _location_matches(
                            user.location,
                            location,
                        ):
                            return _match(
                                criterion,
                                (
                                    "Your location matches the "
                                    f"program's residency requirement "
                                    f"for {location}."
                                ),
                            )

                    return _no_match(
                        criterion,
                        (
                            "Your location does not match the "
                            "program's residency requirement."
                        ),
                    )

    # ---------------------------------------------------------
    # 2. Check nationwide coverage
    # ---------------------------------------------------------

    if isinstance(coverage, dict):
        coverage_type = coverage.get("type")

        if (
            isinstance(coverage_type, str)
            and coverage_type.strip().lower() == "nationwide"
        ):
            return _match(
                criterion,
                "The program is available nationwide.",
            )

    # ---------------------------------------------------------
    # 3. Check explicit geographic coverage
    # ---------------------------------------------------------

    if isinstance(coverage, dict):
        locations = coverage.get("locations")

        if isinstance(locations, list) and locations:
            valid_locations = [
                location
                for location in locations
                if isinstance(location, str)
                and location.strip()
            ]

            if valid_locations:
                for location in valid_locations:
                    if _location_matches(
                        user.location,
                        location,
                    ):
                        return _match(
                            criterion,
                            (
                                "The program is available in "
                                f"{location}."
                            ),
                        )

                return _no_match(
                    criterion,
                    (
                        "Your location is outside the program's "
                        "listed geographic coverage."
                    ),
                )

    # ---------------------------------------------------------
    # 4. No reliable location restriction could be evaluated
    # ---------------------------------------------------------

    return _unknown(
        criterion,
        "The program's location requirement could not be verified.",
    )

def match_education(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Compare the user's current education level against the
    program's explicitly accepted education levels.

    Matching is based on explicit membership rather than a
    numeric education hierarchy.

    Rules:
    - Missing user education -> UNKNOWN
    - Missing program education data -> UNKNOWN
    - Empty program levels -> UNKNOWN
    - Unknown/unrecognized values -> UNKNOWN
    - User level explicitly allowed -> MATCH
    - Known allowed levels exist but user is not included
      -> NO_MATCH
    """

    criterion = "education"

    # ---------------------------------------------------------
    # 1. User education must be known
    # ---------------------------------------------------------

    if (
        not user.education_level
        or not user.education_level.strip()
    ):
        return _unknown(
            criterion,
            "Your education level was not provided.",
        )

    user_level = _normalize_education_level(
        user.education_level
    )

    if user_level is None:
        return _unknown(
            criterion,
            (
                "Your education level is not yet recognized "
                "by the matching system."
            ),
        )

    # ---------------------------------------------------------
    # 2. Get program education requirements
    # ---------------------------------------------------------

    eligibility = program.get("eligibility")

    if not isinstance(eligibility, dict):
        return _unknown(
            criterion,
            (
                "The program's education requirement "
                "could not be verified."
            ),
        )

    education = eligibility.get("education")

    if not isinstance(education, dict) or not education:
        return _unknown(
            criterion,
            (
                "The program's education requirement "
                "could not be verified."
            ),
        )

    levels = education.get("levels")

    if not isinstance(levels, list) or not levels:
        return _unknown(
            criterion,
            (
                "The program's education level requirement "
                "could not be verified."
            ),
        )

    # ---------------------------------------------------------
    # 3. Normalize known program levels
    # ---------------------------------------------------------

    recognized_levels: list[str] = []
    has_unrecognized_levels = False

    for level in levels:
        if not isinstance(level, str):
            has_unrecognized_levels = True
            continue

        normalized_level = _normalize_education_level(level)

        if normalized_level is None:
            has_unrecognized_levels = True
            continue

        if normalized_level not in recognized_levels:
            recognized_levels.append(normalized_level)

    # None of the scraper's values are understood.
    if not recognized_levels:
        return _unknown(
            criterion,
            (
                "The program's education level requirement "
                "uses values that are not yet recognized."
            ),
        )

    # ---------------------------------------------------------
    # 4. Explicit match
    # ---------------------------------------------------------

    if user_level in recognized_levels:
        return _match(
            criterion,
            (
                "Your education level is accepted "
                "by the program."
            ),
        )

    # ---------------------------------------------------------
    # 5. Determine whether NO_MATCH is safe
    # ---------------------------------------------------------

    # If some program levels were unrecognized, we cannot safely
    # conclude that the user is excluded. One of those unknown
    # values could potentially describe the user's level.
    if has_unrecognized_levels:
        return _unknown(
            criterion,
            (
                "Some of the program's education requirements "
                "could not be interpreted reliably."
            ),
        )

    # Every program level was understood, and the user's level
    # was not among them.
    return _no_match(
        criterion,
        (
            "Your education level is not among the program's "
            "listed eligible education levels."
        ),
    )

def match_category(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Compare the program category against the user's preferred
    program categories.

    Rules:
    - No user category preferences -> UNKNOWN
    - Missing/invalid program category -> UNKNOWN
    - Program category is preferred -> MATCH
    - Program category is not preferred -> NO_MATCH
    """

    criterion = "category"

    if not user.preferred_categories:
        return _unknown(
            criterion,
            "You did not specify any preferred program categories.",
        )

    program_category = program.get("category")

    if (
        not isinstance(program_category, str)
        or not program_category.strip()
    ):
        return _unknown(
            criterion,
            "The program category could not be verified.",
        )

    normalized_program_category = (
        program_category
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
    )

    normalized_preferences = {
        category
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
        for category in user.preferred_categories
        if isinstance(category, str) and category.strip()
    }

    if not normalized_preferences:
        return _unknown(
            criterion,
            "You did not specify any valid program categories.",
        )

    if normalized_program_category in normalized_preferences:
        return _match(
            criterion,
            (
                f"The program matches your preferred category: "
                f"{normalized_program_category.replace('_', ' ')}."
            ),
        )

    return _no_match(
        criterion,
        (
            f"The program category "
            f"({normalized_program_category.replace('_', ' ')}) "
            f"is not among your preferred categories."
        ),
    )