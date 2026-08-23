from fastapi import APIRouter, HTTPException

from app.database import supabase
from app.routes.programs import PUBLIC_PROGRAM_COLUMNS, _public_programs
from app.schemas.matching import MatchProfile, MatchResponse, MatchResult
from app.services.matching_service import match_program, select_recommendation


router = APIRouter(prefix="/api/match", tags=["matching"])


MATCH_STATE_ORDER = {"likely_eligible": 0, "uncertain": 1}
PROGRAM_STATUS_ORDER = {"open": 0, "ongoing": 1, "upcoming": 2, "unknown": 3}


@router.post("", response_model=MatchResponse, response_model_exclude_unset=True)
def match_programs(profile: MatchProfile) -> MatchResponse:
    """Match a transient, controlled profile against public canonical programs."""
    try:
        response = (
            supabase.table("programs")
            .select(PUBLIC_PROGRAM_COLUMNS)
            .neq("status", "closed")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to prepare matches.") from exc

    results: list[MatchResult] = []
    for program in _public_programs(response.data or []):
        if program.status == "closed":
            continue
        result = match_program(profile, program)
        if result is not None:
            results.append(result)

    results.sort(
        key=lambda result: (
            MATCH_STATE_ORDER[result.match_state],
            PROGRAM_STATUS_ORDER[result.program.status],
            int(result.program.id),
        )
    )
    recommendation = select_recommendation(results)
    if recommendation is None:
        return MatchResponse(results=results)
    return MatchResponse(results=results, recommendation=recommendation)
