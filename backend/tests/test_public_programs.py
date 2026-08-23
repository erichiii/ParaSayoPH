import os

import pytest
from fastapi import HTTPException

# The route imports the database module; these inert values are replaced by a mock.
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "test-key")

from app.routes import programs


def public_program_row(*, program_id: int = 17, checked_at: str = "2026-08-23T10:30:00+00:00") -> dict:
    return {
        "id": program_id,
        "title": "Example Training Program",
        "provider": None,
        "category": "training",
        "description": None,
        "coverage": {"type": "nationwide", "locations": []},
        "eligibility": {
            "age": {"min": None, "max": None, "raw_text": None},
            "education": {"levels": [], "raw_text": None},
            "employment": {"statuses": [], "raw_text": None},
            "income": {
                "min": None,
                "max": None,
                "period": None,
                "scope": None,
                "raw_text": None,
            },
            "residency": {"locations": [], "raw_text": None},
            "other_requirements": [],
        },
        "benefits": [],
        "requirements": [],
        "application": {
            "start_date": None,
            "deadline": None,
            "process": None,
            "url": None,
        },
        "source": {
            "url": "https://example.gov.ph/programs/example-training",
            "last_verified_at": checked_at,
        },
        "status": "unknown",
        "staging_record_id": 42,
    }


class FakeResponse:
    def __init__(self, data: list[dict]):
        self.data = data


class FakeProgramQuery:
    def __init__(self, rows: list[dict]):
        self.rows = rows
        self.columns: str | None = None
        self.program_id: int | None = None
        self.limit_value: int | None = None

    def select(self, columns: str):
        self.columns = columns
        return self

    def eq(self, field: str, value: int):
        assert field == "id"
        self.program_id = value
        return self

    def limit(self, value: int):
        self.limit_value = value
        return self

    def execute(self):
        rows = self.rows
        if self.program_id is not None:
            rows = [row for row in rows if row["id"] == self.program_id]
        if self.limit_value is not None:
            rows = rows[:self.limit_value]
        return FakeResponse(rows)


class FakeSupabase:
    def __init__(self, rows: list[dict]):
        self.query = FakeProgramQuery(rows)

    def table(self, name: str):
        assert name == "programs"
        return self.query


def test_list_returns_only_valid_public_programs(monkeypatch, caplog):
    valid = public_program_row()
    invalid = public_program_row(program_id=18)
    del invalid["source"]["last_verified_at"]
    fake_supabase = FakeSupabase([valid, invalid])
    monkeypatch.setattr(programs, "supabase", fake_supabase)

    response = programs.get_programs()

    assert len(response) == 1
    assert response[0].id == "17"
    assert response[0].source.last_verified_at.isoformat() == "2026-08-23T10:30:00+00:00"
    assert fake_supabase.query.columns == programs.PUBLIC_PROGRAM_COLUMNS
    assert "staging_record_id" not in response[0].model_dump()
    assert "Excluded 1 invalid stored program row" in caplog.text


def test_partial_nested_values_normalize_to_canonical_dto(monkeypatch):
    partial = public_program_row()
    del partial["eligibility"]["age"]
    del partial["eligibility"]["education"]["raw_text"]
    del partial["eligibility"]["employment"]["raw_text"]
    del partial["eligibility"]["income"]["min"]
    del partial["eligibility"]["income"]["max"]
    del partial["eligibility"]["income"]["period"]
    del partial["eligibility"]["income"]["scope"]
    del partial["eligibility"]["income"]["raw_text"]
    del partial["eligibility"]["residency"]["raw_text"]
    del partial["application"]["start_date"]
    del partial["application"]["deadline"]
    del partial["application"]["process"]
    del partial["application"]["url"]
    monkeypatch.setattr(programs, "supabase", FakeSupabase([partial]))

    response = programs.get_programs()[0]

    assert response.id == "17"
    assert response.eligibility.age.model_dump() == {"min": None, "max": None, "raw_text": None}
    assert response.eligibility.education.raw_text is None
    assert response.eligibility.employment.raw_text is None
    assert response.eligibility.income.model_dump() == {
        "min": None,
        "max": None,
        "period": None,
        "scope": None,
        "raw_text": None,
    }
    assert response.eligibility.residency.raw_text is None
    assert response.application.model_dump() == {
        "start_date": None,
        "deadline": None,
        "process": None,
        "url": None,
    }


def test_detail_returns_public_program_with_string_id(monkeypatch):
    fake_supabase = FakeSupabase([public_program_row()])
    monkeypatch.setattr(programs, "supabase", fake_supabase)

    response = programs.get_program(17)

    assert response.id == "17"
    assert fake_supabase.query.program_id == 17
    assert fake_supabase.query.limit_value == 1
    assert fake_supabase.query.columns == programs.PUBLIC_PROGRAM_COLUMNS


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("url", "not-a-url"),
        ("last_verified_at", "not-a-timestamp"),
    ],
)
def test_invalid_source_values_still_fail_validation(monkeypatch, field, value):
    invalid = public_program_row()
    invalid["source"][field] = value
    fake_supabase = FakeSupabase([invalid])
    monkeypatch.setattr(programs, "supabase", fake_supabase)

    with pytest.raises(HTTPException) as exception:
        programs.get_program(17)

    assert exception.value.status_code == 404
    assert exception.value.detail == "Program not found."


def test_list_and_detail_share_normalization(monkeypatch):
    partial = public_program_row()
    del partial["eligibility"]["age"]
    del partial["application"]["start_date"]
    fake_supabase = FakeSupabase([partial])
    monkeypatch.setattr(programs, "supabase", fake_supabase)

    listed = programs.get_programs()[0]
    detailed = programs.get_program(17)

    assert listed.model_dump() == detailed.model_dump()
