# ParaSa’yo Source Health — UX/UI, Data Visualization & Implementation Specification

## 1. Purpose

The **Source Health** section is the technical observability interface for the ParaSa’yo data network.

Its purpose is to make the reliability of the scraping/data pipeline understandable to judges, developers, and technically curious users without turning the product into a generic infrastructure dashboard.

The section should answer four questions:

1. **Are our data sources healthy?**
2. **Which source needs attention?**
3. **What happened when a source degraded?**
4. **Did the self-healing process recover the source successfully?**

The team's current project plan already defines the core Source Health concept as:

- number of sources monitored
- number of programs indexed
- extraction health
- self-healing repairs performed
- source status
- scrape activity
- anomaly detection
- repair/recovery history

The team also explicitly wants the self-healing sequence to be visible in the demo: **source change → extraction degradation → validation failure → self-heal → collector recovery → validation passes**.

---

# 2. Product Role

Source Health is different from the consumer-facing parts of ParaSa’yo.

```text
Consumer experience

Landing
   ↓
Explore
   ↓
Questionnaire
   ↓
Results
   ↓
Program Details
   ↓
Official Source
```

Source Health exposes the infrastructure underneath that experience:

```text
Public Sources
   ↓
Bright Data / Scrapers
   ↓
Extraction
   ↓
Validation
   ↓
Database
   ↓
Matching
   ↓
ParaSa’yo
```

The design principle is:

> **The consumer pages explain opportunities; Source Health explains the reliability of the data powering those opportunities.**

---

# 3. Core UX Goal

Source Health should feel like a **clear monitoring and recovery interface**, not a developer console.

The user should be able to move through three levels of understanding:

```text
OVERVIEW
  ↓
Which sources are healthy?

SOURCE STATUS
  ↓
Which source needs attention?

SOURCE DETAILS
  ↓
What happened, and did the system recover?
```

This is a progressive-disclosure model: show only the information needed at each level and reveal deeper technical details only when the user selects a source.

---

# 4. Visual Design Direction

The Source Health interface should remain visually consistent with the finalized ParaSa’yo consumer UI.

## 4.1 Base visual language

- White / very light neutral background
- Philippine-inspired blue as the dominant UI color
- Yellow as a restrained accent
- Red reserved for actual warnings/problems
- Green reserved for healthy status
- Clean typography
- Generous spacing
- Subtle Filipino geometric/textile motifs
- ParaSa’yo sun branding
- Minimal decorative noise

The page should feel more information-dense than the questionnaire, but it should still clearly belong to the same product.

## 4.2 What to avoid

Do **not** turn Source Health into:

- a cyberpunk dashboard
- a dark developer console
- a generic enterprise analytics product
- a wall of code/log output
- an overly colorful chart dashboard
- a collection of decorative charts

The technical content should remain approachable.

---

# 5. Final Information Architecture

```text
SOURCE HEALTH
│
├── 1. Network Overview
│   ├── KPI metrics
│   ├── Extraction health by source
│   └── Health trend
│
├── 2. Source Status
│   ├── Source
│   ├── Programs indexed
│   ├── Extraction health
│   ├── Status
│   └── Last run
│
└── 3. Source Details
    ├── Source identity
    ├── Health metrics
    ├── Health trend
    ├── Latest run / extraction quality
    ├── Anomaly information
    └── Healing / recovery timeline
```

---

# 6. Section 1 — Network Overview

## 6.1 Purpose

Give the user an immediate health snapshot of the entire data network.

The overview should answer:

> **“Is ParaSa’yo’s data network currently healthy?”**

## 6.2 KPI cards

Use four compact metric cards rather than oversized dashboard widgets.

### Metric 1 — Sources Monitored

```text
6
Sources Monitored
```

### Metric 2 — Programs Indexed

```text
127
Programs Indexed
```

### Metric 3 — Extraction Health

```text
98%
Extraction Health
```

### Metric 4 — Self-Healing Repairs

```text
4
Repairs Performed
```

These metrics are directly aligned with the team's Source Health concept.

## 6.3 KPI design principles

