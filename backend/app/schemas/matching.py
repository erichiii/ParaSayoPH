from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class MatchStatus(str, Enum):
    MATCH = "match"
    NO_MATCH = "no_match"
    UNKNOWN = "unknown"


class CriterionResult(BaseModel):
    criterion: str
    status: MatchStatus
    points: int = 0
    max_points: int
    reason: str


class UserProfile(BaseModel):
    age: int | None = Field(
        default=None,
        ge=0,
        le=120,
    )

    location: str | None = None

    education_level: str | None = None

    preferred_categories: list[str] = Field(
        default_factory=list
    )

    interests: list[str] = Field(
        default_factory=list
    )

    other_attributes: dict[str, Any] = Field(
        default_factory=dict
    )


class ProgramMatchResult(BaseModel):
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