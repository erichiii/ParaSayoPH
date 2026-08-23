from app.database import supabase

response = (
    supabase
    .table("programs")
    .select("*")
    .limit(5)
    .execute()
)

print(response.data)