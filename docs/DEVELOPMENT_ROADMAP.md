# ParaSa'yo Frontend Development Roadmap

**Status:** Active execution plan  
**Use with:** `AGENTS.md`, `IMPLEMENTATION_BASELINE.md`, `BACKEND_CONTRACT.md`, and `CURRENT_TASK.md`  
**Goal:** Complete the frontend in dependency order, with one small owner-approved agent task at a time.

## 1. How work moves

Do not ask an implementation agent to “build ParaSa'yo.” Give it a task ID from this roadmap.

Every task follows the same gate:

1. Update `docs/CURRENT_TASK.md` with the task ID, scope, acceptance criteria, and prohibited changes.
2. Ask the agent for its plan only. It must name commands, files, dependencies, checks, assumptions, and blockers.
3. Approve the plan or correct it.
4. Ask the agent to execute exactly that plan.
5. Review its report and the running page/build result.
6. Mark the task complete, then copy the next task into `CURRENT_TASK.md`.

Do not start a later task while the current task has an unresolved build failure, visual defect, or contract question.

## 2. Current state

`SETUP-01` is reported complete:

- `frontend/` is initialized with React, TypeScript, Vite, Tailwind CSS, and React Router.
- The required source directories and `.env.example` exist.
- There are no pages, routes, API calls, or product features yet.

Before marking it complete in git, confirm locally that `npm run build` succeeds from `frontend/` and that no backend/schema file changed.

## 3. Stage 0 - Documentation and repository hygiene

### DOC-01 - Make agent context paths valid

**Goal:** Ensure every file named by `AGENTS.md` exists at the exact documented path.

**Required checks:**

- Rename `docs/CUURENT_TASK.md` to `docs/CURRENT_TASK.md` if the typo still exists.
- Place the frozen `BACKEND_CONTRACT.md` and `IMPLEMENTATION_BASELINE.md` in `docs/`.
- Place clean Markdown specifications in `docs/specs/` and ensure their filenames match `AGENTS.md`, or update `AGENTS.md` to match the chosen filenames.
- Remove remaining split Markdown tables from Product and Design specifications before asking agents to rely on them.
- Keep `schemas/program.v0.1.json` as the canonical schema source; the Python schema files must remain implementation representations, not competing contract owners.

**Done when:** an agent can read every required context file without a missing-path error.

## 4. Stage 1 - Frontend foundation

These tasks use no real backend requests and no final visual design decisions.

### FND-01 - Verify workspace setup

**Depends on:** SETUP-01  
**Task:** Inspect the scaffold, remove default Vite demonstration UI, confirm Tailwind is applied, and add only the minimal application entry styling needed for a clean blank app shell.

**Acceptance criteria:**

- Development server starts.
- Production build succeeds.
- No routes, API calls, product pages, or backend changes.
- No unapproved dependencies.

### FND-02 - Create frontend domain types and taxonomy fixtures

**Depends on:** FND-01  
**Task:** Add TypeScript types that mirror the frozen public portions of `program.v0.1`, plus controlled fixture labels for the existing category and status values.

**Create or update only:**

```text
src/domain/program.ts
src/domain/profile.ts
src/domain/matching.ts
src/data/taxonomies.ts
src/data/mockPrograms.ts
```

**Rules:**

- Use only the frozen category/status values in `BACKEND_CONTRACT.md`.
- Mark fixtures as local/demo data; do not pretend they are scraped or official programs.
- Support null, unknown, and empty-array data states in the types.
- Do not invent backend endpoint fields.

**Acceptance criteria:**

- TypeScript can represent card, detail, and match-result data.
- Fixtures include at least one unknown/missing-data case.
- Production build succeeds.

### FND-03 - Add a fixture-backed API boundary

**Depends on:** FND-02  
**Task:** Create the only data-access layer the frontend will use. It returns fixture data now and is designed to be replaced by backend calls later.

**Create or update only:**

```text
src/api/programs.ts
src/api/matches.ts
src/api/types.ts
```

**Acceptance criteria:**

- No page/component calls `fetch` directly.
- Program list, program detail, and match functions return typed fixture data.
- A simulated delay/failure is optional only if it does not distort the public contract.
- Production build succeeds.

### FND-04 - Add application routes and a neutral shell

**Depends on:** FND-03  
**Task:** Add route definitions and minimal placeholder page components only.

**Required routes:**

```text
/
/explore
/matchmaker
/results
/programs/:id
```

**Acceptance criteria:**

- Every route renders without an error.
- Unknown routes have a basic not-found state.
- No page contains final visual design or real data integration yet.
- Production build succeeds.

## 5. Stage 2 - Design lock and shared interface

Do not start this stage until approved visual screens or explicit design tokens are available. The written Design Specification defines behavior, but it does not yet lock all production measurements.

### DES-01 - Record final design inputs

**Owner task, not an agent design task:** provide approved page references for Landing, Matchmaker, Results, Program Detail, and mobile behavior. Record exact color, typography, spacing, radius, shadow, and breakpoint tokens in the Design Specification or a dedicated token file.

### DES-02 - Implement design tokens and primitives

**Depends on:** DES-01  
**Task:** Build reusable visual primitives, not full pages.

**Expected components:**

