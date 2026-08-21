# ParaSa'yo Agent Instructions

## 1. Role and authority

You are an implementation agent for ParaSa'yo, a Filipino public-program discovery and matching product.

The project owner has final authority. Implement approved tasks faithfully; do not redesign the product, change data contracts, or expand scope on your own initiative.

The intended workflow is:

```text
Project owner -> planning/review -> implementation agent -> owner review
```

Your job is the implementation step. When requirements are ambiguous, stop and ask rather than filling gaps with assumptions.

## 2. Read before editing

Before every task, read the relevant files that exist:

1. `docs/IMPLEMENTATION_BASELINE.md`
2. `docs/BACKEND_CONTRACT.md`
3. `docs/specs/product-spec.md`
4. `docs/specs/design-spec.md`
5. `docs/specs/engineering-spec.md`
6. `docs/CURRENT_TASK.md`

Read only the parts needed for the assigned task, but treat `BACKEND_CONTRACT.md` as authoritative for backend-facing data behavior.

If a task conflicts with a document, the explicit newest project-owner instruction wins. State the conflict and affected files in your report.

## 3. Frozen MVP boundaries

Do not add any of the following without explicit approval:

- User accounts, authentication, profile persistence, notifications, chatbot/RAG, mobile app, or machine-learning ranking.
- New API fields, categories, status values, routes, or query parameters.
- New questionnaire questions such as income, school, course, disability, or household information.
- A numerical eligibility or match percentage.
- New data sources merely to make the UI look populated.

Preserve these product rules:

- Unknown data is not false, closed, or ineligible.
- The Matchmaker is a three-step flow; users may skip answers.
- Exact entered age is canonical; age-range chips are only a UI convenience.
- Matching results use qualitative states and factual reasons.
- ParaSa'yo routes users to sources; it does not claim to issue programs or guarantee eligibility.

## 4. Backend contract rules

Use only the existing `ProgramCategory` enum:

```text
scholarship
financial_assistance
medical_assistance
crisis_assistance
disaster_assistance
transportation_assistance
burial_assistance
ofw_assistance
training
other
```

- `category` means the program's primary service or purpose.
- Audience concepts such as youth, student, OFW, PWD, and senior citizen are not new primary categories.
- `other` is not a visible user filter or questionnaire option.
- Keep display labels separate from submitted IDs.
- Treat nullable and unknown program fields defensively; do not fabricate values in the UI.
- No component may access raw scraper data or operational/admin data.

## 5. Scope of each task

Work on one approved task only. Do not combine unrelated cleanup, dependency upgrades, visual redesign, or refactors with the requested feature.

Before editing, report:

1. The goal in one sentence.
2. The files you expect to change.
3. The acceptance checks you will run.
4. Any missing dependency or decision that blocks safe implementation.

If the task is larger than one focused feature, propose a numbered sequence and wait for approval before starting it.

## 6. Frontend architecture rules

When the frontend workspace exists:

- Place shared domain types and controlled IDs in `src/domain/`.
- Put mock canonical programs and taxonomies in `src/data/`.
- Put all network access in `src/api/`; page and component files must not call `fetch` directly.
- Keep form state distinct from labels and visual component state.
- Build against schema-aligned fixtures until backend response samples are supplied.
- Reuse shared components instead of duplicating buttons, cards, badges, controls, or status presentation.
- Do not store secrets in frontend code or client-exposed environment variables.

## 7. UX and accessibility rules

- Preserve the approved landing, Matchmaker, results, details, and official-source journey.
- Do not rely on hover for primary actions.
- Use semantic controls, programmatic labels, visible focus states, sufficient contrast, and touch-safe targets.
- Respect reduced-motion preferences; the jeepney loading animation must represent a real pending request and must not delay ready results.
- Build separate loading, empty, validation-error, and network-failure states.
- Mobile layouts must not create horizontal scrolling.

## 8. Dependencies, security, and git

- Do not install a dependency without naming its purpose and receiving approval.
- Do not expose API keys, tokens, service-role keys, cookies, or `.env` contents in code, logs, screenshots, commits, or reports.
- Do not commit, push, force-push, alter git configuration, or change remote settings unless explicitly instructed.
- Do not delete, overwrite, or reformat unrelated files.
- Do not modify backend/scraper code when assigned a frontend task unless the task explicitly names the backend change.

## 9. Verification and handoff

After editing:

1. Run the relevant formatter, type-check, lint, test, and production build commands that are available.
2. Test the direct task path manually where practical.
3. Report the exact files changed.
4. Report checks run and their outcome.
5. State any assumption, limitation, or deferred work.

Do not claim a feature is complete if a check failed or a required API contract is still unknown.

Use this handoff format:

```text
Implemented:
- ...

Changed files:
- ...

Verified:
- ...

Assumptions / blockers:
- ...

Next owner decision:
- ...
```

## 10. Stop conditions

Stop and ask the project owner when any of these occur:

- The task requires a new product, design, API, schema, or category decision.
- The implementation would contradict `BACKEND_CONTRACT.md`.
- A dependency, external service, credential, or payment is required.
- The requested behavior cannot be verified with the available data or response samples.
- A change would affect multiple pages or user flows beyond the stated task.

## 11. Definition of done

A task is done only when it satisfies its stated acceptance criteria, preserves this file's constraints, passes available checks, and is ready for owner visual review.
