from app.schemas.matching import UserProfile
from app.services.matching_service import (
    match_age,
    match_location,
    match_education,
    match_category,
)

def run_category_test(
    name,
    preferred_categories,
    program_category,
):
    user = UserProfile(
        preferred_categories=preferred_categories,
    )

    program = {
        "category": program_category,
    }

    result = match_category(user, program)

    print(f"\n{name}")
    print(result.model_dump())


run_category_test(
    "CATEGORY MATCH",
    preferred_categories=["scholarship"],
    program_category="scholarship",
)


run_category_test(
    "CATEGORY MATCH - multiple preferences",
    preferred_categories=[
        "training",
        "scholarship",
    ],
    program_category="scholarship",
)


run_category_test(
    "CATEGORY MATCH - normalization",
    preferred_categories=[
        "financial assistance",
    ],
    program_category="financial_assistance",
)


run_category_test(
    "CATEGORY NO MATCH",
    preferred_categories=["training"],
    program_category="scholarship",
)


run_category_test(
    "CATEGORY UNKNOWN - no preference",
    preferred_categories=[],
    program_category="scholarship",
)


run_category_test(
    "CATEGORY UNKNOWN - missing program category",
    preferred_categories=["scholarship"],
    program_category=None,
)

def run_education_test(
    name,
    user_level,
    program_levels,
):
    user = UserProfile(
        education_level=user_level,
    )

    program = {
        "eligibility": {
            "education": {
                "levels": program_levels,
            }
        }
    }

    result = match_education(user, program)

    print(f"\n{name}")
    print(result.model_dump())


run_education_test(
    "EDUCATION MATCH - incoming first year",
    user_level="incoming_first_year_college",
    program_levels=[
        "incoming_first_year_college",
    ],
)


run_education_test(
    "EDUCATION MATCH - second year",
    user_level="second_year_college",
    program_levels=[
        "incoming_first_year_college",
        "second_year_college",
    ],
)


run_education_test(
    "EDUCATION NO MATCH",
    user_level="third_year_college",
    program_levels=[
        "incoming_first_year_college",
        "second_year_college",
    ],
)


run_education_test(
    "EDUCATION MATCH - TVET alias",
    user_level="vocational",
    program_levels=[
        "tvet",
    ],
)


run_education_test(
    "EDUCATION UNKNOWN - no program levels",
    user_level="second_year_college",
    program_levels=[],
)


run_education_test(
    "EDUCATION UNKNOWN - unknown user level",
    user_level="graduate_school",
    program_levels=[
        "second_year_college",
    ],
)


run_education_test(
    "EDUCATION UNKNOWN - unknown program value",
    user_level="third_year_college",
    program_levels=[
        "second_year_college",
        "future_unknown_level",
    ],
)

def run_location_test(
    name,
    user_location,
    coverage,
    residency,
):
    user = UserProfile(
        location=user_location,
    )

    program = {
        "coverage": coverage,
        "eligibility": {
            "residency": residency,
        },
    }

    result = match_location(user, program)

    print(f"\n{name}")
    print(result.model_dump())


run_location_test(
    "LOCATION MATCH - nationwide",
    user_location="Capiz",
    coverage={
        "type": "nationwide",
        "locations": [],
    },
    residency={},
)


run_location_test(
    "LOCATION MATCH - residency",
    user_location="Capiz",
    coverage={},
    residency={
        "locations": ["Capiz"],
    },
)


run_location_test(
    "LOCATION MATCH - normalized residency",
    user_location="Capiz",
    coverage={},
    residency={
        "locations": ["Province of Capiz"],
    },
)


run_location_test(
    "LOCATION NO MATCH - residency",
    user_location="Manila",
    coverage={
        "type": "nationwide",
    },
    residency={
        "locations": ["Capiz"],
    },
)


run_location_test(
    "LOCATION MATCH - coverage",
    user_location="Cebu",
    coverage={
        "type": "regional",
        "locations": ["Cebu"],
    },
    residency={},
)


run_location_test(
    "LOCATION NO MATCH - coverage",
    user_location="Manila",
    coverage={
        "type": "regional",
        "locations": ["Cebu"],
    },
    residency={},
)


run_location_test(
    "LOCATION UNKNOWN - no location data",
    user_location="Manila",
    coverage={},
    residency={},
)


run_location_test(
    "LOCATION UNKNOWN - no user location",
    user_location=None,
    coverage={
        "type": "nationwide",
    },
    residency={},
)


def run_test(name, user_age, program_age):
    user = UserProfile(age=user_age)

    program = {
        "eligibility": {
            "age": program_age
        }
    }

    result = match_age(user, program)

    print(f"\n{name}")
    print(result.model_dump())


run_test(
    "MATCH",
    user_age=20,
    program_age={
        "min": 18,
        "max": 25,
    },
)

run_test(
    "NO MATCH",
    user_age=30,
    program_age={
        "min": 18,
        "max": 25,
    },
)

run_test(
    "UNKNOWN - no program age",
    user_age=20,
    program_age={},
)

run_test(
    "UNKNOWN - no user age",
    user_age=None,
    program_age={
        "min": 18,
        "max": 25,
    },
)

run_test(
    "MATCH - maximum only",
    user_age=20,
    program_age={
        "max": 25,
    },
)

run_test(
    "NO MATCH - below minimum",
    user_age=17,
    program_age={
        "min": 18,
    },
)