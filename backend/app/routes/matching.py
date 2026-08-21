from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.database import supabase
from app.schemas.matching import (
    ProgramMatchResult,
    ProgramMatchStatus,
    UserProfile,
)
from app.services.matching_service import (
    match_program,
)


router = APIRouter(
    prefix="/api/match",
    tags=["matching"],
)


def _match_status_sort_priority(
    result: ProgramMatchResult,
) -> int:
    """
    Frontend recommendation order:

    0 -> likely eligible
    1 -> needs verification
    2 -> likely ineligible

    Likely ineligible opportunities remain in the response.
    They are ranked lower rather than removed.
    """

    if (
        result.match_status
        == ProgramMatchStatus.LIKELY_ELIGIBLE
    ):
        return 0

    if (
        result.match_status
        == ProgramMatchStatus.NEEDS_VERIFICATION
    ):
        return 1

    return 2

def _sort_results(
    results: list[ProgramMatchResult],
) -> list[ProgramMatchResult]:
    """
    Rank programs by:

    1. Eligibility status
    2. Relevance score

    Confirmed eligible programs appear first.

    Potentially eligible programs appear next.

    Programs with a known eligibility conflict appear last.

    Within each eligibility group, programs with higher
    relevance scores appear first.
    """

    return sorted(
        results,
        key=lambda result: (
            _match_status_sort_priority(result),
            -result.score,
        ),
    )


@router.post(
    "",
    response_model=list[ProgramMatchResult],
)
def match_programs(
    user: UserProfile,
):
    """
    Match a user profile against currently available programs.

    The endpoint:

    1. Retrieves non-closed programs from Supabase.
    2. Runs the deterministic matcher against each program.
    3. Calculates eligibility and relevance.
    4. Sorts the results by eligibility and relevance.
    5. Returns explainable matching results.

    User profiles are not persisted for the MVP.
    """

    try:
        response = (
            supabase
            .table("programs")
            .select("*")
            .neq("status", "closed")
            .execute()
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve programs.",
        ) from exc

    programs = response.data or []

    results: list[ProgramMatchResult] = []

    for program in programs:
        if not isinstance(program, dict):
            continue

        try:
            result = match_program(
                user,
                program,
            )

            results.append(result)

        except ValueError:
            # A malformed program should not make the entire
            # recommendation request fail.
            continue

        except Exception:
            # Defensive isolation:
            # one malformed database record should not prevent
            # valid programs from being matched.
            continue

    return _sort_results(results)