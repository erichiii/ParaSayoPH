from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator


VALID_STATUSES = {
    "open",
    "ongoing",
    "upcoming",
    "closed",
    "unknown",
}


class ProgramData(BaseModel):
    title: str
    category: str

    provider: str | None = None
    description: str | None = None

    coverage: dict[str, Any] = Field(default_factory=dict)
    eligibility: dict[str, Any] = Field(default_factory=dict)

    benefits: list[Any] = Field(default_factory=list)
    requirements: list[Any] = Field(default_factory=list)

    application: dict[str, Any] = Field(default_factory=dict)
    source: dict[str, Any] = Field(default_factory=dict)

    status: str = "unknown"

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("title must not be empty or blank")

        return value.strip()

    @field_validator("category")
    @classmethod
    def category_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("category must not be empty or blank")

        return value.strip()