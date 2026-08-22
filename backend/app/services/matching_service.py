from __future__ import annotations

from typing import Any

from app.schemas.matching import (
    CriterionResult,
    MatchStatus,
    ProgramMatchResult,
    ProgramMatchStatus,
    UserProfile,
)

# ============================================================
# MATCHING CONFIGURATION
# ============================================================

# Mandatory eligibility criteria determine whether the user
# can apply to a program.
#
# They DO NOT contribute directly to the relevance score.
ELIGIBILITY_CRITERIA = {
    "age",
    "location",
    "education",
    "income",
    "field_of_study",
    "other_requirements",
}


# Relevance criteria determine how closely the program matches
# what the user is looking for.
#
# These DO NOT determine eligibility.
RELEVANCE_WEIGHTS = {
    "category": 70,
    "interest": 30,
}


EDUCATION_ALIASES = {
    # Current scraper vocabulary
    "incoming_first_year_college": "incoming_first_year_college",
    "first_year_college": "incoming_first_year_college",
    "second_year_college": "second_year_college",
    "third_year_college": "third_year_college",
    "fourth_year_college": "fourth_year_college",
    "senior_high_school": "senior_high_school",
    "tvet": "tvet",

    # Common aliases
    "1st_year_college": "incoming_first_year_college",
    "2nd_year_college": "second_year_college",
    "3rd_year_college": "third_year_college",
    "4th_year_college": "fourth_year_college",

    "technical_vocational": "tvet",
    "technical-vocational": "tvet",
    "vocational": "tvet",
}


VALID_INCOME_PERIODS = {
    "annual",
    "monthly",
}


VALID_INCOME_SCOPES = {
    "family",
    "parents",
    "individual",
}


# ============================================================
# RESULT HELPERS
# ============================================================


def _criterion_max_points(
    criterion: str,
) -> int:
    """
    Return the scoring weight for a relevance criterion.

    Eligibility criteria intentionally receive zero points
    because eligibility and ranking are separate concepts.
    """

    return RELEVANCE_WEIGHTS.get(criterion, 0)


def _unknown(
    criterion: str,
    reason: str,
) -> CriterionResult:
    """
    Requirement exists, but there is not enough reliable
    information to determine the result.
    """

    return CriterionResult(
        criterion=criterion,
        status=MatchStatus.UNKNOWN,
        points=0,
        max_points=_criterion_max_points(criterion),
        reason=reason,
    )


def _match(
    criterion: str,
    reason: str,
) -> CriterionResult:
    """
    User satisfies the evaluated criterion.
    """

    weight = _criterion_max_points(criterion)

    return CriterionResult(
        criterion=criterion,
        status=MatchStatus.MATCH,
        points=weight,
        max_points=weight,
        reason=reason,
    )


def _no_match(
    criterion: str,
    reason: str,
) -> CriterionResult:
    """
    User clearly fails the evaluated criterion.
    """

    return CriterionResult(
        criterion=criterion,
        status=MatchStatus.NO_MATCH,
        points=0,
        max_points=_criterion_max_points(criterion),
        reason=reason,
    )


def _not_applicable(
    criterion: str,
    reason: str,
) -> CriterionResult:
    """
    Criterion does not apply to this program/user comparison.
    """

    return CriterionResult(
        criterion=criterion,
        status=MatchStatus.NOT_APPLICABLE,
        points=0,
        max_points=0,
        reason=reason,
    )


# ============================================================
# NORMALIZATION HELPERS
# ============================================================


def _normalize_identifier(
    value: str,
) -> str:
    """
    Normalize identifiers such as categories, interests,
    and fields of study.

    Example:
        "Information Technology"
        -> "information_technology"
    """

    return (
        value
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )


def _normalize_location(
    value: str,
) -> str:
    """
    Normalize a location for deterministic comparison.
    """

    return " ".join(
        value.strip().lower().split()
    )


def _normalize_education_level(
    value: str,
) -> str | None:
    """
    Normalize known education-level values.

    Unknown values return None instead of being guessed.
    """

    normalized = _normalize_identifier(value)

    return EDUCATION_ALIASES.get(normalized)


