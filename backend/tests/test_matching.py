import os

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "test-key")

from app.routes import matching
from app.routes.programs import PUBLIC_PROGRAM_COLUMNS
from app.schemas.matching import MatchProfile
from app.schemas.public_program import PublicProgram
from app.services.matching_service import match_program


def public_program_row(**overrides):
    row = {
        "id": 17,
        "title": "Example Training Program",
        "provider": None,
        "category": "training",
        "description": None,
        "coverage": {"type": "regional", "locations": ["Cebu"]},
        "eligibility": {
            "age": {"min": 18, "max": 25, "raw_text": None},
            "education": {"levels": ["second_year_college"], "raw_text": None},
            "employment": {"statuses": ["student"], "raw_text": None},
            "income": {"min": None, "max": None, "period": None, "scope": None, "raw_text": None},
            "residency": {"locations": [], "raw_text": None},
            "other_requirements": [],
        },
        "benefits": [],
        "requirements": [],
        "application": {"start_date": None, "deadline": None, "process": None, "url": None},
        "source": {
            "url": "https://example.gov.ph/programs/training",
            "last_verified_at": "2026-08-23T10:30:00+00:00",
        },
        "status": "unknown",
        "staging_record_id": 42,
    }
    row.update(overrides)
    return row


def public_program(**overrides) -> PublicProgram:
    return PublicProgram.model_validate(public_program_row(**overrides))


def profile(**overrides) -> MatchProfile:
    values = {
        "location": "region_7",
        "age": 20,
        "employment_status": "student",
        "education_level": "second_year_college",
        "categories_needed": ["training"],
    }
    values.update(overrides)
    return MatchProfile.model_validate(values)


def reason_codes(result) -> set[str]:
    return {reason.code for reason in result.reasons}


def test_complete_profile_with_mapped_evidence_is_likely_eligible():
    result = match_program(profile(), public_program())

    assert result is not None
    assert result.match_state == "likely_eligible"
    assert reason_codes(result) == {
        "category_selected",
        "age_within_range",
        "coverage_location_match",
        "education_level_match",
        "employment_status_match",
    }


def test_partial_profile_with_nationwide_coverage_is_uncertain():
    program = public_program(
        coverage={"type": "nationwide", "locations": ["Philippines"]},
        eligibility={
            "age": {"min": 18, "max": 25, "raw_text": None},
            "education": {"levels": [], "raw_text": None},
            "employment": {"statuses": [], "raw_text": None},
            "income": {"min": None, "max": None, "period": None, "scope": None, "raw_text": None},
            "residency": {"locations": [], "raw_text": None},
            "other_requirements": [],
        },
    )
    result = match_program(
        profile(location=None, age=None, employment_status=None, education_level=None), program
    )

    assert result is not None
    assert result.match_state == "uncertain"
    assert reason_codes(result) == {"category_selected", "nationwide_coverage", "age_not_submitted"}


def test_unmapped_location_is_uncertain_not_a_conflict():
    result = match_program(
        profile(),
        public_program(coverage={"type": "city", "locations": ["Unmapped Municipality"]}),
    )

    assert result is not None
    assert result.match_state == "uncertain"
    assert "location_criteria_unavailable" in reason_codes(result)


@pytest.mark.parametrize(
    ("changes", "program_changes"),
    [
        ({"age": 30}, {}),
        ({"location": "ncr"}, {}),
        ({"education_level": "third_year_college"}, {}),
        ({"employment_status": "employed"}, {}),
    ],
)
def test_known_structured_conflicts_are_omitted(changes, program_changes):
    assert match_program(profile(**changes), public_program(**program_changes)) is None


def test_missing_program_employment_data_is_uncertain_when_submitted():
    program = public_program(
        eligibility={
            "age": {"min": 18, "max": 25, "raw_text": None},
            "education": {"levels": ["second_year_college"], "raw_text": None},
            "employment": {"statuses": [], "raw_text": None},
            "income": {"min": None, "max": None, "period": None, "scope": None, "raw_text": None},
            "residency": {"locations": [], "raw_text": None},
            "other_requirements": [],
        }
    )
    result = match_program(profile(), program)

    assert result is not None
    assert result.match_state == "uncertain"
    assert "employment_criteria_unavailable" in reason_codes(result)


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeProgramQuery:
    def __init__(self, rows):
        self.rows = rows
        self.columns = None

    def select(self, columns):
        self.columns = columns
        return self

    def execute(self):
        return FakeResponse(self.rows)


class FakeSupabase:
    def __init__(self, rows):
        self.query = FakeProgramQuery(rows)

    def table(self, name):
        assert name == "programs"
        return self.query


@pytest.fixture
def client(monkeypatch):
    app = FastAPI()
    app.include_router(matching.router)
    fake_supabase = FakeSupabase([public_program_row()])
    monkeypatch.setattr(matching, "supabase", fake_supabase)
    return TestClient(app), fake_supabase


def test_api_returns_public_qualitative_results_without_internal_fields(client):
    test_client, fake_supabase = client
    response = test_client.post(
        "/api/match",
        json={
            "location": "region_7",
            "age": 20,
            "employment_status": "student",
            "education_level": "second_year_college",
            "categories_needed": ["training"],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert fake_supabase.query.columns == PUBLIC_PROGRAM_COLUMNS
    assert len(body["results"]) == 1
    assert body["results"][0]["match_state"] == "likely_eligible"
    assert "staging_record_id" not in body["results"][0]["program"]
    assert not {"score", "points", "rank", "eligible", "criteria"} & set(body["results"][0])


def test_api_returns_empty_results_when_category_filter_excludes_programs(client):
    test_client, _ = client
    response = test_client.post(
        "/api/match",
        json={
            "location": None,
            "age": None,
            "employment_status": None,
            "education_level": None,
            "categories_needed": ["scholarship"],
        },
    )

    assert response.status_code == 200
    assert response.json() == {"results": []}


@pytest.mark.parametrize(
    "payload",
    [
        {"location": "unknown", "age": None, "employment_status": None, "education_level": None, "categories_needed": []},
        {"location": None, "age": -1, "employment_status": None, "education_level": None, "categories_needed": []},
        {"location": None, "age": None, "employment_status": "unknown", "education_level": None, "categories_needed": []},
        {"location": None, "age": None, "employment_status": None, "education_level": "college", "categories_needed": []},
        {"location": None, "age": None, "employment_status": None, "education_level": None, "categories_needed": ["training", "training"]},
        {"location": None, "age": None, "employment_status": None, "education_level": None, "categories_needed": ["other"]},
        {"location": None, "age": None, "employment_status": None, "education_level": None, "categories_needed": [], "income": 10},
    ],
)
def test_api_rejects_invalid_public_profiles(client, payload):
    test_client, _ = client
    assert test_client.post("/api/match", json=payload).status_code == 422
