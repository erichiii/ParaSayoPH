# ParaSa'yo Backend Contract

**Status:** Frozen backend-first MVP baseline  
**Date:** 22 August 2026  
**Applies to:** Scrapers, normalization, FastAPI, matching, and frontend integration

## 1. Purpose

This is the code-facing source of truth for the ParaSa'yo MVP. It freezes the existing canonical schema and product behavior so the frontend can build against fixtures without adding speculative fields, categories, or matching logic.

The detailed `program.v0.1` schema and the Engineering Specification remain the technical sources behind this contract. When they conflict with an older high-level planning example, the detailed `program.v0.1` schema wins.

## 2. Non-negotiable rules

1. Raw scraper output is untrusted input. Only normalized, validated canonical records reach public product surfaces.
2. Do not guess missing data.
3. A scalar that is unknown or not reliably stated is `null`.
4. A list with no extracted values is `[]`.
5. Preserve complex source wording in `raw_text` or `other_requirements`.
6. Unknown is not false, closed, or ineligible.
7. The frontend must never expose raw records, scrape-run internals, or credentials.

## 3. Frozen MVP category enum

No category additions are approved for the MVP.

```ts
type ProgramCategory =
  | "scholarship"
  | "financial_assistance"
  | "medical_assistance"
  | "crisis_assistance"
  | "disaster_assistance"
  | "transportation_assistance"
  | "burial_assistance"
  | "ofw_assistance"
  | "training"
  | "other";
```

`category` describes the program's **primary service or purpose**. It does not describe every audience or eligibility characteristic.

- A TESDA program for youth is `training`.
- A scholarship for OFW dependents is `scholarship`.
- `other` is a backend fallback when the primary purpose cannot be reliably mapped. It is not a visible frontend filter or a questionnaire choice.
- Youth, student, OFW, PWD, senior-citizen, and similar concepts remain eligibility/audience information, not new primary categories.

The initial frontend should surface only categories with real canonical data. Its default MVP choices are expected to be Scholarship, Financial Assistance, Crisis Assistance, and Training; hide any category without data rather than presenting an empty promise.

## 4. Canonical program shape (program.v0.1)

```ts
type Program = {
  id: string; // supplied by the public API
  title: string;
  provider: string | null;
  category: ProgramCategory;
  description: string | null;

  coverage: {
    type: "nationwide" | "regional" | "provincial" | "city" | "municipal" | "district" | "unknown";
    locations: string[];
  };

  eligibility: {
    age: { min: number | null; max: number | null; raw_text: string | null };
    education: { levels: string[]; raw_text: string | null };
    employment: { statuses: string[]; raw_text: string | null };
    income: {
      min: number | null;
      max: number | null;
      period: string | null;
      scope: string | null;
      raw_text: string | null;
    };
    residency: { locations: string[]; raw_text: string | null };
    other_requirements: string[];
  };

  benefits: string[];
  requirements: string[];

  application: {
    start_date: string | null; // YYYY-MM-DD
    deadline: string | null; // YYYY-MM-DD
    process: string | null;
    url: string | null;
  };

  source: {
    url: string;
    last_verified_at: string; // ISO-8601 datetime
  };

  status: "open" | "ongoing" | "upcoming" | "closed" | "unknown";
};
```

The public API may provide a smaller summary form for program cards, but it must preserve the same meanings and use the same identifiers.

## 5. Field behavior the frontend must respect

| Field | Frontend behavior |
|---|---|
| `provider: null` | Do not fabricate an agency name. Render a neutral fallback only if the public API permits such records. |
| `coverage.type: "unknown"` | Show coverage as unknown or omit the location line; do not claim nationwide availability. |
| `application.deadline: null` | Do not show a fake deadline or infer that applications are open. |
| `application.url: null` | Use the source page as the next action only when the public response indicates it is safe to do so. |
| `status: "unknown"` | Display `Status unknown`; do not label it open or ongoing. |
| empty eligibility arrays | Treat as no structured evidence, not proof that no requirement exists. |
| `raw_text` / `other_requirements` | Render selectively on the detail page; never turn it into a match guarantee. |

## 6. Matching contract (MCH-00 / MCH-00B approved)

The frontend collects the documented profile concepts:

