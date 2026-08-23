from fastapi import APIRouter, HTTPException

from app.database import supabase
from app.routes.programs import PUBLIC_PROGRAM_COLUMNS, _public_programs
from app.schemas.matching import MatchProfile, MatchResponse, MatchResult
from app.services.matching_service import match_program


router = APIRouter(prefix="/api/match", tags=["matching"])


@router.post("", response_model=MatchResponse)
def match_programs(profile: MatchProfile) -> MatchResponse:
    """Match a transient, controlled profile against public canonical programs."""
    try:
        response = supabase.table("programs").select(PUBLIC_PROGRAM_COLUMNS).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to prepare matches.") from exc

    results: list[MatchResult] = []
    for program in _public_programs(response.data or []):
        result = match_program(profile, program)
        if result is not None:
            results.append(result)

    return MatchResponse(results=results)