- Numbers should be prominent but not oversized.
- Labels must be immediately understandable.
- Avoid gauges/speedometers for the health percentage.
- Avoid using color as the only representation of health.
- Keep all four metrics visually consistent.

---

# 7. Section 2 — Extraction Health by Source

## 7.1 Purpose

Answer:

> **“Which sources are healthy, and which source needs attention?”**

Use a **horizontal bar chart**.

Example:

```text
Extraction Health by Source

CHED       ████████████████████ 99%
TESDA      ███████████████████  98%
DOST       ██████████████████   97%
DSWD       █████████████████    96%
DICT       ████████████████     92%  ⚡
LGU        ███████████████████  99%
```

## 7.2 Why horizontal bars

Horizontal bars are preferred because source names may vary in length and the chart must remain readable.

The chart should prioritize comparison, not decoration.

## 7.3 Visual semantics

- Blue = primary health visualization
- Yellow = repair/recovery accent if needed
- Red = degraded/failed data only
- Green = healthy status where semantic status is shown

Do not use rainbow color scales.

---

# 8. Section 3 — Health Trend

## 8.1 Purpose

Answer:

> **“Is this source getting better or worse over time?”**

Use a simple **line chart** for extraction health history.

Example:

```text
Extraction Health — DICT

100% ┤                         ●──●
 95% ┤                ●────────
 90% ┤          ●─────
 85% ┤     ●
 80% ┤
     └────────────────────────────
       Mon  Tue  Wed  Thu  Fri
```

## 8.2 What the chart should show

Minimum data:

- timestamp/date
- extraction health

Optional event markers:

- anomaly
- healing triggered
- recovery
- validation passed

## 8.3 Important design rule

Keep the chart focused on **one metric: extraction health**.

Do not combine unrelated metrics such as request counts, validation scores, latency, and program volume into one chart.

The chart should be immediately readable by a non-technical judge.

---

# 9. Section 4 — Source Status

## 9.1 Purpose

Provide a compact operational list of all monitored sources.

Recommended columns:

```text
Source | Programs | Health | Status | Last Run
```

Example:

```text
SOURCE STATUS

Source        Programs     Health       Status       Last Run
CHED          47           99%          ● Healthy       2m
TESDA         62           98%          ● Healthy       4m
DOST-SEI      18           97%          ● Healthy       3m
DSWD          31           96%          ● Healthy       5m
DICT          24           92%          ⚡ Repaired      1m
LGU           12           99%          ● Healthy       7m
```

The exact numbers above are demonstration/mock values unless supplied by the backend.

## 9.2 Status model

Recommended semantic states:

```text
● Healthy
⚡ Repaired
⚠ Degraded
✕ Failed
```

Use the smallest useful set in the first version. Do not create additional states unless the backend actually defines them.

## 9.3 Last Run

`Last Run` communicates data freshness at the source level.

Examples:

```text
2m ago
4m ago
1h ago
Yesterday
```

The actual source of truth should be a backend timestamp; the frontend may render a human-readable relative time.

---

# 10. Source Status as an Interaction

Each source row should be clickable.

Example:

```text
DICT
24 programs
92%
⚡ Repaired
```

Clicking it should open the source-detail view.

Do not expose the entire healing timeline directly in the overview. That would make the page unnecessarily dense.

---

# 11. Section 5 — Source Details

When a source is selected:

```text
← Back to Source Health

DICT
⚡ Repaired

24 programs indexed
92% extraction health
Last run: 1 minute ago
```

The source-detail screen should then contain:

1. Source identity
2. Current health
3. Health trend
4. Latest extraction quality
5. Anomaly details, when applicable
6. Healing timeline

---

# 12. Source Health Detail Metrics

For a selected source, show the latest run metrics that the backend provides.

Recommended:

```text
Records extracted
Valid records
Missing required fields
Validation score
Status
Healing triggered?
```

Example:

```text
LATEST RUN

Records extracted        24
Valid records            23
Missing required fields   1
Validation score         96%
Status                   Repaired
Healing triggered?       Yes
```

The frontend should display these values rather than independently redefine what they mean.

---

# 13. Validation / Extraction Quality Visualization

A compact validation-quality graphic may be shown in the source-detail view.

Example:

