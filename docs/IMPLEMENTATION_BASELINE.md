# ParaSa'yo Implementation Baseline

**Status:** Frozen MVP baseline  
**Purpose:** Give implementation agents one concise, code-facing source of truth before they modify the repository.  
**Authority:** An explicit project-owner instruction overrides this file. Record any resulting change in the relevant specification and contract.

## 1. Product in one sentence

ParaSa'yo helps Filipinos discover legitimate public opportunities and assistance programs, explains why a program may fit their optional profile, and routes them to an official source without claiming guaranteed eligibility.

## 2. Frozen MVP scope

The MVP delivers:

- A landing page with paths to Explore and Start Matching.
- Browse/search discovery without requiring a profile.
- A three-step optional Matchmaker:
  1. Who & Where — region and exact age;
  2. Background & Study — current status and education level;
  3. Support Needed — one or more supported categories.
- A brief Jeepney matching/loading state only during a real pending request.
- Personalized results with qualitative reasons and editable profile context.
- Program detail pages with benefits, eligibility, requirements, coverage, status/dates when known, and a source/application action.
- Public-safe source-health visualization only after the core discovery and matching flow works.

The first demonstration goal is one verified vertical slice:

```text
Public source -> Bright Data scraper -> normalized canonical record -> backend API -> ParaSa'yo UI
```

## 3. Explicitly out of scope

Do not add any of the following unless the project owner approves a new task and contract change:

- Authentication, accounts, saved profiles, or profile persistence.
- Chatbot, RAG, notifications, native mobile app, or machine-learning ranking.
- New questionnaire fields such as income, school, course, disability, household, skills, or special status.
- New program categories or status values.
- Numerical match/eligibility percentages.
- Extra data sources purely to make the UI look more complete.

## 4. Backend-first data rules

`docs/BACKEND_CONTRACT.md` is authoritative for data behavior. The frozen program category values are:

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

Rules:

- `category` describes the program's primary service or purpose.
- Youth, student, OFW, PWD, and similar ideas are audience/eligibility information, not new primary categories.
- `other` is a backend fallback and must not be shown as a questionnaire choice or standard user filter.
- Use only canonical, validated public program records.
- Preserve `null` as unknown and `[]` as no extracted list values. Never invent missing data.
- `status: unknown` is a valid status and must not be rendered as open or ongoing.
- Exact entered age is canonical; age-range chips are only a user-interface convenience.

## 5. Matching and trust behavior

- Matching is qualitative, not a percentage score.
- Use supported states such as `likely_eligible`, `uncertain`, and `known_conflict` only when evidence supports them.
- Missing profile or program information produces uncertainty, never a known conflict.
- Reasons must be factual and traceable to submitted profile data plus canonical program data.
- ParaSa'yo is an aggregator. It does not issue programs and does not guarantee eligibility or approval.
- Use an official application action only when the backend has verified an official destination. Otherwise label the action as an information/source visit accurately.

## 6. Approved frontend setup

The frontend lives in `frontend/` and uses:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

Keep the initial frontend dependency set small. Do not add a UI kit, state-management library, icon library, form library, or API client library unless a later approved task requires it.

Initial structure:

```text
frontend/
  src/
    app/
    pages/
    components/
      ui/
      programs/
      matchmaker/
    domain/
    data/
    api/
    styles/
    assets/
  .env.example
```

All network access belongs in `src/api/`. Pages and components must not call `fetch` directly. Until backend response samples are supplied, use fixtures that conform to `BACKEND_CONTRACT.md`.

`VITE_API_BASE_URL` may hold a non-secret public API base URL. Do not put credentials, service keys, scraper tokens, or database secrets in any frontend environment file.

## 7. Implementation sequence

Agents work in this order and complete each stage before beginning the next:

1. **Workspace setup** — frontend scaffold, styling, routing, folder structure, development/build verification.
2. **Domain fixtures** — shared TypeScript types and mock canonical program/taxonomy data.
3. **Shared UI** — buttons, inputs, cards, chips, badges, status treatment, layout primitives, and design tokens.
4. **Screen shells** — Landing, Explore, Matchmaker, Results, and Program Detail using fixtures.
5. **Interaction states** — questionnaire state, profile editing, loading, empty, validation-error, and network-failure states.
6. **API integration** — only after Backend provides actual list, detail, match, and taxonomy samples.
7. **Polish and demo** — responsive QA, accessibility, source-health visualization, screenshots, and deployment readiness.

## 8. Current open handoffs

These are intentionally open. Agents must not invent answers.

| Item | Required owner/input before integration |
|---|---|
| Exact public API routes and wrappers | Backend owner supplies current API documentation or response samples. |
| Region, employment, and education taxonomy IDs | Backend owner supplies controlled taxonomy values. |
| Program list/detail/match examples | Backend owner supplies one real public response for each. |
| Final colors, spacing, radii, shadows, and responsive measurements | Project owner supplies approved design screens/tokens. |
| Official-source authority/action metadata | Backend owner adds/validates it before the frontend claims an action is official. |

## 9. Quality gates

Every implementation task must:

1. Read `AGENTS.md`, this file, `BACKEND_CONTRACT.md`, and `CURRENT_TASK.md`.
2. State a small plan and affected files before editing.
3. Avoid unrelated cleanup or architecture changes.
4. Run available formatting, type-check, lint, test, and production-build checks.
5. Report exact changed files, checks run, blockers, and assumptions.
6. Wait for owner visual review before beginning the next feature.

## 10. Document hierarchy

For implementation behavior, use this order:

1. Explicit newest project-owner instruction.
2. `docs/CURRENT_TASK.md` for the active scope.
3. `docs/BACKEND_CONTRACT.md` for data/schema behavior.
4. This implementation baseline.
5. Product, Design, and Engineering specifications for detailed rationale and acceptance criteria.

If two documents disagree, report the conflict instead of choosing silently.
