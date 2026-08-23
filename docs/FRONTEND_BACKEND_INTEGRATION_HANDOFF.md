# ParaSa’yo Frontend–Backend Integration Handoff

**Status:** Blocked until the required public API contract is implemented and demonstrated  
**Frontend branch:** `frontend`  
**Scope:** Backend-first MVP; the existing scraper, ingestion, processing, and Supabase pipeline should not be rebuilt for this work.

## Purpose

The frontend is currently complete against typed local fixtures. Before replacing fixtures with live API calls, the backend must expose a small, safe public API that follows `docs/BACKEND_CONTRACT.md`.

This document separates operational pipeline endpoints from browser-facing endpoints, names the responsible member for each action, and states the evidence needed for integration to start.

## Ownership

| Member | Responsibility |
| --- | --- |
| **Backend developer** | Implement and run the public API, public DTOs, matching alignment, taxonomy contract, and operational-route protection. Provide real sample responses. |
| **Scraper / pipeline developer** | Continue supplying raw scraper output and confirm that processed data can populate canonical public fields. Do not expose raw scraper records to the frontend. |
| **Frontend developer (Enzo)** | Keep UI fixture-driven until acceptance evidence exists; validate samples, map the approved public contract in `src/api/`, and test visible states. |
| **Project owner / team** | Approve any intentional change to the frozen contract before implementation. |

## Integration gate

Do **not** start live frontend requests until all items marked **Required before API-01** are accepted.

---

## A. Public Programs API

### INT-01 — Add a single-program detail endpoint

**Owner:** Backend developer  
**Priority:** P0 — Required before API-01

**Issue**

`GET /programs/{id}` does not exist. `backend/app/routes/programs.py` currently exposes only `GET /programs`.

**Why it blocks the frontend**

The frontend has a Program Detail screen at `/programs/:id`. A program selected from Explore or Results needs to retrieve one specific program using its stable ID. Without this endpoint, the detail page can only use fixtures or download/filter the entire list client-side.

**Required implementation**

```http
GET /programs/{id}
```

- Return one public canonical `Program` object for a valid ID.
- Return `404` with a safe error response when no public program exists for that ID.
- Do not return raw scraper payloads, staging references, Supabase internals, or operational columns.

**Acceptance evidence supplied by backend**

1. One real `200` JSON response.
2. One `404` JSON response for a non-existent ID.
3. The exact route visible in local Swagger/OpenAPI (`/docs`).

---

### INT-02 — Make the program list a safe public DTO

**Owner:** Backend developer  
**Priority:** P0 — Required before API-01

**Issue**

`GET /programs` currently uses `select("*")` and returns the Supabase row directly. This makes database implementation fields part of the accidental public API.

**Why it blocks the frontend**

The frontend needs a stable contract. Returning every database column can leak fields such as `raw_record_id`, `staging_record_id`, processing references, or future internal columns. It also bypasses canonical nested-field validation.

**Required implementation**

- Define a backend response model / public DTO based on the frozen canonical `Program` schema.
- Explicitly allowlist only public fields.
- Validate / serialize nested fields (`coverage`, `eligibility`, `application`, `source`) into their canonical shape.
- Keep canonical unknown/null behavior; do not fabricate values.
- Return a deterministic list response.

**Minimum public fields**

```ts
type Program = {
  id: string | number
  title: string
  provider: string | null
  category: ProgramCategory
  description: string | null
  coverage: { type: CoverageType; locations: string[] }
  eligibility: unknown // canonical schema shape, not arbitrary frontend-only fields
  benefits: string[]
  requirements: string[]
  application: { deadline: string | null; /* remaining canonical fields */ }
  source: { url: string; last_verified_at: string }
  status: 'open' | 'ongoing' | 'upcoming' | 'closed' | 'unknown'
}
```

**List behavior to agree and document**

- Pagination: either an explicit MVP limit/offset contract or a documented small dataset exception.
- Filtering/search: optional for API-01. The frontend may filter a small fixture-equivalent result set locally only if the backend confirms this is safe for the hackathon dataset.
- Ordering: define a stable default (for example, most recently checked first), or explicitly state that no order is guaranteed.

**Acceptance evidence supplied by backend**

1. One real `200` list response containing at least two processed records.
2. Confirmation that no internal database/provenance/staging fields appear.
3. Response model shown in `/docs` or documented in `BACKEND_CONTRACT.md`.

---

### INT-03 — Keep source metadata trustworthy and displayable

**Owner:** Backend developer + Scraper/pipeline developer  
**Priority:** P0 — Required before API-01

**Issue**

