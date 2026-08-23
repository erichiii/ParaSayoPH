from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictInt, field_validator

from app.schemas.public_program import ProgramCategory, PublicProgram


RegionId = Literal[
    "ncr",
    "car",
    "region_3",
    "region_4a",
    "region_4b",
    "region_6",
    "region_7",
    "region_10",
    "region_11",
    "region_12",
    "barmm",
]
EmploymentStatusId = Literal["student", "employed", "job_seeker", "other"]
EducationLevelId = Literal[
    "incoming_first_year_college",
    "second_year_college",
    "third_year_college",
    "fourth_year_college",
    "tvet",
]
MatchableProgramCategory = Literal[
    "scholarship",
    "financial_assistance",
    "medical_assistance",
    "crisis_assistance",
    "disaster_assistance",
    "transportation_assistance",
    "burial_assistance",
    "ofw_assistance",
    "training",
]
MatchState = Literal["likely_eligible", "uncertain"]
MatchReasonCode = Literal[
    "category_selected",
    "age_within_range",
    "coverage_location_match",
    "nationwide_coverage",
    "residency_location_match",
    "employment_status_match",
    "education_level_match",
    "age_not_submitted",
    "location_not_submitted",
    "employment_not_submitted",
    "education_not_submitted",
    "age_criteria_unavailable",
    "location_criteria_unavailable",
    "employment_criteria_unavailable",
    "education_criteria_unavailable",
    "eligibility_details_unavailable",
]


class MatchProfile(BaseModel):
    """Transient, controlled profile submitted to the public matcher."""

    model_config = ConfigDict(extra="forbid")

    location: RegionId | None
    age: StrictInt | None = Field(default=None, ge=0)
    employment_status: EmploymentStatusId | None
    education_level: EducationLevelId | None
    categories_needed: list[MatchableProgramCategory]

    @field_validator("categories_needed")
    @classmethod
    def categories_must_be_unique(
        cls, value: list[MatchableProgramCategory]
    ) -> list[MatchableProgramCategory]:
        if len(value) != len(set(value)):
            raise ValueError("categories_needed must not contain duplicates")
        return value


class MatchReason(BaseModel):
    code: MatchReasonCode
    label: str


class MatchResult(BaseModel):
    program: PublicProgram
    match_state: MatchState
    reasons: list[MatchReason] = Field(min_length=1)


class MatchRecommendation(BaseModel):
    program_id: str
    reasons: list[MatchReason] = Field(min_length=1)


class MatchResponse(BaseModel):
    results: list[MatchResult]
    recommendation: MatchRecommendation | None = None
