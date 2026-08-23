# ParaSa'yo Backend

## Local setup

From `backend/`, create and activate a virtual environment, then install the tracked direct dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

`requirements.txt` lists the supported direct dependency ranges. When committed, `requirements.lock` must record the exact resolution used for local verification and be refreshed intentionally after changing direct dependencies.

Create a local `backend/.env` using `.env.example` as the variable-name template. Obtain the values through the team's approved secret-sharing process; do not commit the file.

Start the API:

```powershell
python -m uvicorn app.main:app --reload
```

The local API is available at `http://127.0.0.1:8000`.

- `GET /health` returns `{ "status": "ok" }`.
- `/docs` provides Swagger/OpenAPI documentation.
- `GET /programs` and `GET /programs/{id}` expose only validated public program fields.

`GET /programs` returns the complete small MVP dataset without pagination. Results are ordered by most recently checked source, then numeric program ID, descending.

Fixture-derived, non-Supabase-backed contract examples are available in `backend/examples/`.

## Public source timestamps

`source.last_verified_at` is read directly from the stored canonical program's existing source object. It represents the ISO-8601 timestamp when ParaSa'yo last checked or processed that source record. The API never creates, replaces, or defaults this timestamp. Rows without a valid timezone-aware timestamp or HTTP/HTTPS source URL are excluded from public responses.
