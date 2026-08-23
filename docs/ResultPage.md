# ParaSa’yo Results Page — Final UX/UI & Visualization Specification

## 1. Purpose

The Results page is the **personalized recommendation experience** that appears after the user completes the questionnaire and ParaSa’yo finishes matching their profile against available opportunities.

It must feel meaningfully different from the **Explore** page.

The distinction is:

> **Explore = What opportunities exist?**
> **Results = Which opportunities may be relevant to me?**
> **Program Details = Should I pursue this opportunity?**

The Results page therefore prioritizes **relevance, ranking, explanation, and trust** rather than broad browsing.

---

# 2. Final Experience Flow

```text
Questionnaire
      ↓
Profile Review
      ↓
Find Opportunities
      ↓
Matching / Loading State
      ↓
Results Page
      ↓
Program Details
      ↓
Official Source
```

The matching/loading state transitions directly into the Results page. The result count and personalization summary serve as the reveal rather than requiring a separate "results found" page.

---

# 3. Final Layout Direction

Use:

> **Featured Top Match + Ranked Results List**

Do **not** reuse the Explore page's card-grid layout.

The Results page should have:

```text
Results Header
      ↓
Profile Context
      ↓
Featured Top Match
      ↓
Other Strong Matches
      ↓
Light Filtering / Sorting
```

This makes the page feel like a **personalized shortlist**, not another opportunity directory.

---

# 4. Results Header

Primary heading:

> **12 opportunities may be relevant to you.**

The number must be dynamic.

Supporting text:

> **Based on your profile**

Then display the important profile inputs as compact chips:

```text
[ 📍 Region IV-A ]
[ 🎓 College ]
[ 👤 Student ]
[ 📖 Training ]
```

Include:

```text
[ Edit profile ]
```

in the upper-right area.

### Purpose

This immediately communicates:

- how many opportunities were found
- that the results are personalized
- what information influenced the matching
- that the user can modify their profile

The user should be able to understand the personalized nature of the page without reading a long explanation.

---

# 5. Profile Chips

Use small, clean outlined/tinted chips.

Example:

```text
📍 Region IV-A
🎓 College
👤 Student
📖 Training
```

Do not display the entire questionnaire response as a large profile panel.

The profile summary should remain lightweight.

The same visual language used by the questionnaire should continue here.

---

# 6. Featured Top Match

The strongest recommendation gets a larger visual treatment.

Section label:

> **TOP MATCH**

Example structure:

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Provider Logo]    TESDA Web Development Training      │
│                     TESDA                                │
│                                                         │
│                     Why this may fit you                 │
│                     ✓ Region matches                    │
│                     ✓ Education matches                 │
│                     ✓ Training interest matches         │
│                                                         │
│                     ● Open                              │
│                     Last verified 2 hours ago            │
│                                                         │
│                          [ View program → ]               │
└─────────────────────────────────────────────────────────┘
```

The match score remains prominent:

```text
94%
Potential Match
```

but must **not** be presented as guaranteed eligibility.

Use:

> **Potential Match**

Never:

> 94% Eligible
> 94% Guaranteed Match

The team's matching concept uses relevance scoring and explicit match explanations rather than guaranteeing eligibility.

---

# 7. Match Score Treatment

For the featured result:

```text
94%
Potential Match
```

The number should be visually strong but **not treated like a progress bar or probability gauge**.

Avoid:

- circular percentage rings
- giant filled meters
- language suggesting certainty

The score communicates relative relevance.

The explanation underneath communicates **why**.

---

# 8. Provider Logo / Visual Identity

The previous score-only row:

```text
94% | TESDA Web Development Training
```

has been refined.

Use a **provider logo or source identity** as the primary visual anchor:

```text
[ TESDA LOGO ]   TESDA Web Development Training
                 TESDA
```

### Why

Provider identity gives the results visual landmarks and improves recognition.

Preferred hierarchy:

> **Provider logo > provider name > program title**

Do not depend on generic stock/program photos.

Provider logos are preferable because they:

- identify the organization
- support trust
- avoid an e-commerce visual style
- make different organizations easier to distinguish

If a logo is unavailable, use a simple provider-initial fallback.

Example:

```text
[ T ]
TESDA
```

The design must never look broken when a logo is missing.

---

# 9. Featured Match Explanation

Use a clear section:

> **Why this may fit you**

Display concise reasons:

```text
✓ Region matches
✓ Education matches
✓ Training interest matches
```

If an important uncertainty exists:

```text
⚠ Requirement needs verification
```

Positive match indicators should use the established blue/neutral visual language.

Warnings should use restrained red.

Do not hide important uncertainty.

---

# 10. Status and Verification

Every result should expose basic freshness/status information when available.

Example:

```text
● Open
Last verified 2 hours ago
```

Possible statuses:

```text
● Open
● Ongoing
⚠ Closing soon
Closed
```

Use the same status language across:

- Explore
- Results
- Program Details

The team's frontend requirements explicitly include source indicators and "last verified" information.

---

# 11. Other Strong Matches

Below the featured result:

> **OTHER STRONG MATCHES**

Use a **compact ranked list**, not another card grid.

Example:

```text
01   91%   DICT Digital Skills Program
          DICT
          ✓ Education matches
          ✓ Interest matches
          ● Open                                      →