The frontend relies on `Program.source.url` and `Program.source.last_verified_at` for its Source Transparency panel. The frozen canonical schema treats these as required strings.

**Required implementation**

- Promote only records with valid HTTP/HTTPS source URLs, as the pipeline already intends.
- Serialize `source.url` and `source.last_verified_at` for every public program.
- Define the timestamp meaning consistently: it must mean when ParaSa’yo last checked/processed the source, not an invented provider-update time.
- Do not add an `official` claim unless a separate audited source-authority field is later approved.

**Frontend wording already locked**

- “View source”
- “ParaSa’yo checked {date}”

**Acceptance evidence supplied by backend**

One real program response with a working source URL and valid ISO-8601 `last_verified_at`.

---

## B. Matching API

### INT-04 — Align the match request with the frozen MatchProfile

**Owner:** Backend developer  
**Priority:** P0 — Required before API-01

**Approved contract**

`POST /api/match` accepts the direct frozen `MatchProfile` body. It does not accept legacy income, field-of-study, interest, or arbitrary-attribute fields.

**Required request contract**

```json
{
  "location": "ncr or null",
  "age": "number or null",
  "employment_status": "student or null",
  "education_level": "second_year_college or null",
  "categories_needed": ["training"]
}
```

**Rules**

- All values supplied by the frontend must come from the approved values in INT-06.
- Optional/unknown answers remain `null`; the backend must not infer them.
- Remove or ignore legacy unapproved fields from the public request model.

**Acceptance evidence supplied by backend**

One successful real request and response using the exact fields above.

---

### INT-05 — Return qualitative results, not a score-driven public API

**Owner:** Backend developer  
**Priority:** P0 — Required before API-01

**Approved public response**

**Required public behavior**

- Do not return or require frontend display of `score`, `points`, or `max_points`.
- Do not expose `likely_ineligible` as a user-facing conclusion.
- Return only qualitative match treatment and factual reasons.
- Use the approved frontend mapping:
  - `likely_eligible` → **May be a fit**
  - `uncertain` → **More details needed**
- Omit programs with known explicit conflicts.
- The frontend must not calculate eligibility or ranks itself.

**Approved public response shape**

```json
{
  "results": [
    {
      "program": { "id": "17" },
      "match_state": "likely_eligible",
      "reasons": [
        { "code": "coverage_location_match", "label": "Your location is listed in the program coverage." },
        { "code": "category_selected", "label": "Matches a category you selected." }
      ]
    },
    {
      "program": { "id": "21" },
      "match_state": "uncertain",
      "reasons": [
        { "code": "age_criteria_unavailable", "label": "The published eligibility details do not include age information." }
      ]
    }
  ],
  "recommendation": {
    "program_id": "17",
    "reasons": [
      { "code": "coverage_location_match", "label": "Your location is listed in the program coverage." },
      { "code": "age_within_range", "label": "Your age is within the listed age range." }
    ]
  }
}
```

Closed programs are excluded. The server orders `likely_eligible` before `uncertain`, then `open`, `ongoing`, `upcoming`, `unknown`, then program ID; the frontend preserves this order. `recommendation` is optional and appears only for an open likely-eligible result with two distinct confirmed eligibility groups. No score, points, rank, percentage, profile data, raw data, or operational fields may be returned.

**Acceptance evidence supplied by backend**

1. One real match response containing at least one result.
2. One response demonstrating an `uncertain` result, if data permits.
3. Confirmation that no numeric score/points are returned to the browser.

---

## C. Taxonomies

### INT-06 — Publish controlled values for questionnaire fields

**Owner:** Backend developer; Project owner approves values  
**Priority:** P0 — Required before API-01

**Approved values**

**Controlled values**

1. Regions / locations: `ncr`, `car`, `region_3`, `region_4a`, `region_4b`, `region_6`, `region_7`, `region_10`, `region_11`, `region_12`, `barmm`.
2. Employment statuses: `student`, `employed`, `job_seeker`, `other`.
3. Education levels: `incoming_first_year_college`, `second_year_college`, `third_year_college`, `fourth_year_college`, `tvet`.
4. Matchable categories: only the frozen `ProgramCategory` values that the questionnaire should show; never `other`.

The frontend must replace its provisional fixture values with these controlled IDs before API-01. This task does not connect the frontend to matching.

**Accepted taxonomy source for the MVP**

Either:

- a public `GET /taxonomies` endpoint, or
- a versioned backend-controlled JSON fixture committed beside the backend contract and explicitly approved by the team.

**Example shape**

