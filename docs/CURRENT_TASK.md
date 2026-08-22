# Current Task

## EXP-01 — Program card and status treatment

Implement reusable opportunity-card variants using local `Program` fixture data.

## Depends on

DES-02 is complete and the frontend production build passes.

## Scope

- Create reusable program/opportunity card variants.
- Use only local fixture data.
- Use the locked tokens and primitives from `docs/DESIGN_TOKENS.md`.
- Do not build a full Results page, API calls, backend integration, or real routing yet.

## Must handle

- Missing provider: show `Provider not specified`; use neutral agency-logo fallback.
- Unknown status: show a neutral `Status unknown` badge; never treat it as open or closed.
- No deadline: show `Deadline not provided`; do not claim there is no deadline.
- Unknown coverage: show `Coverage details unavailable`; do not infer eligibility, monetary value, or nationwide coverage.
- - Source metadata:
  - Render the required canonical source URL and last-verified date.
  - Use them for the source action and source-health label.
  - Do not add a missing-source fixture or UI-only schema override.
- Missing image/logo: use the approved branded fallback components. Do not use external stock images or fabricated agency logos.
- Accessibility: status meaning must not rely only on color.

## Acceptance criteria

- Program-card variants render from fixture data.
- Fixtures cover complete, missing-provider, unknown-status, no-deadline, unknown-coverage.
- No backend files changed.
- No API calls added.
- Production build succeeds.