```text
DICT — Latest Run

Valid records        ███████████████████ 23
Needs review         █                    1
Invalid              0
```

Or as a compact stacked horizontal bar.

This visualization is useful because the scraper can technically return a response successfully while still producing poor data quality.

The chart should communicate:

> **“How much of the extracted data passed validation?”**

It should not imply that the frontend itself is performing validation.

---

# 14. Anomaly Panel

When an extraction anomaly occurs, present it explicitly.

Example:

```text
DATA ANOMALY

Deadline extraction degraded

Before
██████████████████ 92%

After
██                  8%

Threshold
60%

Status
⚡ Self-healing triggered
```

This makes the failure understandable without requiring the viewer to inspect raw logs.

The team's health-monitoring examples include cases where record counts or required-field coverage suddenly fall and trigger anomaly detection.

---

# 15. Healing / Recovery Timeline

This should be the **star visualization of the Source Health section**.

The timeline should make the hackathon's central technical story visible:

```text
Source changes
      ↓
Extraction degrades
      ↓
Validation/anomaly detected
      ↓
Self-healing
      ↓
Extraction recovered
      ↓
Validation passed
```

Recommended UI:

```text
DICT — Recent Repair

14:31  ●  Scrape started
        │
14:32  ●  Extraction anomaly
        │   Missing deadline field
        │
14:32  ⚡ Self-healing triggered
        │
14:33  ●  Extraction recovered
        │
14:33  ✓  Validation passed
```

This should be represented as a visual vertical timeline rather than a raw log dump.

---

# 16. Recovery State Visualization

The source status should visibly progress through the recovery process.

```text
Healthy
   ↓
⚠ Degraded
   ↓
⚡ Self-healing
   ↓
✓ Recovered
```

The timeline and health trend should reinforce the same event sequence.

This creates a coherent narrative rather than isolated UI widgets.

---

# 17. Health Trend + Healing Events

A particularly useful enhancement is to place event markers on the extraction-health chart.

Conceptually:

```text
100% ┤────────────●──────●
 95% ┤       ●────
 90% ┤   ●
 85% ┤
 80% ┤
 70% ┤
 60% ┤        ⚠
 50% ┤        │
     └────────────────────────
             anomaly   recovery
```

This allows the judge to visually correlate:

```text
health dropped
      ↓
anomaly occurred
      ↓
repair happened
      ↓
health recovered
```

This is one of the strongest possible visual representations of the self-healing concept.

---

# 18. Charts That Are Explicitly Included

The finalized Source Health design should use a restrained set of visualizations.

## Required / Recommended

### Chart 1 — Extraction Health by Source

Horizontal bar chart.

Purpose:

> Compare current source health.

### Chart 2 — Extraction Health Trend

Line chart.

Purpose:

> Show degradation and recovery over time.

### Visualization 3 — Healing Timeline

Vertical event timeline.

Purpose:

> Show what happened during failure and recovery.

### Optional Chart 4 — Program Volume by Source

Horizontal bar chart.

Purpose:

> Show how many programs each source contributes.

This is secondary to reliability metrics and should only be included if it improves the page without adding clutter.

---

# 19. Program Volume by Source — Optional

Example:

```text
Programs Indexed

TESDA      ███████████████████ 62
CHED       ██████████████      47
DSWD       █████████            31
DICT       ██████              24
DOST       █████               18
LGU        ███                 12
```

This supports the `programs indexed` metric but is less central to the hackathon theme than extraction health and recovery.

If the Source Health interface becomes visually crowded, **remove this chart first**.

---

# 20. Visualizations Explicitly Avoided

Do not add charts merely for visual decoration.

Avoid:

- pie charts for health distribution
- gauge/speedometer charts
- 3D charts
- excessive line charts
- dashboards containing many unrelated metrics
- rainbow health charts
- decorative graphs without operational meaning
- AI-confidence charts unless a real backend metric exists

A visualization is justified only if it answers a clear question.

---

# 21. Chart Selection Principle

Every graphic must answer **one concrete sentence**.

```text
KPI
→ How many sources are monitored?

Health bars
→ Which sources are healthy?

Health trend
→ Is this source improving or degrading?

Validation graphic
→ How much extracted data passed validation?

Healing timeline
→ What happened when the source degraded?

Program volume
→ How much data does each source contribute?
```

