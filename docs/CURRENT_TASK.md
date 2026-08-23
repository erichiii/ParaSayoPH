# Current Task

## EXP-06 — Landing page

**Depends on:** EXP-05 is owner-approved complete; Landing desktop and mobile visual references are owner-approved complete.

## Goal

Replace the Landing placeholder at `/` with the approved responsive ParaSa'yo landing page using local fixture content, reusable primitives, owner-controlled assets, and no backend/API integration.

## Design sources

1. `docs/DESIGN_TOKENS.md` — source of truth for core tokens, component baselines, and responsive rules.
2. Owner-approved Landing desktop reference — real-photo blue hero, trust rail, category navigation, process band, logo-first program preview, source-transparency section, footer.
3. Owner-approved Landing mobile reference — compact menu, blue photo hero, stacked CTAs, 2×2 trust rail, one-column categories, vertical process steps, provider-logo program rows, and compact footer.

## Required sections

Build in this order:

1. Shared white navigation bar (reuse existing layout/navigation; do not duplicate it).
2. Blue Hero with primary/secondary CTAs.
3. Trust rail.
4. `What are you looking for?` category navigation.
5. `How ParaSa'yo works` process section.
6. `Programs you can explore` logo-first program preview.
7. Source-transparency section.
8. Shared footer (reuse the existing `SiteFooter`).

## Hero rules

- Desktop hero uses the approved deep-blue (`--color-brand-blue-700`) photo composition: readable copy left; owner-controlled real Filipino people image right; softened blue fade into the hero.
- Mobile keeps the blue hero and the real-photo composition, with copy readable before/alongside the image and no important face cropped at eyes/face.
- All imagery is selected through the owner-controlled `landing.hero.image` content/configuration slot with `src`, `alt`, and `objectPosition`.
- **Strict fallback:** when `landing.hero.image.src` is absent, null, or fails to load, render the hero as a completely plain solid `--color-brand-blue-700` surface. Do not render a generic illustration, generated fallback, woven pattern, sun decoration, stock image, or placeholder icon.
- Keep hero primary CTA before secondary CTA:
  - primary: `Find what’s for me` → `/matchmaker`
  - secondary: `Explore opportunities` → `/explore`
- No percentage claims, eligibility guarantee, account claim beyond `No sign-up required`, or backend/live-data claim.

## Trust and source copy rules

The design may retain four compact filled-icon trust items, but wording must not imply unsupported verification/authority. Use contract-safe language such as:

- `Source links` — `See where program details come from.`
- `Last checked` — `See when ParaSa’yo last checked details.`
- `No sign-up required` — `Browse and match without an account.`
- `Your choice` — `Explore directly or answer a few questions.`

Do not use `verified sources`, `official partners`, `trusted government sources`, `checked regularly`, or similarly unverified operational claims. Source information remains tied to the canonical source URL and last-checked timestamp when individual records are displayed.

## Category-navigation rules

- Use only frozen canonical `ProgramCategory` values and local data/labels already present in the frontend taxonomy layer.
- Do not render `other` as a landing category, filter, or questionnaire choice.
- Do not invent category IDs or show Employment/Livelihood as canonical program categories.
- Render category cards only for canonical categories represented in local fixture data. A recommended initial set is Scholarship, Training, Financial Assistance, Medical Assistance, Crisis Assistance, and OFW Assistance, subject to actual local fixture availability.
- Category card media is owner-controlled through the configured landing category image slots. If no category image exists, use the existing neutral category fallback; never fetch an external image.
- Cards navigate to Explore with the category context using the existing routing convention. Do not create a new backend query parameter.

## Process section

- Use the approved warm surface, filled navy icon medallions, restrained yellow connector, and 01/02/03 sequence.
- Use simple, honest copy:
  1. `Tell us about you` — answer a few optional questions.
  2. `We find matches` — surface opportunities that may fit the details shared.
  3. `Explore and decide` — review program details and their source.
- Do not promise eligibility or imply undisclosed automatic source verification.

## Programs preview — desktop and mobile cohesion

- Use a compact **provider-logo-first list**, not large image cards.
- Remove all right-side program photos/thumbnails on desktop. The desktop list must match the approved mobile direction.
- Each preview row shows:
  - owner-supplied agency logo or existing neutral `AgencyLogo` fallback on the left;
  - program title, provider when supplied, one concise description or category label;
  - status using the shared semantic `ProgramStatusBadge`;
  - `ParaSa’yo checked {formatted date}` from canonical `source.last_verified_at`;
  - `View details` action → `/programs/:id` with Explore entry context.
- Do not fabricate an agency logo, use a letter-avatar logo, show arbitrary right-side imagery, expose raw source URLs, or claim an application is official.

## Source-transparency section

- Use a warm or blue-soft section with filled icons, compact explanatory copy, and an optional owner-controlled supporting image only if configured.
- Keep the claim factual: ParaSa’yo shows the source and when it last checked the available details.
- Do not claim all records are verified, official, regularly updated, or reliable beyond the actual canonical data.

## Responsive rules

- Test 390px as an approved target.
- Mobile uses 16px gutters, compact navbar wordmark/menu, full-width stacked CTAs, 2×2 trust grid, one full-width category card per row, vertical process sequence, logo-first program rows, and compact footer.
- At all widths: 44px minimum interactive targets; visible focus; no hover-only navigation; no horizontal scroll; readable text; no important image subject cropped at eyes/face.

## Data, architecture, and scope

- Fixture-only: no `fetch`, live API, backend/scraper/schema modifications, new dependency, external image request, account, persistence, or analytics.
- Reuse existing domain types, local fixtures/taxonomies, `MediaSlot`, `AgencyLogo`, `ProgramStatusBadge`, `Button`, layout primitives, and `SiteFooter` where appropriate.
- Page/component files must not access raw scraper data, environment secrets, or API calls.
- Keep all visual asset choices in the existing content/configuration layer; do not hard-code image URLs in components.
- Do not redesign Explore, Matchmaker, Results, or Program Detail outside a minimal entry-context link required for landing program rows.

## Expected implementation areas

- `frontend/src/pages/LandingPage.tsx` (or existing equivalent route page)
- focused landing components under `frontend/src/components/` only when reuse improves clarity
- existing asset/configuration and local fixture/taxonomy files only as needed for approved owner-controlled slots
- scoped styles/token layer
- `docs/CURRENT_TASK.md`

## Acceptance criteria

- `/` implements all required sections with the approved desktop/mobile hierarchy.
- Hero CTAs route correctly; category cards route to Explore context; landing program rows route to their Program Detail with Explore entry context.
- Hero has the exact plain-solid-blue fallback behavior when its image is absent or fails.
- Desktop program preview has no right-side program photos; it uses the same provider-logo-first information hierarchy as mobile.
- No unsupported source/verification/eligibility claims, non-canonical category, `other` filter, external image request, or API call appears.
- The page is usable at 390px with no horizontal overflow and with all controls touch-safe.
- `npm run lint` and `npm run build` pass. No backend/API files changed.

## Agent instructions

Before editing, read `AGENTS.md`, `docs/IMPLEMENTATION_BASELINE.md`, `docs/BACKEND_CONTRACT.md`, `docs/DESIGN_TOKENS.md`, and this task. Inspect the existing navigation/layout, Landing route, asset/configuration layer, local canonical categories, program fixtures, `MediaSlot`, `AgencyLogo`, `ProgramStatusBadge`, and `SiteFooter`. Before editing, report goal, expected files, available owner-supplied assets, category fixture availability, route-context approach, acceptance checks, and every blocker. Then wait for owner approval.
