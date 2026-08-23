from __future__ import annotations

from collections.abc import Iterable

from app.schemas.matching import (
    MatchProfile,
    MatchRecommendation,
    MatchReason,
    MatchReasonCode,
    MatchResult,
)
from app.schemas.public_program import PublicProgram


LOCALITY_REGIONS = {
    "Baguio": "car",
    "Benguet": "car",
    "Bukidnon": "region_10",
    "Cebu": "region_7",
    "Davao City": "region_11",
    "Iloilo": "region_6",
    "Metro Manila": "ncr",
    "Misamis Oriental": "region_10",
    "Mountain Province": "car",
    "Negros Occidental": "region_6",
    "Palawan": "region_4b",
    "Quezon City": "ncr",
    "SOCCSKSARGEN": "region_12",
}
NATIONWIDE_LOCALITY = "Philippines"
CONFIRMED_ELIGIBILITY_GROUPS = {
    "age_within_range": "age",
    "coverage_location_match": "location",
    "nationwide_coverage": "location",
    "residency_location_match": "location",
    "education_level_match": "education",
    "employment_status_match": "employment",
}

REASON_LABELS: dict[MatchReasonCode, str] = {
    "category_selected": "Matches a category you selected.",
    "age_within_range": "Your age is within the listed age range.",
    "coverage_location_match": "Your location is listed in the program coverage.",
    "nationwide_coverage": "This program is available nationwide.",
    "residency_location_match": "Your location meets the listed residency requirement.",
    "employment_status_match": "Your current status matches the listed requirement.",
    "education_level_match": "Your education level matches the listed requirement.",
    "age_not_submitted": "Add your age to check the listed age requirement.",
    "location_not_submitted": "Add your location to check the listed location requirement.",
    "employment_not_submitted": "Add your current status to check the listed employment requirement.",
    "education_not_submitted": "Add your education level to check the listed education requirement.",
    "age_criteria_unavailable": "The published eligibility details do not include age information.",
    "location_criteria_unavailable": "The published eligibility details do not include location information.",
    "employment_criteria_unavailable": "The published eligibility details do not include employment information.",
    "education_criteria_unavailable": "The published eligibility details do not include education information.",
    "eligibility_details_unavailable": "The published eligibility details do not include structured requirements.",
}


def _reason(code: MatchReasonCode) -> MatchReason:
    return MatchReason(code=code, label=REASON_LABELS[code])


def _valid_age_bound(value: object) -> int | None:
    if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
        return value
    return None


def _mapped_regions(locations: Iterable[str]) -> tuple[set[str], bool, bool]:
    regions: set[str] = set()
    has_unmapped = False
    nationwide = False
    for location in locations:
        if location == NATIONWIDE_LOCALITY:
            nationwide = True
        elif location in LOCALITY_REGIONS:
            regions.add(LOCALITY_REGIONS[location])
        else:
            has_unmapped = True
    return regions, has_unmapped, nationwide


def _add_reason(reasons: list[MatchReason], code: MatchReasonCode) -> None:
    if not any(reason.code == code for reason in reasons):
        reasons.append(_reason(code))


def _check_location_values(
    profile: MatchProfile,
    locations: list[str],
    matched_code: MatchReasonCode,
    reasons: list[MatchReason],
) -> tuple[bool, bool]:
    """Return (known_conflict, uncertain) for one structured location list."""
    regions, has_unmapped, nationwide = _mapped_regions(locations)

    if nationwide:
        _add_reason(reasons, "nationwide_coverage")
        return False, False

    if profile.location is None:
        _add_reason(reasons, "location_not_submitted")
        return False, True

    if profile.location in regions:
        _add_reason(reasons, matched_code)
        return False, False

    if has_unmapped:
        _add_reason(reasons, "location_criteria_unavailable")
        return False, True

    if regions:
        return True, False

    _add_reason(reasons, "location_criteria_unavailable")
    return False, True


def match_program(profile: MatchProfile, program: PublicProgram) -> MatchResult | None:
    """Return a public qualitative result, or omit an explicit conflict."""
    if profile.categories_needed and program.category not in profile.categories_needed:
        return None

    reasons: list[MatchReason] = []
    uncertain = False
    structured_evidence = False

    if profile.categories_needed:
        _add_reason(reasons, "category_selected")

    age = program.eligibility.age
    minimum = _valid_age_bound(age.min)
    maximum = _valid_age_bound(age.max)
    if minimum is not None or maximum is not None:
        structured_evidence = True
        if profile.age is None:
            _add_reason(reasons, "age_not_submitted")
            uncertain = True
        elif (minimum is not None and profile.age < minimum) or (
            maximum is not None and profile.age > maximum
        ):
            return None
        else:
            _add_reason(reasons, "age_within_range")
    elif profile.age is not None:
        _add_reason(reasons, "age_criteria_unavailable")
        uncertain = True

    coverage_locations = program.coverage.locations
    residency_locations = program.eligibility.residency.locations
    if coverage_locations:
        structured_evidence = True
        conflict, location_uncertain = _check_location_values(
            profile, coverage_locations, "coverage_location_match", reasons
        )
        if conflict:
            return None
        uncertain = uncertain or location_uncertain
    elif program.coverage.type != "nationwide" and profile.location is not None:
        _add_reason(reasons, "location_criteria_unavailable")
        uncertain = True
    elif program.coverage.type == "nationwide":
        structured_evidence = True
        _add_reason(reasons, "nationwide_coverage")

    if residency_locations:
        structured_evidence = True
        conflict, location_uncertain = _check_location_values(
            profile, residency_locations, "residency_location_match", reasons
        )
        if conflict:
            return None
        uncertain = uncertain or location_uncertain

    education_levels = program.eligibility.education.levels
    if education_levels:
        structured_evidence = True
        if profile.education_level is None:
            _add_reason(reasons, "education_not_submitted")
            uncertain = True
        elif profile.education_level in education_levels:
            _add_reason(reasons, "education_level_match")
        else:
            return None
    elif profile.education_level is not None:
        _add_reason(reasons, "education_criteria_unavailable")
        uncertain = True

    employment_statuses = program.eligibility.employment.statuses
    if employment_statuses:
        structured_evidence = True
        if profile.employment_status is None:
            _add_reason(reasons, "employment_not_submitted")
            uncertain = True
        elif profile.employment_status in employment_statuses:
            _add_reason(reasons, "employment_status_match")
        else:
            return None
    elif profile.employment_status is not None:
        _add_reason(reasons, "employment_criteria_unavailable")
        uncertain = True

    if not structured_evidence:
        _add_reason(reasons, "eligibility_details_unavailable")
        uncertain = True

    return MatchResult(
        program=program,
        match_state="uncertain" if uncertain else "likely_eligible",
        reasons=reasons,
    )


def select_recommendation(results: list[MatchResult]) -> MatchRecommendation | None:
    """Select one open result with sufficient confirmed eligibility evidence."""
    for result in results:
        if result.match_state != "likely_eligible" or result.program.status != "open":
            continue

        evidence_groups = {
            CONFIRMED_ELIGIBILITY_GROUPS[reason.code]
            for reason in result.reasons
            if reason.code in CONFIRMED_ELIGIBILITY_GROUPS
        }
        if len(evidence_groups) >= 2:
            return MatchRecommendation(
                program_id=result.program.id,
                reasons=result.reasons,
            )

    return None
