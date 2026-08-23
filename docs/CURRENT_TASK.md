# Current Task

## EXP-05 — Matching feedback, summary, and Results page

**Depends on:** EXP-04 is owner-approved complete; DES-05 desktop references for Loading, Match Summary, and Results are owner-approved complete.

**Design/UX sources:**

1. `docs/DESIGN_TOKENS.md` — global ParaSa'yo visual system.
2. `docs/BACKEND_CONTRACT.md` — authoritative data, match, source, and status behavior.
3. `docs/Matching_Feedback.md` — matching transition and summary rationale. Apply the contract corrections in this task where it conflicts.
4. `docs/ResultPage.md` — Results-page rationale. Apply the contract corrections in this task where it conflicts.
5. Owner-provided DES-05 visual references for the Jeepney loading state, Match Summary, and qualitative Results page.

## Goal

Replace the Results placeholder with reusable, responsive, **fixture-only** matching feedback surfaces: a real-request-ready Jeepney loading component, a Match Summary, and a qualitative Results page. No backend request is made in this task.

## Required screens and flow

### 1. Matching transition — `MatchingTransition`

- Create a calm matching state with the approved Jeepney visual, title `Finding opportunities that may fit you`, and supporting text `We’re checking the details you shared.`
- The component is rendered only when a real matching request is pending in future integration. EXP-05 must not create a fake delay, timer, `fetch`, or automatic loading sequence.
- The only legitimate state labels without backend progress events are a generic active state such as `Checking relevant programs` and a completed client-side acknowledgement such as `Reading your profile`. Do not simulate a multi-stage backend pipeline.
- Build a failure presentation with `We couldn’t find your matches right now.`, `Your answers are kept for this session.`, and a `Try again` callback surface. Do not claim persistent saving.

### 2. Match Summary — `MatchSummary`

- After a successful response in future integration, show a short summary before Results:
  - dynamic heading: `{count} opportunities may fit you`
  - supporting copy: `Based on the details you shared.`
  - `Your answers` shows only non-null/non-empty profile values; never invent skipped values.
  - `Edit answers` action and `See matches` primary action.
- Avoid duplicate counts, long “why” lists, numerical scores, or an eligibility guarantee.
- In this fixture-only task, the Summary is an explicit review state—not a timed or automatic fake API flow.

### 3. Results page — `/results`

- Implement the approved information architecture: compact personalized header; one `Featured opportunity`; a compact `More opportunities` list; light category refinement; an informational trust note.
- Header: `Opportunities that may fit you`, `Based on the details you shared.`, profile chips for supplied answers only, and `Edit answers`.
- Keep the desktop short deep-blue patterned header band subtle. Continue the established wordmark, filled-icon, radius, shadow, and spacing tokens.
- Use the existing `AgencyLogo` or neutral fallback. Never fabricate a real agency logo or use a letter-avatar as a logo substitute.
- Results are list rows, not Explore’s card grid. The entire row must be keyboard- and pointer-operable, with visible focus and a clear text/arrow affordance.

## Jeepney SVG asset contract

The owner supplies three separate, owner-controlled vector assets before implementation:

```text
jeepney.body.svg
jeepney.wheels.svg
jeepney.road.svg
```

- Keep the three assets in the existing frontend asset layer; do not draw, generate, or substitute Jeepney art.
- Compose them as independently positioned elements so CSS can animate them without editing vector content.
- Motion: body may gently bob by 1–2px; wheels may rotate subtly; road/background lines may translate horizontally. Keep it restrained and looped.
- Respect `prefers-reduced-motion: reduce`: render the same Jeepney as a still image and stop all decorative motion.
- Use a programmatic live status (`role=status` / polite live region) and `aria-busy` while pending. Motion must never be the only status signal.

## Qualitative match rules — non-negotiable

- Do not show a numerical score, percentage, rank number, score meter, probability ring, `Potential Match` score treatment, `Top Match`, `Strong Matches`, or `Sort: Most relevant`.
- The frozen public matching baseline is qualitative. Map only supported qualitative match outcomes:

  | Contract meaning | User-facing label | Visual treatment |
  | --- | --- | --- |
  | `likely_eligible` | `May be a fit` | Green/positive pill with text and check icon |
  | `uncertain` | `More details needed` | Amber informational pill with text and information/warning icon |

- Reasons must be factual and supplied by fixture/API match data, such as `Your region matches`, `Your education level matches`, or `We need a few more details to confirm your fit`. Do not calculate a match in page components.
- A known conflict is not an “uncertain” state. Omit it from personalized fixtures/results unless a later backend policy explicitly supplies it.
- `Featured opportunity` is presentation emphasis only. It must be backed by the first fixture/API result or an explicit future backend field; it is not a claimed best score.

## Program status and source rules