```ts
type MatchProfile = {
  location: RegionId | null;
  age: number | null;
  employment_status: EmploymentStatusId | null;
  education_level: EducationLevelId | null;
  categories_needed: MatchableProgramCategory[];
};
```

`POST /api/match` accepts this direct body and returns `{ "results": MatchResult[] }`. It stores no profile data. Unknown fields, invalid IDs, negative/non-integer ages, duplicate categories, and `other` in `categories_needed` return `422`.

Controlled values:

```text
RegionId: ncr, car, region_3, region_4a, region_4b, region_6, region_7, region_10, region_11, region_12, barmm
EmploymentStatusId: student, employed, job_seeker, other
EducationLevelId: incoming_first_year_college, second_year_college, third_year_college, fourth_year_college, tvet
```

`MatchResult` contains a public `Program`, `match_state`, and factual reason objects `{ code, label }`. The only states are `likely_eligible` and `uncertain`; known explicit conflicts are omitted. Public results never expose scores, points, ranks, profile data, raw rows, or operational fields.

The approved reason-code vocabulary is:

```text
category_selected
age_within_range
coverage_location_match
nationwide_coverage
residency_location_match
employment_status_match
education_level_match
age_not_submitted
location_not_submitted
employment_not_submitted
education_not_submitted
age_criteria_unavailable
location_criteria_unavailable
employment_criteria_unavailable
education_criteria_unavailable
eligibility_details_unavailable
```

Each code has one fixed user-facing label in the backend matcher; the API emits no other reason codes.

Matching is qualitative. The UI may show:

- `likely_eligible` — known structured evidence aligns;
- `uncertain` — relevant information is missing or ambiguous; and
- approved factual reason codes for category, location, age, education, and employment evidence.

The MVP must not display an unsupported numerical percentage score. A known conflict may be omitted from personalized results or handled by backend policy; missing data is never a known conflict.

## 7. Public API integration boundary

Before real frontend integration, Backend provides all of the following:

1. One real public program-list response.
2. One real public program-detail response.
3. One real match request and response, including a partial/skipped profile.
4. One real `POST /api/match` response using the approved controlled IDs, including a partial/skipped profile.
5. The public base URL and documented development CORS origin.

Until then, frontend work uses fixtures conforming to Section 4 and puts all data access behind one API adapter. No page component should call `fetch` directly.

## 8. Source and trust display

The product must route users to the relevant official application or source page when known.

- Prefer `application.url` when it is a verified official application destination.
- Otherwise offer the verified `source.url` as an information/source action.
- Label the action honestly: `Apply at official site`, `Visit official program page`, or `View source` according to what the backend can verify.
- Display `last_verified_at` only as ParaSa'yo's last check, never as the agency's publication date.

The current v0.1 shape does not freeze a public `source_authority` field. The frontend must not infer official status from a URL alone. Backend should add an explicit public authority/action field only when it is implemented and verified.

## 9. Frontend implementation consequences

1. Define `Program`, `ProgramCategory`, `MatchProfile`, and status types once in `src/domain/`.
2. Keep display labels separate from IDs.
3. Seed fixtures only with frozen category/status values.
4. Build cards and details defensively for nullable/unknown fields.
5. Keep questionnaire state separate from user-facing labels.
6. Build a real pending, empty, and failure state; an API failure is not an empty match result.
7. Do not add account, profile persistence, income, school/course, audience-tag, or new category features without an explicit schema revision.

## 10. Schema change rule

Do not extend this schema because one source uses unusual wording. A new field or controlled value requires all of the following:

1. It appears across multiple real programs.
2. It materially improves matching or user understanding.
3. Its meaning can be defined consistently.
4. Backend, frontend, and product owners record the change together.

Until then, retain the source evidence in the existing raw-text fields.

## 11. Integration checklist

- [ ] Scraper owner confirms sample raw data can normalize into this shape.
- [ ] Backend owner provides the three live response samples in Section 7.
- [ ] Frontend owner creates schema-aligned fixtures and an API adapter.
- [ ] Team tests one real program from source through canonical API to UI.
- [ ] Team verifies unknown status, missing deadline, missing coverage, and partial profile behavior.
- [ ] Any required change is recorded before frontend/backed implementation diverges.