def _location_matches(
    user_location: str,
    allowed_location: str,
) -> bool:
    """
    Deterministic location comparison.

    No fuzzy or AI matching is performed.
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


def _get_eligibility(
    program: dict[str, Any],
) -> dict[str, Any] | None:
    """
    Safely retrieve the program eligibility object.
    """

    eligibility = program.get("eligibility")

    if not isinstance(eligibility, dict):
        return None

    return eligibility


# ============================================================
# AGE
# ============================================================


def match_age(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Compare user age against an explicit age requirement.

    Scraper convention:
        -1 = boundary was not detected.
    """

    criterion = "age"

    eligibility = _get_eligibility(program)

    if eligibility is None:
        return _not_applicable(
            criterion,
            "The program does not list an age requirement.",
        )

    age = eligibility.get("age")

    if not isinstance(age, dict) or not age:
        return _not_applicable(
            criterion,
            "The program does not list an age requirement.",
        )

    minimum = age.get("min")
    maximum = age.get("max")

    if minimum == -1 and maximum == -1:
        return _not_applicable(
            criterion,
            "The program does not list an age requirement.",
        )

    valid_minimum = (
        isinstance(minimum, (int, float))
        and not isinstance(minimum, bool)
        and minimum >= 0
    )

    valid_maximum = (
        isinstance(maximum, (int, float))
        and not isinstance(maximum, bool)
        and maximum >= 0
    )

    if not valid_minimum and not valid_maximum:
        return _unknown(
            criterion,
            "The program's age requirement could not be verified.",
        )

    if (
        valid_minimum
        and valid_maximum
        and minimum > maximum
    ):
        return _unknown(
            criterion,
            (
                "The program's age requirement contains "
                "conflicting values."
            ),
        )

    if user.age is None:
        return _unknown(
            criterion,
            (
                "The program has an age requirement, "
                "but your age was not provided."
            ),
        )

    if valid_minimum and user.age < minimum:
        return _no_match(
            criterion,
            f"Minimum eligible age is {minimum:g}.",
        )

    if valid_maximum and user.age > maximum:
        return _no_match(
            criterion,
            f"Maximum eligible age is {maximum:g}.",
        )

    if valid_minimum and valid_maximum:
        return _match(
            criterion,
            (
                "Your age is within the eligible range "
                f"of {minimum:g} to {maximum:g}."
            ),
        )

    if valid_minimum:
        return _match(
            criterion,
            (
                "You meet the minimum age requirement "
                f"of {minimum:g}."
            ),
        )

    return _match(
        criterion,
        (
            "You meet the maximum age requirement "
            f"of {maximum:g}."
        ),
    )


# ============================================================
# LOCATION / RESIDENCY
# ============================================================


