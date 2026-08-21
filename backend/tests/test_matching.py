from app.schemas.matching import (
    MatchStatus,
    UserProfile,
)

from app.services.matching_service import (
    match_age,
    match_location,
    match_education,
    match_income,
    match_field_of_study,
    match_category,
    match_interest,
    match_other_requirements,
    match_program,
)


# ============================================================
# AGE TESTS
# ============================================================


def test_age_match():
    user = UserProfile(age=20)

    program = {
        "eligibility": {
            "age": {
                "min": 18,
                "max": 25,
            }
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.MATCH


def test_age_no_match_above_maximum():
    user = UserProfile(age=30)

    program = {
        "eligibility": {
            "age": {
                "min": 18,
                "max": 25,
            }
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.NO_MATCH


def test_age_no_match_below_minimum():
    user = UserProfile(age=17)

    program = {
        "eligibility": {
            "age": {
                "min": 18,
            }
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.NO_MATCH


def test_age_match_maximum_only():
    user = UserProfile(age=20)

    program = {
        "eligibility": {
            "age": {
                "max": 25,
            }
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.MATCH


def test_age_missing_user_age():
    user = UserProfile(age=None)

    program = {
        "eligibility": {
            "age": {
                "min": 18,
                "max": 25,
            }
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.UNKNOWN


def test_age_no_requirement():
    user = UserProfile(age=20)

    program = {
        "eligibility": {
            "age": {}
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.NOT_APPLICABLE


def test_age_scraper_minus_one_is_not_applicable():
    user = UserProfile(age=20)

    program = {
        "eligibility": {
            "age": {
                "min": -1,
                "max": -1,
            }
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.NOT_APPLICABLE


def test_age_scraper_maximum_only():
    """
    Mirrors a scraper result such as BIGAST:
    min = -1
    max = 50
    """

    user = UserProfile(age=45)

    program = {
        "eligibility": {
            "age": {
                "min": -1,
                "max": 50,
            }
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.MATCH


def test_age_scraper_maximum_failure():
    user = UserProfile(age=55)

    program = {
        "eligibility": {
            "age": {
                "min": -1,
                "max": 50,
            }
        }
    }

    result = match_age(user, program)

    assert result.status == MatchStatus.NO_MATCH


# ============================================================
# LOCATION TESTS
# ============================================================


def test_location_nationwide():
    user = UserProfile(
        location="Capiz"
    )

    program = {
        "coverage": {
            "type": "nationwide",
            "locations": ["Philippines"],
        },
        "eligibility": {
            "residency": {
                "locations": [],
            }
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.MATCH


def test_location_nationwide_without_user_location():
    """
    User location is unnecessary when the program is
    explicitly nationwide.
    """

    user = UserProfile(
        location=None
    )

    program = {
        "coverage": {
            "type": "nationwide",
            "locations": ["Philippines"],
        },
        "eligibility": {
            "residency": {
                "locations": [],
            }
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.MATCH


def test_location_residency_match():
    user = UserProfile(
        location="Capiz"
    )

    program = {
        "coverage": {},
        "eligibility": {
            "residency": {
                "locations": ["Capiz"],
            }
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.MATCH


def test_location_normalized_residency_match():
    user = UserProfile(
        location="Capiz"
    )

    program = {
        "coverage": {},
        "eligibility": {
            "residency": {
                "locations": [
                    "Province of Capiz"
                ],
            }
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.MATCH


def test_location_residency_overrides_nationwide():
    """
    Explicit residency requirements have priority over
    general nationwide coverage.
    """

    user = UserProfile(
        location="Manila"
    )

    program = {
        "coverage": {
            "type": "nationwide",
        },
        "eligibility": {
            "residency": {
                "locations": ["Capiz"],
            }
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.NO_MATCH


def test_location_coverage_match():
    user = UserProfile(
        location="Cebu"
    )

    program = {
        "coverage": {
            "type": "regional",
            "locations": ["Cebu"],
        },
        "eligibility": {
            "residency": {},
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.MATCH


def test_location_coverage_no_match():
    user = UserProfile(
        location="Manila"
    )

    program = {
        "coverage": {
            "type": "regional",
            "locations": ["Cebu"],
        },
        "eligibility": {
            "residency": {},
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.NO_MATCH


def test_location_no_restriction():
    user = UserProfile(
        location="Manila"
    )

    program = {
        "coverage": {},
        "eligibility": {
            "residency": {},
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.NOT_APPLICABLE


def test_location_unstructured_residency():
    """
    Mirrors scraper cases where residency.raw_text exists
    but locations[] could not be extracted.
    """

    user = UserProfile(
        location="Manila"
    )

    program = {
        "coverage": {
            "type": "unknown",
            "locations": [],
        },
        "eligibility": {
            "residency": {
                "locations": [],
                "raw_text": (
                    "Must be a resident near a "
                    "participating township."
                ),
            }
        },
    }

    result = match_location(user, program)

    assert result.status == MatchStatus.UNKNOWN


# ============================================================
# EDUCATION TESTS
# ============================================================


def test_education_incoming_first_year_match():
    user = UserProfile(
        education_level="incoming_first_year_college"
    )

    program = {
        "eligibility": {
            "education": {
                "levels": [
                    "incoming_first_year_college"
                ],
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.MATCH


def test_education_second_year_match():
    user = UserProfile(
        education_level="second_year_college"
    )

    program = {
        "eligibility": {
            "education": {
                "levels": [
                    "incoming_first_year_college",
                    "second_year_college",
                ],
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.MATCH


def test_education_no_match():
    user = UserProfile(
        education_level="third_year_college"
    )

    program = {
        "eligibility": {
            "education": {
                "levels": [
                    "incoming_first_year_college",
                    "second_year_college",
                ],
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.NO_MATCH


def test_education_alias():
    user = UserProfile(
        education_level="vocational"
    )

    program = {
        "eligibility": {
            "education": {
                "levels": ["tvet"],
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.MATCH


def test_education_no_requirement():
    """
    Important for non-students using ParaSayoPH.

    No education requirement must NOT cause a rejection.
    """

    user = UserProfile(
        education_level=None
    )

    program = {
        "eligibility": {
            "education": {
                "levels": [],
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.NOT_APPLICABLE


def test_education_unstructured_requirement():
    user = UserProfile(
        education_level="second_year_college"
    )

    program = {
        "eligibility": {
            "education": {
                "levels": [],
                "raw_text": (
                    "Applicants must currently "
                    "be enrolled in college."
                ),
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.UNKNOWN


def test_education_missing_user_information():
    user = UserProfile(
        education_level=None
    )

    program = {
        "eligibility": {
            "education": {
                "levels": [
                    "second_year_college"
                ],
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.UNKNOWN


def test_education_unknown_user_level():
    user = UserProfile(
        education_level="graduate_school"
    )

    program = {
        "eligibility": {
            "education": {
                "levels": [
                    "second_year_college"
                ],
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.UNKNOWN


def test_education_unknown_program_value():
    user = UserProfile(
        education_level="third_year_college"
    )

    program = {
        "eligibility": {
            "education": {
                "levels": [
                    "second_year_college",
                    "future_unknown_level",
                ],
            }
        }
    }

    result = match_education(user, program)

    assert result.status == MatchStatus.UNKNOWN


# ============================================================
# INCOME TESTS
# ============================================================


def test_income_match():
    """
    Example:
    Program allows combined parental annual income
    up to PHP 400,000.
    """

    user = UserProfile(
        income=350000,
        income_period="annual",
        income_scope="parents",
    )

    program = {
        "eligibility": {
            "income": {
                "min": -1,
                "max": 400000,
                "period": "annual",
                "scope": "parents",
            }
        }
    }

    result = match_income(user, program)

    assert result.status == MatchStatus.MATCH


def test_income_above_maximum():
    user = UserProfile(
        income=500000,
        income_period="annual",
        income_scope="parents",
    )

    program = {
        "eligibility": {
            "income": {
                "min": -1,
                "max": 400000,
                "period": "annual",
                "scope": "parents",
            }
        }
    }

    result = match_income(user, program)

    assert result.status == MatchStatus.NO_MATCH


def test_income_no_requirement():
    user = UserProfile(
        income=300000,
        income_period="annual",
        income_scope="family",
    )

    program = {
        "eligibility": {
            "income": {
                "min": -1,
                "max": -1,
            }
        }
    }

    result = match_income(user, program)

    assert result.status == MatchStatus.NOT_APPLICABLE


def test_income_missing_user_income():
    user = UserProfile(
        income=None,
        income_period="annual",
        income_scope="parents",
    )

    program = {
        "eligibility": {
            "income": {
                "min": -1,
                "max": 400000,
                "period": "annual",
                "scope": "parents",
            }
        }
    }

    result = match_income(user, program)

    assert result.status == MatchStatus.UNKNOWN


def test_income_period_mismatch():
    user = UserProfile(
        income=30000,
        income_period="monthly",
        income_scope="parents",
    )

    program = {
        "eligibility": {
            "income": {
                "min": -1,
                "max": 400000,
                "period": "annual",
                "scope": "parents",
            }
        }
    }

    result = match_income(user, program)

    assert result.status == MatchStatus.UNKNOWN


def test_income_scope_mismatch():
    user = UserProfile(
        income=300000,
        income_period="annual",
        income_scope="individual",
    )

    program = {
        "eligibility": {
            "income": {
                "min": -1,
                "max": 400000,
                "period": "annual",
                "scope": "parents",
            }
        }
    }

    result = match_income(user, program)

    assert result.status == MatchStatus.UNKNOWN


# ============================================================
# FIELD OF STUDY TESTS
# ============================================================


def test_field_of_study_match():
    user = UserProfile(
        field_of_study="accountancy"
    )

    program = {
        "eligibility": {
            "fields": {
                "categories": [
                    "business_management"
                ],
                "programs": [
                    "accountancy",
                    "business_administration",
                ],
            }
        }
    }

    result = match_field_of_study(
        user,
        program,
    )

    assert result.status == MatchStatus.MATCH


def test_field_of_study_normalization():
    user = UserProfile(
        field_of_study="Information Technology"
    )

    program = {
        "eligibility": {
            "fields": {
                "categories": [
                    "technology"
                ],
                "programs": [
                    "information_technology",
                    "computer_science",
                ],
            }
        }
    }

    result = match_field_of_study(
        user,
        program,
    )

    assert result.status == MatchStatus.MATCH


def test_field_of_study_no_match():
    user = UserProfile(
        field_of_study="nursing"
    )

    program = {
        "eligibility": {
            "fields": {
                "categories": [
                    "business_management",
                    "engineering",
                ],
                "programs": [
                    "accountancy",
                    "industrial_engineering",
                ],
            }
        }
    }

    result = match_field_of_study(
        user,
        program,
    )

    assert result.status == MatchStatus.NO_MATCH


def test_field_of_study_missing_user_course():
    user = UserProfile(
        field_of_study=None
    )

    program = {
        "eligibility": {
            "fields": {
                "categories": [
                    "technology"
                ],
                "programs": [
                    "information_technology"
                ],
            }
        }
    }

    result = match_field_of_study(
        user,
        program,
    )

    assert result.status == MatchStatus.UNKNOWN


def test_field_of_study_no_requirement():
    user = UserProfile(
        field_of_study=None
    )

    program = {
        "eligibility": {
            "fields": {
                "categories": [],
                "programs": [],
            }
        }
    }

    result = match_field_of_study(
        user,
        program,
    )

    assert result.status == MatchStatus.NOT_APPLICABLE


# ============================================================
# OTHER REQUIREMENTS TESTS
# ============================================================


def test_other_requirements_exist():
    user = UserProfile()

    program = {
        "eligibility": {
            "other_requirements": [
                "Must be a Filipino citizen.",
                "Must have good moral character.",
            ]
        }
    }

    result = match_other_requirements(
        user,
        program,
    )

    assert result.status == MatchStatus.UNKNOWN


def test_other_requirements_empty():
    user = UserProfile()

    program = {
        "eligibility": {
            "other_requirements": []
        }
    }

    result = match_other_requirements(
        user,
        program,
    )

    assert result.status == MatchStatus.NOT_APPLICABLE


# ============================================================
# CATEGORY TESTS
# ============================================================


def test_category_match():
    user = UserProfile(
        preferred_categories=[
            "scholarship"
        ]
    )

    program = {
        "category": "scholarship"
    }

    result = match_category(
        user,
        program,
    )

    assert result.status == MatchStatus.MATCH


def test_category_multiple_preferences():
    user = UserProfile(
        preferred_categories=[
            "training",
            "scholarship",
        ]
    )

    program = {
        "category": "scholarship"
    }

    result = match_category(
        user,
        program,
    )

    assert result.status == MatchStatus.MATCH


def test_category_normalization():
    user = UserProfile(
        preferred_categories=[
            "financial assistance"
        ]
    )

    program = {
        "category": "financial_assistance"
    }

    result = match_category(
        user,
        program,
    )

    assert result.status == MatchStatus.MATCH


def test_category_no_match():
    user = UserProfile(
        preferred_categories=[
            "training"
        ]
    )

    program = {
        "category": "scholarship"
    }

    result = match_category(
        user,
        program,
    )

    assert result.status == MatchStatus.NO_MATCH


def test_category_missing_preference():
    user = UserProfile(
        preferred_categories=[]
    )

    program = {
        "category": "scholarship"
    }

    result = match_category(
        user,
        program,
    )

    assert result.status == MatchStatus.UNKNOWN


# ============================================================
# INTEREST TESTS
# ============================================================


def test_interest_match():
    user = UserProfile(
        interests=["technology"]
    )

    program = {
        "eligibility": {
            "fields": {
                "categories": [
                    "technology",
                    "engineering",
                ]
            }
        }
    }

    result = match_interest(
        user,
        program,
    )

    assert result.status == MatchStatus.MATCH


def test_interest_no_match():
    user = UserProfile(
        interests=["health_sciences"]
    )

    program = {
        "eligibility": {
            "fields": {
                "categories": [
                    "technology",
                    "engineering",
                ]
            }
        }
    }

    result = match_interest(
        user,
        program,
    )

    assert result.status == MatchStatus.NO_MATCH


def test_interest_not_provided():
    user = UserProfile(
        interests=[]
    )

    program = {
        "eligibility": {
            "fields": {
                "categories": [
                    "technology"
                ]
            }
        }
    }

    result = match_interest(
        user,
        program,
    )

    assert result.status == MatchStatus.NOT_APPLICABLE


# ============================================================
# COMPLETE MATCH_PROGRAM TESTS
# ============================================================


def test_match_program_eligible():
    """
    Program contains only requirements that can be
    deterministically verified.
    """

    user = UserProfile(
        age=20,
        location="Manila",
        education_level="second_year_college",
        field_of_study="information_technology",
        income=300000,
        income_period="annual",
        income_scope="family",
        preferred_categories=["scholarship"],
        interests=["technology"],
    )

    program = {
        "id": 1,
        "category": "scholarship",

        "coverage": {
            "type": "nationwide",
            "locations": [
                "Philippines"
            ],
        },

        "eligibility": {
            "age": {
                "min": 18,
                "max": 25,
            },

            "education": {
                "levels": [
                    "second_year_college"
                ],
            },

            "income": {
                "min": -1,
                "max": 400000,
                "period": "annual",
                "scope": "family",
            },

            "residency": {
                "locations": [],
            },

            "fields": {
                "categories": [
                    "technology"
                ],
                "programs": [
                    "information_technology",
                    "computer_science",
                ],
            },

            "other_requirements": [],
        },
    }

    result = match_program(
        user,
        program,
    )

    assert result.program_id == 1

    assert result.eligible is True

    assert result.score == 100

    assert len(result.conflicts) == 0

    assert len(result.uncertain) == 0


def test_match_program_ineligible():
    """
    User matches the program's relevance perfectly but fails
    a mandatory income requirement.

    This proves relevance score != eligibility.
    """

    user = UserProfile(
        age=20,
        location="Manila",
        education_level="second_year_college",
        field_of_study="information_technology",

        # Above program maximum.
        income=500000,
        income_period="annual",
        income_scope="family",

        preferred_categories=["scholarship"],
        interests=["technology"],
    )

    program = {
        "id": 2,
        "category": "scholarship",

        "coverage": {
            "type": "nationwide",
        },

        "eligibility": {
            "age": {
                "min": 18,
                "max": 25,
            },

            "education": {
                "levels": [
                    "second_year_college"
                ],
            },

            "income": {
                "min": -1,
                "max": 400000,
                "period": "annual",
                "scope": "family",
            },

            "residency": {
                "locations": [],
            },

            "fields": {
                "categories": [
                    "technology"
                ],
                "programs": [
                    "information_technology"
                ],
            },

            "other_requirements": [],
        },
    }

    result = match_program(
        user,
        program,
    )

    assert result.eligible is False

    # Relevance can still be perfect.
    assert result.score == 100

    assert len(result.conflicts) >= 1


def test_match_program_uncertain():
    """
    Unknown additional requirements should prevent the engine
    from claiming confirmed eligibility.
    """

    user = UserProfile(
        age=20,
        preferred_categories=[
            "scholarship"
        ],
    )

    program = {
        "id": 3,

        "category": "scholarship",

        "coverage": {
            "type": "nationwide",
        },

        "eligibility": {
            "age": {
                "min": 18,
                "max": 25,
            },

            "education": {},

            "income": {
                "min": -1,
                "max": -1,
            },

            "residency": {
                "locations": [],
            },

            "fields": {
                "categories": [],
                "programs": [],
            },

            "other_requirements": [
                "Must be a Filipino citizen."
            ],
        },
    }

    result = match_program(
        user,
        program,
    )

    assert result.eligible is None

    assert len(result.uncertain) >= 1


def test_non_student_program_does_not_require_education():
    """
    Critical ParaSayoPH behavior:

    A person who is not studying must not be rejected from a
    program that has no education requirement.
    """

    user = UserProfile(
        age=68,
        location="Manila",
        education_level=None,
        field_of_study=None,
        preferred_categories=[
            "financial_assistance"
        ],
    )

    program = {
        "id": 4,

        "category": "financial_assistance",

        "coverage": {
            "type": "nationwide",
        },

        "eligibility": {
            "age": {
                "min": 60,
                "max": -1,
            },

            "education": {},

            "income": {
                "min": -1,
                "max": -1,
            },

            "residency": {
                "locations": [],
            },

            "fields": {
                "categories": [],
                "programs": [],
            },

            "other_requirements": [],
        },
    }

    result = match_program(
        user,
        program,
    )

    education_result = next(
        criterion
        for criterion in result.criteria
        if criterion.criterion == "education"
    )

    field_result = next(
        criterion
        for criterion in result.criteria
        if criterion.criterion == "field_of_study"
    )

    assert (
        education_result.status
        == MatchStatus.NOT_APPLICABLE
    )

    assert (
        field_result.status
        == MatchStatus.NOT_APPLICABLE
    )

    assert result.eligible is True

    assert result.score == 100


# ============================================================
# VALIDATION / ERROR TESTS
# ============================================================


def test_match_program_requires_program_id():
    user = UserProfile()

    program = {
        "category": "scholarship",
        "eligibility": {},
    }

    try:
        match_program(
            user,
            program,
        )

        assert False, (
            "match_program() should reject a program "
            "without an integer ID."
        )

    except ValueError:
        pass