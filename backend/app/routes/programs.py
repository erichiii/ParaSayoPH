from fastapi import APIRouter

from app.database import supabase

router = APIRouter(
    prefix="/programs",
    tags=["programs"],
)


@router.get("")
def get_programs():
    response = supabase.table("programs").select("*").execute()

    return response.data