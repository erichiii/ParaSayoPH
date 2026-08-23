from __future__ import annotations

from pydantic import BaseModel, field_validator


VALID_STATUSES = {"open", "ongoing", "upcoming", "closed", "unknown"}

VALID_CATEGORIES = {
    "scholarship",
    "financial_assistance",
    "medical_assistance",
    "crisis_assistance",
    "disaster_assistance",
    "transportation_assistance",
    "burial_assistance",
    "ofw_assistance",
    "training",
    "other",
}

class ProgramData(BaseModel):
    title: str
    category: str
    provider: str | None = None
    description: str | None = None
    coverage: dict = {}
    eligibility: dict = {}
    benefits: list = []
    requirements: list = []
    application: dict = {}
    source: dict = {}
    status: str = "unknown"

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("title must not be empty or blank")
        return v.strip()

    @field_validator("category")
    @classmethod
    def category_must_be_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("category must not be empty or blank")

        value = v.strip()

        if value not in VALID_CATEGORIES:
            raise ValueError(f"unsupported category: {value}")

        return value