def match_location(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Match user location against residency and geographic
    restrictions.

    Priority:
    1. Structured residency locations
    2. Nationwide coverage
    3. Structured coverage locations
    4. Unstructured residency requirement -> UNKNOWN
    5. No restriction -> NOT_APPLICABLE
    """

    criterion = "location"

    eligibility = _get_eligibility(program)
    coverage = program.get("coverage")

    residency = None

    if eligibility is not None:
        residency = eligibility.get("residency")

    # ---------------------------------------------------------
    # Explicit residency locations
    # ---------------------------------------------------------

    if isinstance(residency, dict):
        locations = residency.get("locations")

        if isinstance(locations, list):
            valid_locations = [
                location
                for location in locations
                if isinstance(location, str)
                and location.strip()
            ]

            if valid_locations:
                if (
                    not user.location
                    or not user.location.strip()
                ):
                    return _unknown(
                        criterion,
                        (
                            "The program has a residency "
                            "requirement, but your location "
                            "was not provided."
                        ),
                    )

                for location in valid_locations:
                    if _location_matches(
                        user.location,
                        location,
                    ):
                        return _match(
                            criterion,
                            (
                                "Your location matches the "
                                "program's residency requirement "
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
    # Nationwide coverage
    # ---------------------------------------------------------

    if isinstance(coverage, dict):
        coverage_type = coverage.get("type")

        if (
            isinstance(coverage_type, str)
            and coverage_type.strip().lower()
            == "nationwide"
        ):
            return _match(
                criterion,
                "The program is available nationwide.",
            )

    # ---------------------------------------------------------
    # Explicit geographic coverage
    # ---------------------------------------------------------

    if isinstance(coverage, dict):
        locations = coverage.get("locations")

        if isinstance(locations, list):
            valid_locations = [
                location
                for location in locations
                if isinstance(location, str)
                and location.strip()
            ]

            if valid_locations:
                if (
                    not user.location
                    or not user.location.strip()
                ):
                    return _unknown(
                        criterion,
                        (
                            "The program has a geographic "
                            "restriction, but your location "
                            "was not provided."
                        ),
                    )

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
    # Unstructured residency requirement
    # ---------------------------------------------------------

    if isinstance(residency, dict):
        raw_text = residency.get("raw_text")

        if (
            isinstance(raw_text, str)
            and raw_text.strip()
        ):
            return _unknown(
                criterion,
                (
                    "The program appears to have a residency "
                    "requirement, but the eligible location "
                    "could not be determined reliably."
                ),
            )

    return _not_applicable(
        criterion,
        "The program does not list a geographic restriction.",
    )


# ============================================================
# EDUCATION
# ============================================================


def match_education(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Compare user education level against explicitly accepted
    education levels.
    """

    criterion = "education"

    eligibility = _get_eligibility(program)

    if eligibility is None:
        return _not_applicable(
            criterion,
            "The program does not list an education requirement.",
        )

    education = eligibility.get("education")

    if (
        not isinstance(education, dict)
        or not education
    ):
        return _not_applicable(
            criterion,
            "The program does not list an education requirement.",
        )

    levels = education.get("levels")
    raw_text = education.get("raw_text")

    valid_levels = (
        isinstance(levels, list)
        and len(levels) > 0
    )

    if not valid_levels:
        if (
            isinstance(raw_text, str)
            and raw_text.strip()
        ):
            return _unknown(
                criterion,
                (
                    "The program appears to have an "
                    "education requirement, but the accepted "
                    "education level could not be determined "
                    "reliably."
                ),
            )

        return _not_applicable(
            criterion,
            "The program does not list an education requirement.",
        )

    if (
        not user.education_level
        or not user.education_level.strip()
    ):
        return _unknown(
            criterion,
            (
                "The program has an education requirement, "
                "but your education level was not provided."
            ),
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

    if not recognized_levels:
        return _unknown(
            criterion,
            (
                "The program's education requirement uses "
                "values that are not yet recognized."
            ),
        )

    if user_level in recognized_levels:
        return _match(
            criterion,
            "Your education level is accepted by the program.",
        )

    if has_unrecognized_levels:
        return _unknown(
            criterion,
            (
                "Some of the program's education requirements "
                "could not be interpreted reliably."
            ),
        )

    return _no_match(
        criterion,
        (
            "Your education level is not among the program's "
            "listed eligible education levels."
        ),
    )


# ============================================================
# INCOME
# ============================================================


def match_income(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Compare user income against structured program income
    requirements.

    The matcher does not silently convert periods or assume
    that family, parents, and individual income are equivalent.
    """

    criterion = "income"

    eligibility = _get_eligibility(program)

    if eligibility is None:
        return _not_applicable(
            criterion,
            "The program does not list an income requirement.",
        )

    income_requirement = eligibility.get("income")

    if (
        not isinstance(income_requirement, dict)
        or not income_requirement
    ):
        return _not_applicable(
            criterion,
            "The program does not list an income requirement.",
        )

    minimum = income_requirement.get("min")
    maximum = income_requirement.get("max")
    period = income_requirement.get("period")
    scope = income_requirement.get("scope")
    raw_text = income_requirement.get("raw_text")

    valid_minimum = (
        isinstance(minimum, (int, float))
        and not isinstance(minimum, bool)
        and minimum >= 0
    )

    valid_maximum = (
        isinstance(maximum, (int, float))
        and not isinstance(maximum, bool)
        and maximum >= 0
    )

    if not valid_minimum and not valid_maximum:
        if (
            isinstance(raw_text, str)
            and raw_text.strip()
        ):
            return _unknown(
                criterion,
                (
                    "The program appears to have an income "
                    "requirement, but the income limit could "
                    "not be determined reliably."
                ),
            )

        return _not_applicable(
            criterion,
            "The program does not list an income limit.",
        )

    if (
        valid_minimum
        and valid_maximum
        and minimum > maximum
    ):
        return _unknown(
            criterion,
            (
                "The program's income requirement contains "
                "conflicting minimum and maximum values."
            ),
        )

    if user.income is None:
        return _unknown(
            criterion,
            (
                "The program has an income requirement, "
                "but your income was not provided."
            ),
        )

    # ---------------------------------------------------------
    # Income period
    # ---------------------------------------------------------

    normalized_program_period = None

    if isinstance(period, str):
        candidate = period.strip().lower()

        if candidate in VALID_INCOME_PERIODS:
            normalized_program_period = candidate

    if normalized_program_period is None:
        return _unknown(
            criterion,
            (
                "The program's income period could "
                "not be verified."
            ),
        )

    if (
        not user.income_period
        or not user.income_period.strip()
    ):
        return _unknown(
            criterion,
            (
                "The program has an income requirement, "
                "but your income period was not provided."
            ),
        )

    normalized_user_period = (
        user.income_period.strip().lower()
    )

    if normalized_user_period not in VALID_INCOME_PERIODS:
        return _unknown(
            criterion,
            "Your income period is not recognized.",
        )

    if normalized_user_period != normalized_program_period:
        return _unknown(
            criterion,
            (
                "Your income period does not match the "
                "program's income period, so the values "
                "cannot be compared safely."
            ),
        )

    # ---------------------------------------------------------
    # Income scope
    # ---------------------------------------------------------

    normalized_program_scope = None

    if isinstance(scope, str):
        candidate = scope.strip().lower()

        if candidate in VALID_INCOME_SCOPES:
            normalized_program_scope = candidate

    if normalized_program_scope is None:
        return _unknown(
            criterion,
            (
                "The program's required income scope "
                "could not be verified."
            ),
        )

    if (
        not user.income_scope
        or not user.income_scope.strip()
    ):
        return _unknown(
            criterion,
            (
                "The program requires "
                f"{normalized_program_scope} income, "
                "but your income scope was not provided."
            ),
        )

    normalized_user_scope = (
        user.income_scope.strip().lower()
    )

    if normalized_user_scope not in VALID_INCOME_SCOPES:
        return _unknown(
            criterion,
            "Your income scope is not recognized.",
        )

    if normalized_user_scope != normalized_program_scope:
        return _unknown(
            criterion,
            (
                "Your provided income represents "
                f"{normalized_user_scope} income, while "
                "the program evaluates "
                f"{normalized_program_scope} income."
            ),
        )

    # ---------------------------------------------------------
    # Compare income
    # ---------------------------------------------------------

    if valid_minimum and user.income < minimum:
        return _no_match(
            criterion,
            (
                "Your income is below the program's "
                f"minimum requirement of {minimum:,.0f}."
            ),
        )

    if valid_maximum and user.income > maximum:
        return _no_match(
            criterion,
            (
                "Your income exceeds the program's "
                f"maximum limit of {maximum:,.0f}."
            ),
        )

    if valid_minimum and valid_maximum:
        return _match(
            criterion,
            (
                "Your income is within the program's "
                f"eligible range of {minimum:,.0f} "
                f"to {maximum:,.0f} "
                f"{normalized_program_period}."
            ),
        )

    if valid_maximum:
        return _match(
            criterion,
            (
                "Your income is within the program's "
                f"maximum limit of {maximum:,.0f} "
                f"{normalized_program_period}."
            ),
        )

    return _match(
        criterion,
        (
            "Your income meets the program's minimum "
            f"requirement of {minimum:,.0f} "
            f"{normalized_program_period}."
        ),
    )


# ============================================================
# FIELD OF STUDY
# ============================================================


def match_field_of_study(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Compare the user's course against structured eligible
    courses.

    Exact normalized program identifiers are used.
    """

    criterion = "field_of_study"

    eligibility = _get_eligibility(program)

    if eligibility is None:
        return _not_applicable(
            criterion,
            (
                "The program does not list a "
                "field-of-study requirement."
            ),
        )

    fields = eligibility.get("fields")

    if not isinstance(fields, dict) or not fields:
        return _not_applicable(
            criterion,
            (
                "The program does not list a "
                "field-of-study requirement."
            ),
        )

    programs = fields.get("programs")
    categories = fields.get("categories")
    raw_text = fields.get("raw_text")

    valid_programs: list[str] = []

    if isinstance(programs, list):
        valid_programs = [
            _normalize_identifier(program_name)
            for program_name in programs
            if (
                isinstance(program_name, str)
                and program_name.strip()
            )
        ]

    if not valid_programs:
        has_categories = (
            isinstance(categories, list)
            and any(
                isinstance(category, str)
                and category.strip()
                for category in categories
            )
        )

        has_raw_text = (
            isinstance(raw_text, str)
            and raw_text.strip()
        )

        if has_categories or has_raw_text:
            return _unknown(
                criterion,
                (
                    "The program appears to restrict eligible "
                    "fields of study, but the exact supported "
                    "programs could not be determined reliably."
                ),
            )

        return _not_applicable(
            criterion,
            (
                "The program does not list a "
                "field-of-study requirement."
            ),
        )

    if (
        not user.field_of_study
        or not user.field_of_study.strip()
    ):
        return _unknown(
            criterion,
            (
                "The program restricts eligible fields of "
                "study, but your field of study was not "
                "provided."
            ),
        )

    normalized_user_field = _normalize_identifier(
        user.field_of_study
    )

    readable_field = (
        normalized_user_field
        .replace("_", " ")
    )

    if normalized_user_field in valid_programs:
        return _match(
            criterion,
            (
                f"Your field of study ({readable_field}) "
                "is included in the program's eligible "
                "courses."
            ),
        )

    return _no_match(
        criterion,
        (
            f"Your field of study ({readable_field}) "
            "is not among the program's listed eligible "
            "courses."
        ),
    )


# ============================================================
# OTHER REQUIREMENTS
# ============================================================


def match_other_requirements(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Conservatively handle free-text eligibility requirements.

    Arbitrary natural-language requirements are not guessed.

    For the MVP:

    - No requirements -> NOT_APPLICABLE
    - Requirements exist -> UNKNOWN
    """

    criterion = "other_requirements"

    eligibility = _get_eligibility(program)

    if eligibility is None:
        return _not_applicable(
            criterion,
            (
                "The program does not list additional "
                "eligibility requirements."
            ),
        )

    requirements = eligibility.get(
        "other_requirements"
    )

    if not isinstance(requirements, list):
        return _not_applicable(
            criterion,
            (
                "The program does not list additional "
                "eligibility requirements."
            ),
        )

    valid_requirements = [
        requirement.strip()
        for requirement in requirements
        if (
            isinstance(requirement, str)
            and requirement.strip()
        )
    ]

    if not valid_requirements:
        return _not_applicable(
            criterion,
            (
                "The program does not list additional "
                "eligibility requirements."
            ),
        )

    return _unknown(
        criterion,
        (
            f"The program has {len(valid_requirements)} "
            "additional eligibility requirement(s) that "
            "must be reviewed separately."
        ),
    )


# ============================================================
# CATEGORY / USER NEED
# ============================================================


def match_category(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Compare program category against the categories the user
    is looking for.

    Category affects relevance, not eligibility.
    """

    criterion = "category"

    if not user.preferred_categories:
        return _unknown(
            criterion,
            (
                "You did not specify any preferred "
                "program categories."
            ),
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
        _normalize_identifier(program_category)
    )

    normalized_preferences = {
        _normalize_identifier(category)
        for category in user.preferred_categories
        if (
            isinstance(category, str)
            and category.strip()
        )
    }

    if not normalized_preferences:
        return _unknown(
            criterion,
            (
                "You did not specify any valid "
                "program categories."
            ),
        )

    if normalized_program_category in normalized_preferences:
        return _match(
            criterion,
            (
                "The program matches your preferred category: "
                f"{normalized_program_category.replace('_', ' ')}."
            ),
        )

    return _no_match(
        criterion,
        (
            "The program category "
            f"({normalized_program_category.replace('_', ' ')}) "
            "is not among your preferred categories."
        ),
    )


# ============================================================
# INTEREST
# ============================================================


def match_interest(
    user: UserProfile,
    program: dict[str, Any],
) -> CriterionResult:
    """
    Determine whether a program overlaps with the user's
    interests.

    Interest is a relevance criterion only.

    For the MVP, program interest signals are derived from
    structured fields.categories.
    """

    criterion = "interest"

    if not user.interests:
        return _not_applicable(
            criterion,
            "You did not specify any interests.",
        )

    normalized_interests = {
        _normalize_identifier(interest)
        for interest in user.interests
        if (
            isinstance(interest, str)
            and interest.strip()
        )
    }

    if not normalized_interests:
        return _not_applicable(
            criterion,
            "You did not specify any valid interests.",
        )

    eligibility = _get_eligibility(program)

    if eligibility is None:
        return _unknown(
            criterion,
            (
                "The program does not contain enough "
                "structured information to compare "
                "against your interests."
            ),
        )

    fields = eligibility.get("fields")

    if not isinstance(fields, dict):
        return _unknown(
            criterion,
            (
                "The program does not contain enough "
                "structured information to compare "
                "against your interests."
            ),
        )

    categories = fields.get("categories")

    if not isinstance(categories, list):
        return _unknown(
            criterion,
            (
                "The program's fields of interest "
                "could not be verified."
            ),
        )

    normalized_program_interests = {
        _normalize_identifier(category)
        for category in categories
        if (
            isinstance(category, str)
            and category.strip()
        )
    }

    if not normalized_program_interests:
        return _unknown(
            criterion,
            (
                "The program does not have enough "
                "structured field information to compare "
                "against your interests."
            ),
        )

    overlap = (
        normalized_interests
        & normalized_program_interests
    )

    if overlap:
        readable = sorted(
            value.replace("_", " ")
            for value in overlap
        )

        return _match(
            criterion,
            (
                "The program aligns with your interest in "
                f"{', '.join(readable)}."
            ),
        )

    return _no_match(
        criterion,
        (
            "The program's listed fields do not overlap "
            "with your stated interests."
        ),
    )


# ============================================================
# ELIGIBILITY DECISION
# ============================================================


def _determine_eligibility(
    criteria: list[CriterionResult],
) -> bool | None:
    """
    Determine final eligibility from mandatory criteria.

    False:
        At least one explicit eligibility criterion
        definitely failed.

    None:
        - At least one eligibility criterion is UNKNOWN, or
        - No actual eligibility requirements could be
          evaluated.

    True:
        At least one explicit eligibility requirement was
        evaluated and every applicable requirement passed.

    Relevance criteria such as category and interest do not
    affect eligibility.
    """

    eligibility_results = [
        result
        for result in criteria
        if result.criterion in ELIGIBILITY_CRITERIA
    ]

    # ---------------------------------------------------------
    # Any known conflict means ineligible
    # ---------------------------------------------------------

    if any(
        result.status == MatchStatus.NO_MATCH
        for result in eligibility_results
    ):
        return False

    # ---------------------------------------------------------
    # Any unresolved requirement prevents confirmed eligibility
    # ---------------------------------------------------------

    if any(
        result.status == MatchStatus.UNKNOWN
        for result in eligibility_results
    ):
        return None

    # ---------------------------------------------------------
    # Determine whether anything was actually evaluated
    # ---------------------------------------------------------

    applicable_results = [
        result
        for result in eligibility_results
        if result.status != MatchStatus.NOT_APPLICABLE
    ]

    # If every eligibility criterion was NOT_APPLICABLE,
    # there is not enough evidence to claim that the user is
    # confirmed eligible.
    if not applicable_results:
        return None

    return True

def _determine_match_status(
    eligible: bool | None,
) -> ProgramMatchStatus:
    """
    Convert the internal eligibility decision into a
    frontend-friendly presentation status.

    The frontend should use this status to group and label
    opportunities.

    Programs are never removed solely because they are
    LIKELY_INELIGIBLE.
    """

    if eligible is True:
        return ProgramMatchStatus.LIKELY_ELIGIBLE

    if eligible is False:
        return ProgramMatchStatus.LIKELY_INELIGIBLE

    return ProgramMatchStatus.NEEDS_VERIFICATION

# ============================================================
# RELEVANCE SCORE
# ============================================================


def _calculate_relevance_score(
    criteria: list[CriterionResult],
) -> int:
    """
    Calculate a 0-100 relevance score.

    Only relevance criteria participate:
        category
        interest

    NOT_APPLICABLE criteria are removed from the denominator.

    Eligibility does not contribute to this score.
    """

    relevance_results = [
        result
        for result in criteria
        if (
            result.criterion in RELEVANCE_WEIGHTS
            and result.status
            != MatchStatus.NOT_APPLICABLE
        )
    ]

    available_points = sum(
        result.max_points
        for result in relevance_results
    )

    earned_points = sum(
        result.points
        for result in relevance_results
    )

    if available_points <= 0:
        return 0

    score = round(
        (earned_points / available_points) * 100
    )

    return max(
        0,
        min(100, score),
    )


# ============================================================
# EXPLAINABILITY
# ============================================================


def _build_explanations(
    criteria: list[CriterionResult],
) -> tuple[
    list[str],
    list[str],
    list[str],
]:
    """
    Convert criterion results into frontend-friendly groups.

    MATCH          -> matches
    NO_MATCH       -> conflicts
    UNKNOWN        -> uncertain
    NOT_APPLICABLE -> omitted
    """

    matches: list[str] = []
    conflicts: list[str] = []
    uncertain: list[str] = []

    for result in criteria:

        if result.status == MatchStatus.MATCH:
            matches.append(
                result.reason
            )

        elif result.status == MatchStatus.NO_MATCH:
            conflicts.append(
                result.reason
            )

        elif result.status == MatchStatus.UNKNOWN:
            uncertain.append(
                result.reason
            )

    return (
        matches,
        conflicts,
        uncertain,
    )


# ============================================================
# PROGRAM AGGREGATOR
# ============================================================


def match_program(
    user: UserProfile,
    program: dict[str, Any],
) -> ProgramMatchResult:
    """
    Run the complete deterministic matching pipeline for one
    user and one program.

    Eligibility:
        age
        location
        education
        income
        field of study
        other requirements

    Relevance:
        category
        interest

    No AI or fuzzy inference is performed.
    """

    # ---------------------------------------------------------
    # Validate program ID
    # ---------------------------------------------------------

    raw_program_id = program.get("id")

    if (
        not isinstance(raw_program_id, int)
        or isinstance(raw_program_id, bool)
    ):
        raise ValueError(
            "Program must contain a valid integer 'id'."
        )

    # ---------------------------------------------------------
    # Validate frontend display information
    # ---------------------------------------------------------

    title = program.get("title")

    if (
        not isinstance(title, str)
        or not title.strip()
    ):
        raise ValueError(
            "Program must contain a valid title."
        )

    category = program.get("category")

    if (
        not isinstance(category, str)
        or not category.strip()
    ):
        raise ValueError(
            "Program must contain a valid category."
        )

    provider = program.get("provider")

    if (
        not isinstance(provider, str)
        or not provider.strip()
    ):
        provider = None
    else:
        provider = provider.strip()

    status = program.get("status")

    if (
        not isinstance(status, str)
        or not status.strip()
    ):
        status = "unknown"
    else:
        status = status.strip()

    # ---------------------------------------------------------
    # Run deterministic criteria
    # ---------------------------------------------------------

    criteria = [
        # Eligibility
        match_age(
            user,
            program,
        ),
        match_location(
            user,
            program,
        ),
        match_education(
            user,
            program,
        ),
        match_income(
            user,
            program,
        ),
        match_field_of_study(
            user,
            program,
        ),
        match_other_requirements(
            user,
            program,
        ),

        # Relevance
        match_category(
            user,
            program,
        ),
        match_interest(
            user,
            program,
        ),
    ]

    # ---------------------------------------------------------
    # Determine eligibility
    # ---------------------------------------------------------

    eligible = _determine_eligibility(
        criteria
    )

    match_status = _determine_match_status(
        eligible
    )

    # ---------------------------------------------------------
    # Calculate relevance
    # ---------------------------------------------------------

    score = _calculate_relevance_score(
        criteria
    )

    # ---------------------------------------------------------
    # Build explanations
    # ---------------------------------------------------------

    (
        matches,
        conflicts,
        uncertain,
    ) = _build_explanations(
        criteria
    )

    # ---------------------------------------------------------
    # Final response
    # ---------------------------------------------------------

    return ProgramMatchResult(
        program_id=raw_program_id,

        title=title.strip(),

        provider=provider,

        category=category.strip(),

        status=status,

        score=score,

        eligible=eligible,

        match_status=match_status,

        criteria=criteria,

        matches=matches,

        conflicts=conflicts,

        uncertain=uncertain,
    )