If a graphic does not answer one of these questions, it should probably not be included.

---

# 22. Page-Level Layout

Recommended desktop structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ ParaSa’yo                                  Source Health    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ SOURCE HEALTH                                               │
│ Monitor the data sources powering ParaSa’yo.                │
│                                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│ │ 6      │ │ 127    │ │ 98%    │ │ 4      │                 │
│ │Sources │ │Programs│ │Health  │ │Repairs │                 │
│ └────────┘ └────────┘ └────────┘ └────────┘                 │
│                                                             │
│ EXTRACTION HEALTH BY SOURCE                                 │
│                                                             │
│ CHED     ████████████████████ 99%                           │
│ TESDA    ███████████████████  98%                           │
│ DOST     ██████████████████   97%                           │
│ DSWD     █████████████████    96%                           │
│ DICT     ████████████████     92% ⚡                         │
│                                                             │
│ HEALTH TREND                                                │
│                                                             │
│ [line chart]                                                │
│                                                             │
│ SOURCE STATUS                                               │
│                                                             │
│ Source   Programs   Health   Status      Last Run            │
│ CHED       47        99%     ● Healthy       2m              │
│ TESDA      62        98%     ● Healthy       4m              │
│ DICT       24        92%     ⚡ Repaired      1m              │
│                                                             │
│ RECENT RECOVERY                                             │
│                                                             │
│ DICT — Repaired                                             │
│                                                             │
│ 14:31 ● Scrape started                                      │
│ 14:32 ● Extraction anomaly                                  │
│ 14:32 ⚡ Self-healing triggered                             │
│ 14:33 ● Extraction recovered                                │
│ 14:33 ✓ Validation passed                                   │
└─────────────────────────────────────────────────────────────┘
```

The implementation may rearrange the chart and status sections responsively, but the conceptual hierarchy should remain.

---

# 23. Source Detail Layout

When the user clicks a source:

```text
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Source Health                                    │
│                                                             │
│ DICT                                                        │
│ ⚡ Repaired                                                 │
│                                                             │
│ 24 programs indexed     92% extraction health              │
│ Last run: 1 minute ago                                      │
│                                                             │
│ HEALTH TREND                                                │
│ [line chart with event markers]                            │
│                                                             │
│ LATEST RUN                                                  │
│ Records extracted        24                                │
│ Valid records            23                                │
│ Missing required fields   1                                │
│ Validation score         96%                               │
│                                                             │
│ RECENT HEALING                                              │
│ [vertical timeline]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

# 24. Responsive Design

Desktop can use a richer multi-section layout.

Mobile should collapse into a single-column sequence:

```text
Source Health
↓
KPI cards
↓
Health by source
↓
Health trend
↓
Source status
↓
Recent recovery
```

Source status rows should remain horizontally readable or become stacked cards depending on available width.

Charts must resize without requiring horizontal scrolling where possible.

---

# 25. API / Data Contract

The frontend should **display backend-defined health metrics** rather than calculating business-critical health values itself.

The frontend should not independently decide what “healthy” means.

## 25.1 Overview endpoint

Conceptual endpoint:

```http
GET /api/health
```

Expected payload:

```json
{
  "sources_monitored": 6,
  "programs_indexed": 127,
  "extraction_health": 98,
  "repairs_performed": 4
}
```

---

# 26. Source Status API

Conceptual endpoint:

```http
GET /api/sources
```

Expected payload:

```json
[
  {
    "id": "dict",
    "name": "DICT",
    "programs_indexed": 24,
    "extraction_health": 92,
    "status": "repaired",
    "last_run": "2026-08-21T20:10:00Z"
  },
  {
    "id": "tesda",
    "name": "TESDA",
    "programs_indexed": 62,
    "extraction_health": 98,
    "status": "healthy",
    "last_run": "2026-08-21T20:07:00Z"
  }
]
```

The frontend can convert timestamps into relative text such as `2m ago`.

---

# 27. Source Health History API

Conceptual endpoint:

```http
GET /api/sources/:id/health
```

Expected payload:

