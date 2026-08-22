from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class MatchStatus(str, Enum):
    """
    Result of evaluating one matching criterion.
    """

    MATCH = "match"
    NO_MATCH = "no_match"
    UNKNOWN = "unknown"
    NOT_APPLICABLE = "not_applicable"


class ProgramMatchStatus(str, Enum):
    """
    Frontend-friendly overall matching status.

    LIKELY_ELIGIBLE:
        The matcher was able to evaluate at least one
        eligibility requirement and found no unresolved
        or conflicting eligibility requirements.

    NEEDS_VERIFICATION:
        No known eligibility conflict exists, but some
        requirements could not be verified, or there was
        not enough eligibility information to confirm the
        user's eligibility.

    LIKELY_INELIGIBLE:
        At least one explicit eligibility requirement
        conflicts with the user's profile.
    """

    LIKELY_ELIGIBLE = "likely_eligible"
    NEEDS_VERIFICATION = "needs_verification"
    LIKELY_INELIGIBLE = "likely_ineligible"


class CriterionResult(BaseModel):
    """
    Result of evaluating one criterion.
    """

    criterion: str
    status: MatchStatus
    points: int = 0
    max_points: int = 0
    reason: str


class UserProfile(BaseModel):
    """
    User information used by the deterministic matcher.

    Eligibility fields are optional because ParaSayoPH
    supports different kinds of public-service programs.

    Missing information must never automatically mean that
    the user is ineligible.
    """

    # ---------------------------------------------------------
    # General information
    # ---------------------------------------------------------

    age: int | None = Field(
        default=None,
        ge=0,
        le=120,
    )

    location: str | None = None

    # ---------------------------------------------------------
    # Education information
    # ---------------------------------------------------------

    education_level: str | None = None

    field_of_study: str | None = None

    # ---------------------------------------------------------
    # Financial information
    # ---------------------------------------------------------

    income: float | None = Field(
        default=None,
        ge=0,
    )

    income_period: str | None = None

    income_scope: str | None = None

    # ---------------------------------------------------------
    # User preferences
    # ---------------------------------------------------------

    preferred_categories: list[str] = Field(
        default_factory=list
    )

    interests: list[str] = Field(
        default_factory=list
    )

    # ---------------------------------------------------------
    # Flexible program-specific attributes
    # ---------------------------------------------------------

    other_attributes: dict[str, Any] = Field(
        default_factory=dict
    )


class ProgramMatchResult(BaseModel):
    """
    Final result of matching one user against one program.

    `eligible` preserves the deterministic backend decision.

    `match_status` gives the frontend a clearer presentation
    state.

    Programs should remain discoverable even when
    match_status is LIKELY_INELIGIBLE. The status is used
    for ranking and explanation, not for hiding programs.
    """

    # ---------------------------------------------------------
    # Program information
    # ---------------------------------------------------------

    program_id: int

    title: str

    provider: str | None = None

    category: str

    status: str

    # ---------------------------------------------------------
    # Matching result
    # ---------------------------------------------------------

    score: int

    eligible: bool | None

    match_status: ProgramMatchStatus

    criteria: list[CriterionResult]

    # ---------------------------------------------------------
    # Explainability
    # ---------------------------------------------------------

    matches: list[str] = Field(
        default_factory=list
    )

    conflicts: list[str] = Field(
        default_factory=list
    )

    uncertain: list[str] = Field(
        default_factory=list
    )