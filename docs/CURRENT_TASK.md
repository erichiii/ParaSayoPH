# Current Task — Backend Public Programs API (INT-01 to INT-03, INT-07)

## Goal

Make the existing ParaSa’yo backend reproducibly runnable and expose a safe public Programs API for later frontend integration.

This is the first backend contract-hardening task. It does **not** begin live frontend integration yet.

## Required reading before any edit

1. `AGENTS.md`
2. `docs/BACKEND_CONTRACT.md`
3. `docs/FRONTEND_BACKEND_INTEGRATION_HANDOFF.md`
4. `schemas/program.v0.1.json` and/or `schemas/program.py`
5. Existing backend routes, schemas, database service, and dependency files

## Scope

### A. Reproducible non-secret local setup (INT-07)

- Add or correct a tracked Python dependency manifest (`requirements.txt` or `pyproject.toml`). Do not guess package versions; infer them from existing imports/project conventions and report assumptions.
- Add `backend/.env.example` containing variable names only. Never put real credentials, example secrets, or copied environment values in it.
- Add concise backend startup documentation: install dependencies, configure local `.env`, run Uvicorn, visit `/health` and `/docs`.
- Do not create or commit a real `.env`.

### B. Safe public Programs API (INT-01 and INT-02)

- Define a strict public response model/DTO derived from the frozen canonical Program contract.
- Replace direct `select("*")` exposure with an allowlisted public projection/serialization.
- Implement `GET /programs/{id}`.
- Return a safe `404` response for a program that does not exist.
- Keep public route paths consistent with the already-existing `GET /programs` path; do not rename it to `/api/programs` without owner approval.
- Preserve canonical handling of null/unknown values. Do not invent providers, deadlines, eligibility values, source authority, or image metadata.

### C. Source transparency fields (INT-03)

- Ensure every returned public Program serializes the canonical source URL and ParaSa’yo check timestamp required by the frozen schema.
- Reject/handle malformed stored rows safely. Never return an invalid public Program simply because it exists in Supabase.
- Do not label a source as “official”; the frontend wording remains “View source.”

## Explicitly out of scope

- No frontend files or frontend fetch/API adapter changes.
- No matcher changes (`POST /api/match`).
- No taxonomy endpoint or taxonomy data changes.
- No scraper, Bright Data, normalization, duplicate-detection, ingest, process, or existing database record changes.
- No destructive Supabase/database operations.
- No source-content scraping or secret handling.
- No deployment, CI, Docker, authentication redesign, or broad refactor.
- Do not change the frozen schema or `BACKEND_CONTRACT.md` without owner approval.

## Required pre-edit report

Before editing, report:

1. Current branch and worktree status; identify unrelated modifications and preserve them.
2. Exact files to change/add.
3. Existing database columns/row shapes relevant to Program serialization.
4. Proposed public DTO and handling for invalid/partial stored data.
5. Dependency/setup gaps; do not install packages or create a real `.env` yet.
6. Validation plan for `/health`, `/docs`, list `200`, detail `200`, and detail `404`.

Wait for owner approval after the report.

## Acceptance criteria

- A fresh developer can follow tracked, non-secret setup instructions to run the server.
- `GET /health` returns `{ "status": "ok" }`.
- Swagger/OpenAPI loads at `/docs`.
- `GET /programs` returns only allowlisted public canonical Program objects—never `select("*")` database rows.
- `GET /programs/{id}` returns one public Program for a valid ID.
- `GET /programs/{id}` returns a clear safe `404` for an unknown ID.
- Every public response handles null/unknown correctly and contains valid source fields per the frozen canonical contract.
- No frontend, matcher, scraper/pipeline, data, schema-contract, or secret changes.
- Relevant tests/manual route checks pass; `git diff --check` passes.
- Agent returns redacted real response examples for list, detail, and 404, plus the commands/checks used.

## Handoff after acceptance

Do not start API-01 yet. First validate the returned JSON against `BACKEND_CONTRACT.md`, then proceed separately to matching and taxonomy alignment (INT-04 to INT-06).