Use the frozen program status values consistently across Explore, Program Detail, and Results:

| `Program.status` | Visible label | Required treatment |
| --- | --- | --- |
| `open` | Open | Green pill/dot, text label |
| `ongoing` | Ongoing | Amber pill/dot with dark amber text label |
| `upcoming` | Upcoming | Blue-soft pill/dot, text label |
| `closed` | Closed | Neutral gray pill, text label |
| `unknown` | Status unknown | Neutral gray pill, explicit text label |

- Match uncertainty (`More details needed`) is separate from program status; an opportunity may be Open and still need more matching detail.
- Display the canonical source timestamp only as `ParaSa’yo checked {formatted date}` from `program.source.last_verified_at`. Do not invent a relative time or call it the agency’s publication date.
- Do not claim a source or application URL is official unless future backend authority data supports it.

## Filters, profile editing, and local state

- Use only compact canonical-category filters represented in local fixtures: `All`, `Scholarships`, `Training`, `Financial assistance`, and `Crisis assistance`. Do not show `other`, `Employment`, a generic `Assistance`, or empty categories.
- Keep a `lastMatchedProfile` separate from an editable draft profile. Results header chips reflect the last profile used to generate displayed results.
- `Edit answers` returns to the Matchmaker’s Profile Review with answers prefilled. The user makes changes and explicitly presses `Find opportunities` to request a new match later. Cancelling returns to unchanged results.
- If minimal router-state hydration is needed in the existing Matchmaker to preserve this behavior, modify only the relevant frontend files; do not add persistence, accounts, or backend calls.

## Required states

Use local fixtures and reusable state components for:

- resolved results (default `/results` fixture view);
- matching/loading visual state;
- Match Summary visual state;
- zero matches: `We couldn’t find opportunities that may fit based on what you shared.` with `Edit answers` and `Explore opportunities`;
- request failure: the retry presentation described above.

For owner review, use the existing development-preview convention. If none exists, add a clearly non-production `/_dev/results` preview route that exposes these local states without calling the backend. Do not make the product route auto-play a fake loading sequence.

## Responsive and transition rules

- At 390px, stack header actions and profile chips, make the featured card one column, and keep result rows readable and fully clickable.
- Preserve 44px minimum targets, visible focus, no hover-only meaning, and no horizontal overflow.
- When a real state change is wired later, Loading → Summary → Results may use a restrained 180–220ms opacity/vertical-offset transition. No forced delay, card cascade, or repeating results animation.

## Out of scope

- No `fetch`, live FastAPI integration, backend/scraper/schema edits, scoring algorithm, profile persistence, accounts, external imagery, or new dependencies.
- No change to the frozen category/status/match contract.
- Do not redesign Explore, Program Detail, Matchmaker, or global components beyond the scoped shared status presentation needed for consistency.

## Expected implementation areas

- `frontend/src/pages/ResultsPage.tsx` (or equivalent existing route page)
- `frontend/src/components/matchmaker/` and/or `frontend/src/components/results/` for focused state components
- Existing domain match types and local fixture/adapter files
- Existing `ProgramStatusBadge` and scoped style/token files, only as required for the locked status treatments
- `frontend/src/assets/` for owner-supplied Jeepney SVG elements
- Existing Matchmaker route/page only if required to hydrate `Edit answers` state
- `docs/CURRENT_TASK.md`

## Acceptance criteria

- `/results` renders the approved qualitative fixture Results page with no score/rank/sort language or percentage treatment.
- The owner can review Loading, Summary, resolved, zero, and failure visual states locally without any API call or fabricated timer.
- Jeepney animation uses supplied separate SVG elements, is subtle, has a non-motion fallback, and does not play as a fake default product flow.
- Header chips correctly omit skipped profile values. Edit answers preserves the prior profile in the Matchmaker review flow, and results retain the last matched profile until an explicit later rematch succeeds.
- Featured/list reasons are fixture-supplied factual strings; status and source freshness use the locked wording and semantic treatment.
- Existing shared status presentation still handles all frozen status values safely.
- Desktop follows DES-05; 390px has no horizontal overflow.
- `npm run lint` and `npm run build` pass. No backend/API files changed.

## Agent instructions

Before editing, read `AGENTS.md`, `docs/IMPLEMENTATION_BASELINE.md`, `docs/BACKEND_CONTRACT.md`, `docs/DESIGN_TOKENS.md`, `docs/Matching_Feedback.md`, `docs/ResultPage.md`, and this task. Inspect existing MatchProfile/MatchResult types, fixture adapters, ProgramStatusBadge, AgencyLogo, Matchmaker navigation/state, and any development-preview convention. Before editing, report the goal, expected files, availability/path of the three owner-supplied SVG assets, controlled fixture assumptions, acceptance checks, and blockers. Then wait for owner approval.