```json
[
  {
    "timestamp": "2026-08-21T18:00:00Z",
    "extraction_health": 98
  },
  {
    "timestamp": "2026-08-21T19:00:00Z",
    "extraction_health": 42
  },
  {
    "timestamp": "2026-08-21T19:05:00Z",
    "extraction_health": 96
  }
]
```

The frontend uses this to render the line chart.

---

# 28. Healing Events API

Conceptual endpoint:

```http
GET /api/sources/:id/events
```

Expected payload:

```json
[
  {
    "timestamp": "2026-08-21T19:00:00Z",
    "type": "anomaly",
    "message": "Missing deadline field"
  },
  {
    "timestamp": "2026-08-21T19:01:00Z",
    "type": "repair",
    "message": "Self-healing triggered"
  },
  {
    "timestamp": "2026-08-21T19:03:00Z",
    "type": "recovery",
    "message": "Extraction recovered"
  },
  {
    "timestamp": "2026-08-21T19:03:00Z",
    "type": "validation",
    "message": "Validation passed"
  }
]
```

The frontend should treat event `type` as semantic information and map it to the appropriate visual marker.

---

# 29. API Responsibilities

The backend should own:

- extraction-health calculation
- validation score calculation
- anomaly detection
- health status classification
- healing events
- source run history
- timestamps
- program counts

The frontend should own:

- visualization
- formatting
- layout
- interaction
- loading/error/empty states
- relative-time display
- visual state mapping

This keeps business logic out of the UI.

---

# 30. Loading / Empty / Error States

Source Health must support more than the ideal populated state.

## Loading

```text
Loading source health...
```

Skeletons can be used for KPI cards and source rows.

## Empty

```text
No source health data is available yet.
```

## API failure

```text
We couldn't load source health right now.

[Try again]
```

Do not display fabricated health values when the API fails.

---

# 31. Data Integrity Rule

Mock/sample data may be used during development and visualization, but it must be clearly separated from real backend data.

Do not present invented metrics such as:

```text
98% health
4 repairs
127 programs
```

as real production statistics unless they actually come from the backend.

These numbers are valid as visualization examples only.

---

# 32. Source Detail Interaction

The intended interaction is:

```text
Source Health Overview
        ↓
Click a source
        ↓
Source Details
        ↓
Inspect health trend / latest run
        ↓
Inspect healing timeline
        ↓
Back to Source Health
```

This avoids putting every technical event on the main dashboard.

---

# 33. Hackathon Demo Mode

A demonstration mode may be implemented if supported by the backend.

Ideal sequence:

```text
DICT
● Healthy
98% health

        ↓

Source change / simulated failure

        ↓

⚠ Degraded
40% health

        ↓

⚡ Self-healing triggered

        ↓

✓ Extraction recovered

        ↓

✓ Validation passed

        ↓

DICT
● Healthy
96% health
```

The frontend should visualize the actual state changes provided by the backend.

Do not create a fake animation that claims the system repaired itself if the actual backend did not perform the repair.

The team's demo plan explicitly wants the sequence **failure → detection → repair → recovery** to be observable.

---

# 34. Recommended Implementation Strategy

Source Health should be implemented incrementally.

## Phase 1 — Mock UI

Build with local mock data:

```text
KPI cards
↓
Health bars
↓
Source status table
↓
Health trend chart
↓
Healing timeline
```

No backend dependency.

## Phase 2 — API Contract

Agree with the backend teammate on:

```text
/api/health
/api/sources
/api/sources/:id/health
/api/sources/:id/events
```

Exact routes can differ. The important requirement is that the response shapes and semantics are agreed before integration.

## Phase 3 — Real Data

Replace mock data with API responses.

The component structure should remain largely unchanged.

## Phase 4 — Live / Demo Recovery

Connect actual healing-state events and verify that the UI transitions correctly between:

```text
Healthy
Degraded
Healing
Recovered
```

---

# 35. Avoid Overengineering

The Source Health section should remain intentionally limited.

Do not add:

- complex filtering
- account administration
- arbitrary analytics
- dozens of charts
- system infrastructure metrics unrelated to scraping
- advanced data science visualizations
- developer logs as raw text