```json
{
  "regions": [{ "id": "region_4a", "label": "Region IV-A (CALABARZON)" }],
  "employment_statuses": [{ "id": "student", "label": "Student" }],
  "education_levels": [{ "id": "college", "label": "College" }]
}
```

**Frontend action after acceptance**

Replace the provisional EXP-04 local taxonomy, then map only these IDs into `MatchProfile`.

---

## D. Runtime, Security, and Operational Separation

### INT-07 — Provide reproducible local backend startup

**Owner:** Backend developer  
**Priority:** P0 — Required before API-01

**Issue**

The integration audit could not run the backend because FastAPI dependencies and non-secret setup instructions were not available in the shared repository.

**Required implementation / documentation**

- Commit a Python dependency manifest: `requirements.txt` or `pyproject.toml` with lock strategy as appropriate.
- Commit `backend/.env.example` (or documented equivalent) containing variable *names only*, for example:
  ```env
  SUPABASE_URL=
  SUPABASE_KEY=
  ```
- Add concise startup commands and expected base URL, normally `http://127.0.0.1:8000`.
- Never commit a real `.env`, Supabase key, access token, or Bright Data secret.

**Acceptance evidence supplied by backend**

Another teammate can follow the documented steps and reach:

```http
GET /health → { "status": "ok" }
GET /docs → OpenAPI page loads
```

---

### INT-08 — Separate browser-facing APIs from operations

**Owner:** Backend developer  
**Priority:** P1 — Required before deployment/demo; do before exposing a shared URL

**Issue**

`/api/ingest`, `/api/process`, and scrape-run metrics manipulate or expose pipeline operations. They should not be public browser capabilities.

**Required implementation**

- Keep frontend browser usage limited to public programs, matching, and accepted taxonomies.
- Require an internal secret, service authentication, or other deployment-appropriate protection for ingestion and processing routes.
- Change the metrics endpoint if needed so a browser `GET` never writes to the database.

**Note**

The pipeline-health metrics can still be used in a judged demo, but only after the route is deliberately made read-only and safe or placed behind an approved internal/demo boundary.

---

### INT-09 — Verify CORS and error behavior

**Owner:** Backend developer; Frontend developer verifies  
**Priority:** P1 — Required before API-01 is marked complete

**Current positive finding**

`http://localhost:5173` and `http://127.0.0.1:5173` are already allowed in CORS configuration.

**Required check**

- Confirm public endpoints return meaningful non-secret error bodies for invalid IDs, malformed match requests, and database/network failures.
- Confirm CORS preflight and requests succeed from the Vite frontend origin.
- Confirm operational endpoints are not used by frontend code.

---

## E. Frontend Integration Work (after the gate)

### API-01 — Switch typed adapters from fixtures to live endpoints

**Owner:** Frontend developer  
**Starts only when:** INT-01 through INT-07 have passed.

**Frontend changes**

- Add a configurable `VITE_API_BASE_URL` to `.env.example`.
- Keep all network code inside `frontend/src/api/`; page/components must not call `fetch` directly.
- Validate/map the backend public DTO at the adapter boundary.
- Preserve existing loading, empty, error, unknown, and source-transparency UI states.
- Keep a deterministic local fixture fallback only for offline visual development if the team explicitly approves it; it must not mask live API failures.

**Frontend verification**

1. Explore loads real program list.
2. A clicked program opens its real detail response.
3. Matchmaker sends exactly the approved `MatchProfile`.
4. Loading → summary → results uses backend qualitative data only.
5. Back navigation remains entry-aware: Results → Program Detail → Results.
6. Lint, production build, and manual desktop/mobile checks pass.

---

## Final Integration Sign-off Checklist

| Check | Owner | Pass condition |
| --- | --- | --- |
| Public list endpoint | Backend | Real, allowlisted canonical response demonstrated |
| Public detail endpoint | Backend | `200` and `404` demonstrated |
| Source fields | Backend + Pipeline | Every public record has valid URL and check timestamp |
| Matching contract | Backend | Exact MatchProfile accepted; qualitative results returned |
| Taxonomies | Backend + Owner | Controlled IDs/labels approved and delivered |
| Local setup | Backend | Another teammate reaches `/health` and `/docs` without secrets in Git |
| API adapter | Frontend | Live adapters work; no component-level requests |
| UX states | Frontend | loading/empty/error/unknown/source display verified |
| Security boundary | Backend | operational endpoints not exposed to normal browser clients |

## What does *not* need to be redone

- Raw scraper record storage
- Normalization layer
- Basic structural/quality validation
- Duplicate detection and provenance
- Scrape-run tracking
- Existing CORS origins

The task is to put a stable, safe public API boundary on top of the pipeline that already exists.