02   88%   TESDA Data Analytics Training
          TESDA
          ✓ Region matches
          ✓ Interest matches
          ● Open                                      →

03   84%   DOLE Internship Program
          DOLE
          ✓ Situation matches
          ⚠ Requirement needs verification
          ● Ongoing                                   →
```

Ranking numbers are optional visually but recommended because they reinforce that the results are ordered recommendations.

---

# 12. Secondary Result Row Structure

Each compact result should expose:

```text
Provider logo
Program title
Provider
Match score
One or two match reasons
Status
Navigation affordance
```

Do not expose every field in the canonical program schema here.

The Results page is for **selection**, while Program Details is for deeper information.

---

# 13. Full Row Interaction

The entire secondary result row should be clickable.

Do not make only the arrow clickable.

Desktop hover behavior may include:

- subtle background tint
- slightly stronger border
- small elevation change

The interaction should clearly communicate:

> "This entire row opens the program."

This also improves usability for users with less precise mouse/touch interaction.

---

# 14. Filters and Sorting

Keep refinement controls lightweight.

Recommended:

```text
[ All ]
[ Scholarships ]
[ Training ]
[ Employment ]
[ Assistance ]
```

Optional:

```text
Sort: Most relevant ▾
```

The Results page should **not recreate the full Explore filtering system**.

The questionnaire has already personalized the dataset.

The controls here should refine the shortlist, not turn the page into Explore 2.0.

---

# 15. Optional Future Filter

A possible future refinement is:

```text
[ Closing Soon ]
```

This should only be implemented once deadline data is sufficiently reliable.

Many public-assistance programs may be ongoing or lack deadlines, so deadline-dependent filtering must handle missing data safely.

---

# 16. Results Page vs Explore Page

### Explore

Purpose:

> **Broad discovery**

Visual model:

```text
Search
↓
Filters
↓
Category
↓
Opportunity grid/list
```

### Results

Purpose:

> **Personalized decision-making**

Visual model:

```text
Personalized summary
↓
Top Match
↓
Why it matches
↓
Ranked recommendations
```

They should share the same visual system but **not the same information architecture**.

---

# 17. Final Visual Language

Continue the finalized questionnaire design.

### Primary

**Philippine-inspired blue**

Use for:

- headings where appropriate
- primary CTA
- selected states
- interactive controls
- match indicators

### Accent

**Yellow**

Use for:

- match score
- highlights
- small decorative accents
- Philippine sun motif

### Attention

**Red**

Use only for:

- uncertainty
- warnings
- important attention states

### Base

**White / very light neutral**

Use as the dominant content surface.

The Results page should contain considerably less illustration than the questionnaire because it is more information-dense.

Keep cultural identity through:

- ParaSa’yo sun logo
- subtle textile/geometric motif
- palette
- small decorative accents

Avoid large illustrations competing with program information.

---

# 18. Main Desktop Structure

```text
┌──────────────────────────────────────────────────────────────┐
│ ParaSa’yo                                  Edit profile      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 12 opportunities may be relevant to you.                     │
│ Based on your profile                                        │
│                                                              │
│ [Region IV-A] [College] [Student] [Training]                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ TOP MATCH                                                    │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [LOGO]   TESDA Web Development Training       94%       │ │
│ │           TESDA                           Potential      │ │
│ │                                            Match         │ │
│ │                                                          │ │
│ │           Why this may fit you                           │ │
│ │           ✓ Region matches                               │ │
│ │           ✓ Education matches                            │ │
│ │           ✓ Training interest matches                    │ │
│ │                                                          │ │
│ │           ● Open                                         │ │
│ │           Last verified 2 hours ago                      │ │
│ │                                     [View program →]     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ OTHER STRONG MATCHES                                         │
│                                                              │
│ [All] [Scholarships] [Training] [Employment]                 │
│                                              Sort: Relevant  │
│                                                              │
│ 01 [LOGO] DICT Digital Skills Program        91%             │
│       DICT · ✓ Education · ✓ Interest        ● Open      →   │
│                                                              │
│ 02 [LOGO] TESDA Data Analytics Training      88%             │
│       TESDA · ✓ Region · ✓ Interest          ● Open      →   │
│                                                              │
│ 03 [LOGO] DOLE Internship Program             84%             │
│       DOLE · ✓ Situation · ⚠ Verification    ● Ongoing   →   │
└──────────────────────────────────────────────────────────────┘
```

---

# 19. Mobile Behavior

The layout should collapse naturally into one column.

```text
ParaSa’yo