```text
Button
TextInput
Select
Chip
RadioCard
StatusBadge
ProgramCard shell
PageContainer
InlineInfoCallout
```

**Acceptance criteria:**

- Components follow approved tokens.
- Keyboard focus, disabled, selected, error, and loading states are visible where applicable.
- Controls have labels and touch-safe sizing.
- Components contain no program-specific business logic.

## 6. Stage 3 - Product experiences with fixtures

Build the data-heavy experiences before connecting real APIs. This prevents backend timing from blocking visual/product work.

### EXP-01 - Program card and status treatment

**Depends on:** DES-02  
**Task:** Implement reusable opportunity-card variants using `Program` fixture data.

**Must handle:** missing provider, unknown status, no deadline, unknown coverage, and source metadata.

### EXP-02 - Program detail page

**Depends on:** EXP-01  
**Task:** Build detail hierarchy: title/provider, benefits, why it may fit, eligibility, dates/status, coverage, requirements, application/source action, and freshness.

**Rule:** Never render a missing value as a positive claim. CTA copy must be truthful to the available source/application URL.

### EXP-03 - Explore page

**Depends on:** EXP-01  
**Task:** Build fixture-backed browse/search/category/status filtering and empty state.

**Rule:** `other` is not a standard visible filter. Do not infer official status from the URL.

### EXP-04 - Matchmaker questionnaire

**Depends on:** DES-02  
**Task:** Build the three-step optional questionnaire with canonical local form state.

**Must include:** exact-age input, skip behavior, selectable status/education/category controls, progress, back/continue behavior, and validation that distinguishes invalid from skipped.

**Do not include:** income, course, school, accounts, persistence, or a review page.

### EXP-05 - Results and editable profile context

**Depends on:** EXP-01, EXP-04  
**Task:** Build fixture-backed results, qualitative reason display, uncertainty information, profile pills, and local profile refinement.

**Rule:** Show the Jeepney loading state only for a real/simulated pending match operation; do not delay a ready result for decoration.

### EXP-06 - Landing page

**Depends on:** DES-01  
**Task:** Implement the approved final landing screen, including responsive navigation and links to Explore and Matchmaker.

**Rule:** Keep Filipino identity subtle and functional; do not introduce unapproved motifs or stock-photo direction.

## 7. Stage 4 - Real backend integration

Do not begin until Backend gives one real public response for each required endpoint and the accepted taxonomy values.

### API-01 - Taxonomy and program browse/detail integration

**Depends on:** backend taxonomy, list, and detail samples  
**Task:** Replace fixture implementations inside `src/api/` only. Preserve the component contracts created in Stages 1–3.

### API-02 - Match integration

**Depends on:** a real match request/response sample, including skipped values  
**Task:** Connect the Matchmaker and Results pages through `src/api/matches.ts`.

**Must handle:** pending, success, no results, validation failure, and network failure as separate states.

### API-03 - Source action verification

**Depends on:** backend public authority/action metadata  
**Task:** Use backend-provided CTA/action data. Do not infer “official” from a URL client-side.

## 8. Stage 5 - Quality, demo, and release

### QA-01 - Responsive and accessibility pass

Test every core route at mobile and desktop widths. Check keyboard-only navigation, labels, focus visibility, contrast, reduced motion, and no horizontal overflow.

### QA-02 - Empty, error, and uncertainty pass

Test missing provider, unknown status, missing deadline, unknown coverage, partial profile, no matches, and request failure.

### DEMO-01 - Source-health visualization

Build only after the core consumer flow works. Use public-safe aggregated data; do not expose raw records, credentials, or admin operations.

### DEMO-02 - Demo readiness

Prepare a stable demo profile, verified example programs, screenshots, and the full source -> scraper -> canonical data -> matching -> official-source story.

## 9. Current-task template

Copy this exact structure into `docs/CURRENT_TASK.md` for every task:

```md
# Current Task

**Task ID:** FND-02

## Goal

Create frontend domain types and schema-aligned fixtures.

## Allowed changes

- `frontend/src/domain/**`
- `frontend/src/data/**`

## Do not change

- `backend/**`
- `schemas/**`
- `docs/**`
- Dependencies, routing, pages, or API calls

## Acceptance criteria

- Types match `docs/BACKEND_CONTRACT.md`.
- Fixtures use only frozen category and status values.
- At least one fixture exercises unknown/missing data.
- `npm run build` succeeds from `frontend/`.
```

## 10. Agent prompt template

Use this for every roadmap task:

```text
Read AGENTS.md, docs/IMPLEMENTATION_BASELINE.md, docs/BACKEND_CONTRACT.md,
and docs/CURRENT_TASK.md.

Follow the active task exactly. Before editing, reply only with:
1. planned commands;
2. files to change;
3. dependencies required, if any;
4. verification commands;
5. assumptions or blockers.

Wait for approval before editing.
```

After approval:

```text
Approved. Execute the plan exactly as proposed. Do not expand the task.
Run all planned checks and report changed files, verification results,
assumptions, blockers, and the next roadmap task ID. Do not commit or push.
```

## 11. Next action

Complete `DOC-01` if the documentation paths still need cleanup. Otherwise, copy `FND-01` into `docs/CURRENT_TASK.md`; then use the planning prompt in Section 10.