The purpose is to communicate **source reliability and self-healing**, not to build a full monitoring product.

---

# 36. Accessibility

The charts and tables must remain understandable without relying solely on color.

Examples:

Bad:

```text
Green = Healthy
Red = Failed
```

Better:

```text
● Healthy
⚠ Degraded
⚡ Repaired
✕ Failed
```

Charts should also have textual/contextual labels so their meaning is not inaccessible to users who cannot interpret the graphic.

Provider/source names, status, values, and critical events should remain available as normal text.

---

# 37. Final Visual Hierarchy

The Source Health page should prioritize:

```text
1. Overall network state
       ↓
2. Source comparison
       ↓
3. Health trend
       ↓
4. Source status
       ↓
5. Technical recovery details
```

The healing timeline is the primary technical storytelling element.

Charts support the story; they do not become the story themselves.

---

# 38. Final Source Health Design

The finalized Source Health experience is:

```text
SOURCE HEALTH
│
├── Network Overview
│   ├── Sources Monitored
│   ├── Programs Indexed
│   ├── Extraction Health
│   └── Repairs Performed
│
├── Extraction Health by Source
│   └── Horizontal Bar Chart
│
├── Health Trend
│   └── Line Chart
│
├── Source Status
│   └── Clickable Source Rows
│
└── Source Details
    ├── Current Health
    ├── Latest Run Metrics
    ├── Extraction Quality
    ├── Health Trend
    ├── Anomaly Information
    └── Healing Timeline
```

---

# 39. AI Visualization Prompt

Use the following as the base visualization prompt for the Source Health interface:

> Design a modern source-health monitoring dashboard for **ParaSa’yo**, a Filipino public-opportunity discovery platform powered by a network of public web sources and self-healing scrapers.
>
> Preserve the existing ParaSa’yo visual language: clean white backgrounds, Philippine-inspired blue as the dominant UI color, warm yellow accents, restrained red for warnings, green for healthy status, clean typography, generous spacing, and subtle Filipino geometric/textile motifs. Include the ParaSa’yo sun logo but keep decoration restrained.
>
> The dashboard should feel like an approachable technical observability interface rather than a developer console, cyberpunk dashboard, or generic enterprise analytics product.
>
> At the top, show four compact KPI cards: Sources Monitored, Programs Indexed, Extraction Health, and Self-Healing Repairs.
>
> Below them, show a horizontal bar chart titled **Extraction Health by Source**, comparing the extraction health percentage of monitored sources such as CHED, TESDA, DOST, DSWD, DICT, and LGU.
>
> Include a clean line chart titled **Extraction Health Trend** showing health over time for a selected source. Where appropriate, visually mark anomaly, repair, and recovery events.
>
> Include a compact **Source Status** table/list with source name, programs indexed, extraction health, status, and last run. Use semantic states such as Healthy, Repaired, Degraded, and Failed.
>
> Clicking a source should reveal a Source Details view containing current health, latest run metrics, extraction quality, a health trend, anomaly information, and a vertical **Healing Timeline** showing: Scrape Started → Extraction Anomaly → Self-Healing Triggered → Extraction Recovered → Validation Passed.
>
> The most important visual story is the self-healing sequence. Make the progression from healthy → degraded → healing → recovered easy to understand without overwhelming the user.
>
> Avoid pie charts, gauges, 3D charts, excessive graphs, rainbow color schemes, fake AI metrics, dense raw logs, or decorative analytics that do not communicate operational meaning.
>
> The dashboard should look like an integral technical section of ParaSa’yo, not a separate product.

---

# 40. Final Design Principle

The Source Health section should communicate one central message:

> **“The opportunities you see are powered by a monitored data network that can detect extraction problems and recover from them.”**

The most important visual narrative is:

```text
HEALTHY
   ↓
SOURCE CHANGES
   ↓
DATA QUALITY DEGRADES
   ↓
ANOMALY DETECTED
   ↓
SELF-HEALING
   ↓
EXTRACTION RECOVERED
   ↓
VALIDATION PASSED
   ↓
HEALTHY AGAIN
```

Everything in the Source Health interface—KPI cards, comparison charts, trend charts, status tables, and healing timeline—should support that story rather than compete with it.
