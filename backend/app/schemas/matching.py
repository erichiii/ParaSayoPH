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
    #
    # Examples:
    #
    # {
    #     "senior_citizen": True,
    #     "pwd": False,
    #     "solo_parent": True,
    #     "filipino_citizen": True,
    #     "employment_status": "unemployed"
    # }
    #
    # These can later be used by deterministic matchers for
    # program-specific requirements.

    other_attributes: dict[str, Any] = Field(
        default_factory=dict
    )


class ProgramMatchResult(BaseModel):
    """
    Final result of matching one user against one program.

    eligible:
        True:
            No known mandatory eligibility criterion failed
            and all applicable criteria could be evaluated.

        False:
            At least one mandatory eligibility criterion
            clearly failed.

        None:
            No known conflict exists, but at least one
            mandatory requirement could not be verified.
    """

    program_id: int

    score: int

    eligible: bool | None

    criteria: list[CriterionResult]

    matches: list[str] = Field(
        default_factory=list
    )

    conflicts: list[str] = Field(
        default_factory=list
    )

    uncertain: list[str] = Field(
        default_factory=list
    )