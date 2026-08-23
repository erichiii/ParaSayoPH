from __future__ import annotations

from datetime import date, datetime
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, field_validator


ProgramCategory = Literal[
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
]
ProgramStatus = Literal["open", "ongoing", "upcoming", "closed", "unknown"]
CoverageType = Literal[
    "nationwide",
    "regional",
    "provincial",
    "city",
    "municipal",
    "district",
    "unknown",
]


class PublicModel(BaseModel):
    # Stored rows may contain operational keys. Public serialization strips them.
    model_config = ConfigDict(extra="ignore")


class PublicCoverage(PublicModel):
    type: CoverageType
    locations: list[str]


class PublicAgeEligibility(PublicModel):
    min: int | None
    max: int | None
    raw_text: str | None


class PublicEducationEligibility(PublicModel):
    levels: list[str]
    raw_text: str | None


class PublicEmploymentEligibility(PublicModel):
    statuses: list[str]
    raw_text: str | None


class PublicIncomeEligibility(PublicModel):
    min: float | None
    max: float | None
    period: str | None
    scope: str | None
    raw_text: str | None


class PublicResidencyEligibility(PublicModel):
    locations: list[str]
    raw_text: str | None


class PublicEligibility(PublicModel):
    age: PublicAgeEligibility
    education: PublicEducationEligibility
    employment: PublicEmploymentEligibility
    income: PublicIncomeEligibility
    residency: PublicResidencyEligibility
    other_requirements: list[str]


class PublicApplication(PublicModel):
    start_date: date | None
    deadline: date | None
    process: str | None
    url: str | None


class PublicSource(PublicModel):
    url: str
    last_verified_at: datetime

    @field_validator("url")
    @classmethod
    def url_must_be_http_or_https(cls, value: str) -> str:
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("source.url must be an HTTP/HTTPS URL")
        return value

    @field_validator("last_verified_at")
    @classmethod
    def checked_at_must_include_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("source.last_verified_at must include a timezone")
        return value


class PublicProgram(PublicModel):
    id: str
    title: str
    provider: str | None
    category: ProgramCategory
    description: str | None
    coverage: PublicCoverage
    eligibility: PublicEligibility
    benefits: list[str]
    requirements: list[str]
    application: PublicApplication
    source: PublicSource
    status: ProgramStatus

    @field_validator("id", mode="before")
    @classmethod
    def numeric_database_id_becomes_public_string(cls, value: object) -> str:
        if isinstance(value, bool) or not isinstance(value, (int, str)):
            raise ValueError("id must be a numeric database ID or string")
        normalized = str(value).strip()
        if not normalized.isdecimal():
            raise ValueError("id must be a numeric database ID")
        return normalized

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("title must not be blank")
        return normalized
