# Current Task - MCH-03 Matching Availability and Recommendation

## Goal

Improve live qualitative matching by excluding closed programs, applying deterministic server ordering, and returning an optional evidence-backed recommendation.

## Scope

- `POST /api/match` excludes `status: closed` programs entirely.
- Results are ordered server-side by qualitative state, program status, then numeric program ID.
- The response may include `recommendation` only for an open `likely_eligible` program with at least two distinct confirmed structured eligibility groups and no unresolved relevant requirement.
- The frontend validates the optional recommendation, preserves server result order, and renders the recommended result once under “Recommended based on confirmed details”.
- The frontend retains all existing pending, empty, validation, failure, and uncertainty-only states.

## Constraints

- Do not expose or calculate score, rank, percentage, top/best wording, or eligibility guarantees.
- Do not add frontend dependencies, profile persistence, backend routes, taxonomy values, database changes, RLS changes, or environment changes.
- Use only public validated Program data and the existing approved MatchProfile contract.
- Do not change Explore or live Program Detail fetching behavior.

## Acceptance Criteria

- Closed programs never appear in match results.
- Results use the approved deterministic qualitative ordering.
- Recommendation is omitted when no program reaches the evidence threshold.
- Recommendation, when present, is factual, validated, open, likely eligible, and appears once only in the frontend.
- Backend tests, frontend lint/build, diff check, and live validation pass.