12 opportunities may be relevant

Based on:
[Region IV-A] [College]
[Student] [Training]

[Edit profile]

TOP MATCH

[Logo]

94% Potential Match

TESDA Web Development Training
TESDA

✓ Region matches
✓ Education matches
✓ Training interest

● Open
Last verified 2h ago

[View Program]

OTHER STRONG MATCHES

91% DICT Digital Skills
✓ Education
✓ Interest
● Open                              →

88% TESDA Analytics
✓ Region
✓ Interest
● Open                              →
```

No desktop-specific multi-column structure should become cramped on mobile.

---

# 20. States to Support

The Results page should support more than just the ideal 12-result state.

### Many results

```text
12 opportunities may be relevant
```

### Few results

```text
2 opportunities may be relevant
```

### Single result

```text
1 opportunity may be relevant
```

### Zero results

```text
We couldn't find strong matches yet.

[Edit profile]
[Explore opportunities]
```

Zero results should be treated as a valid state rather than a technical failure.

### API/error state

```text
We couldn't load your matches right now.

Your answers are still saved.

[Try again]
```

---

# 21. Profile Editing Behavior

`Edit profile` should return the user to the questionnaire **with their previous answers preserved**.

Expected flow:

```text
Results
  ↓
Edit profile
  ↓
Questionnaire
  ↓
existing answers loaded
  ↓
user changes one or more answers
  ↓
Find opportunities
  ↓
new matching request
  ↓
updated Results
```

The user should not be forced to start over.

---

# 22. Accessibility

The clean design must remain usable beyond visual appearance.

Requirements:

- large clickable result rows
- clear focus states
- readable text
- sufficient contrast
- no meaning conveyed through color alone
- recognizable selected/warning states
- keyboard-accessible interactive elements
- provider logos must include meaningful accessible labels
- arrows/icons must not be the only indication that a row is clickable

---

# 23. Trust Principles

The Results page must never imply certainty beyond the available data.

Use:

> **Potential Match**

> **may be relevant**

> **requirement needs verification**

Avoid:

> Eligible

> Guaranteed

> You qualify

unless the underlying system can actually support that claim.

The matching architecture is intended to provide explainable recommendations and explicitly account for incomplete or uncertain eligibility information.

---

# 24. Final Component Concept

The implementation can eventually map this design into:

```text
ResultsPage
│
├── ResultsHeader
│   ├── MatchCount
│   ├── ProfileTags
│   └── EditProfileButton
│
├── FeaturedMatch
│   ├── ProviderLogo
│   ├── MatchScore
│   ├── ProgramSummary
│   ├── MatchReasons
│   ├── Status
│   ├── Verification
│   └── ViewProgramButton
│
├── ResultFilters
│
└── RankedMatchList
    └── MatchRow
        ├── ProviderLogo
        ├── ProgramInfo
        ├── MatchScore
        ├── MatchReasons
        ├── Status
        └── Navigation
```

These are implementation abstractions and should follow the approved visual design rather than dictate it.

---

# 25. AI Visualization Instructions

When generating the visual design, preserve the following:

### Must include

- clean white page
- ParaSa’yo blue primary identity
- Philippine yellow accent
- restrained red warning
- ParaSa’yo sun logo
- subtle Filipino geometric/textile motif
- personalized result count
- profile chips
- Edit profile action
- one large featured Top Match
- provider logo
- clearly visible Potential Match score
- match explanations
- Open/Ongoing status
- Last verified
- compact ranked secondary results
- category filters
- Most Relevant sorting
- full-row interaction affordance

### Avoid

- repeating the Explore card grid
- excessive images
- generic stock photos
- giant AI-themed graphics
- circular score gauges
- excessive filters
- overly colorful cards
- guaranteed eligibility language
- large decorative illustrations that compete with results

### Overall visual feeling

> **Clean, trustworthy, personalized, modern Filipino public-service platform.**

It should feel closer to a **curated recommendation interface** than an e-commerce catalog, search engine, or AI dashboard.

---

# 26. Final Design Principle

The Results page should communicate:

> **“We didn't just collect these opportunities. We found the ones that may matter to you, and we can show you why.”**

The visual hierarchy should therefore be:

```text
HOW MANY?
    ↓
BASED ON WHAT?
    ↓
WHAT IS THE BEST MATCH?
    ↓
WHY DOES IT FIT?
    ↓
WHAT ELSE IS AVAILABLE?
    ↓
VIEW DETAILS
```

This final direction keeps the Results page distinct from Explore while preserving the same clean visual language established by the questionnaire and matching transition.