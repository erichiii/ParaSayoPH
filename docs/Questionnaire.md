# ParaSa’yo Questionnaire — Final UX/UI and Implementation Specification

## 1. Purpose

The ParaSa’yo questionnaire is the personalization entry point of the application. Its purpose is to collect a **small, meaningful set of user attributes** that the matching engine can use to identify public opportunities that may be relevant to the user.

The questionnaire must not feel like a government application form, registration process, or lengthy survey. It should feel like a **short guided interaction that helps ParaSa’yo understand the user**.

The design direction is based on the following principle:

> **Answer, don't fill out.**

The user should be able to understand each question immediately, select an answer with minimal effort, move forward confidently, and know approximately how much remains.

## The questionnaire is based on the project's planned matching inputs: location, age, current situation, education level, and type of support/opportunity desired. The team documentation identifies these as the core inputs for profile matching and explicitly allows users to browse without personalization.

# 2. Final Questionnaire Concept

## 2.1 Structure

The questionnaire will use **three major steps/cards** rather than presenting every question as a separate page.

### Step 1 — Who & Where

Collect:

- Current location/region
- Age

### Step 2 — Background & Study

Collect:

- Current situation/status
- Education level

### Step 3 — Support Needed

Collect:

- Desired opportunity/support categories

After the three cards, the user receives a lightweight **profile review** before submitting the matching request.

Final flow:

```text
Para Sa Akin?
      ↓
Introduction
      ↓
Step 1 — Who & Where
      ├── Location
      └── Age
      ↓
Step 2 — Background & Study
      ├── Current status
      └── Education
      ↓
Step 3 — Support Needed
      └── Desired categories
      ↓
Profile Review
      ↓
Find Opportunities
      ↓
Matching
      ↓
Personalized Results

```

The three-step structure is a deliberate reduction in interaction complexity. The intention is to reduce the perceived length of the task while preserving the information required by the matching system.

---

# 3. Why Three Steps Instead of Five Individual Questions?

The original concept treated each input as its own question. The refined design groups related information into three semantic categories.

Instead of:

```text
Question 1
Question 2
Question 3
Question 4
Question 5

```

the user experiences:

```text
Who am I and where am I?
        ↓
What is my current situation?
        ↓
What am I looking for?

```

This gives the questionnaire a stronger mental model.

The user is not merely completing a sequence of questions. They are gradually building a small profile.

The intended psychological progression is:

```text
WHO & WHERE
      ↓
BACKGROUND
      ↓
NEEDS
      ↓
RECOMMENDATIONS

```

This is easier to understand than an arbitrary sequence of five unrelated prompts.

---

# 4. Core UX Objectives

The questionnaire should satisfy the following objectives.

## 4.1 Fast

The user should perceive the interaction as short.

Recommended framing:

> **3 quick steps · About 1 minute**

The exact time should only be stated if usability testing confirms it.

The interface should minimize unnecessary typing and favor direct selection.

---

## 4.2 Low cognitive load

The user should not need to understand how the matching engine works.

The questionnaire should ask one clearly understandable concept at a time even when multiple related questions are grouped inside a single step.

Each individual question should answer:

> "What are you asking me?"

without requiring technical terminology.

---

## 4.3 Obvious interaction

At every moment, the user should immediately understand:

1. What information is being requested?
2. What choices are available?
3. Which choice is currently selected?
4. How do I continue?
5. How far through the process am I?

---

## 4.4 Forgiving

Users must be allowed to make corrections.

Required behavior:

- Back navigation
- Editing previous answers
- Clearly visible selected states
- Optional skipping where data is not mandatory
- No destructive reset when navigating backward

---

## 4.5 Transparent

The user should understand why information is requested when the purpose is not immediately obvious.

Examples:

> **Where do you currently live?**
> This helps us show programs available in your area.

> **Age**
> Used to check age requirements for some programs.

The explanation should be short and secondary to the question itself.

---

## 4.6 Accessible

The questionnaire should be designed for users with different levels of digital familiarity, vision, motor ability, reading speed, and comfort with technology.

The goal should not be to claim that literally every age group can use it "flawlessly." A more defensible design objective is:

> **The questionnaire should require minimal digital literacy and remain understandable, readable, and navigable across a broad range of users.**

---

# 5. UX Principles

The following principles govern the implementation.

## 5.1 Visibility of system status

The user must always know where they are.

Recommended header:

```text
Step 1 of 3
Who & Where

●━━━━━━━━○━━━━━━━━○

```

or:

```text
1 of 3 · Who & Where

●━━━━━━━━○━━━━━━━━○

```

The step number and semantic label should be visible together.

---

## 5.2 Recognition rather than recall

Users should choose from visible, understandable options rather than remember or type technical terminology.

Prefer:

> What's your current situation?

over:

> Select your employment classification.

Prefer:

> What are you looking for?

over:

> Select your assistance category.

---

## 5.3 User control and freedom

Users should be able to:

- go back
- change answers
- skip optional questions
- review answers before submitting

The system should never make a user feel trapped in a linear process.

---

## 5.4 Error prevention

Prevent invalid states before submission where practical.

Examples:

- Age should have sensible numeric constraints.
- Dropdowns should only allow supported regions.
- Multi-select controls should clearly support multiple selections.
- Required questions should visibly communicate that they must be answered.

Errors should be explained in context rather than only through a generic alert.

---

## 5.5 Consistency

Use the same interaction pattern for the same type of question.

Examples:

```text
Single-choice questions
→ same selection-card pattern

Multi-select questions
→ same selectable-badge/card pattern

Primary actions
→ same button treatment

Progress
→ same progress component

Status
→ same semantic status system

```

Consistency reduces the amount users need to learn while moving through the questionnaire.

---

## 5.6 Match the user's real-world language

Use everyday language.

Avoid unnecessarily technical labels such as:

- eligibility attributes
- assistance classification
- employment classification
- demographic parameters

Use:

- Where do you live?
- What's your current situation?
- What's your education level?
- What are you looking for?

---

# 6. Final Questionnaire Information Architecture

## 6.1 Entry / Introduction

Purpose:

Explain what the questionnaire is and reduce anxiety before beginning.

Recommended content:

```text
Para Sa Akin?

Find opportunities that may fit you.

3 quick steps · About 1 minute

No sign-up required

[ Get Started ]

```

The "No sign-up required" message is preferable to a generic reassurance because the product does not require account creation in the current MVP scope. The team's feature-freeze specifically excludes accounts.

Avoid:

- lengthy explanations
- legalistic text
- unnecessary instructions
- excessive illustration before the user begins

---

# 7. Step 1 — Who & Where

## 7.1 Purpose

Collect basic contextual information needed to determine which programs may be relevant geographically and by age.

### Question A — Location

User-facing wording:

> **Where do you currently live?**

Supporting text:

> This helps us show programs available in your area.

Recommended control:

```text
┌────────────────────────────────┐
│ 📍 Region IV-A (CALABARZON) ▼ │
└────────────────────────────────┘

```

The implementation should preferably support searching/selecting a region rather than requiring users to scroll through a very long list.

Potential interaction:

```text
Search region...
        ↓
NCR
CAR
Region I
Region II
...

```

Only collect geographic precision actually required by the matching system.

Do not ask for a full street address when region/province/city is sufficient.

---

## 7.2 Question B — Age

User-facing wording:

> **How old are you?**

Recommended input:

```text
[ 20 ]    −   +

```

or a standard numeric field combined with increment/decrement controls.

Supporting text:

> Used to check age requirements for some programs.

The canonical program schema includes age minimum, maximum, and raw requirement text, so age can be directly relevant to matching.

Implementation should prevent nonsensical values.

---

## 7.3 Step 1 behavior

Bottom navigation:

```text
[ Skip what you're unsure about ]       [ Continue → ]

```

Where possible, optional questions may be skipped.

The skip control should not imply that the user can later edit stored account information, because the current MVP does not require persistent accounts.

Preferred supporting copy:

> You can still continue.

or:

> We'll use what you've provided.

Avoid:

> I'll update that later.

---

# 8. Step 2 — Background & Study

## 8.1 Purpose

Collect the user's current situation and education background.

These inputs help determine whether a program's target population overlaps with the user.

---

## 8.2 Question A — Current Situation

User-facing wording:

> **What's your current situation?**

Instruction:

> Choose the one that best describes you.

Recommended large selection cards:

```text
┌──────────────────────────────┐
│ 🎓 Student                   │
│ Currently studying           │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 💼 Working                   │
│ Currently employed           │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 🔎 Looking for work          │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Other                        │
└──────────────────────────────┘

```

The selection should be visually obvious.

A selected card should use multiple cues:

```text
✓ check icon
+ border change
+ background change

```

Do not rely only on color.

---

## 8.3 Question B — Education

User-facing wording:

> **What's your current education level?**

Recommended selection cards:

```text
High school
Senior high school
College
Graduate / higher

```

Exact categories must remain consistent with the backend matching model.

The team schema explicitly supports education levels and preserves raw education requirement text when necessary.

---

# 9. Step 3 — Support Needed

This step should be the fastest and most visually lightweight.

## 9.1 Purpose

Determine what types of opportunities the user is seeking.

User-facing wording:

> **What are you looking for?**

Supporting text:

> Select everything you're interested in.

Recommended multi-select card/badge layout:

```text
┌───────────────────┐  ┌───────────────────┐
│ 🎓 Scholarships   │  │ 🛠 Training       │
└───────────────────┘  └───────────────────┘

┌───────────────────┐  ┌───────────────────┐
│ 💰 Assistance     │  │ 💼 Employment     │
└───────────────────┘  └───────────────────┘

┌───────────────────┐  ┌───────────────────┐
│ 🌱 Livelihood     │  │ 🚀 Entrepreneurship│
└───────────────────┘  └───────────────────┘

```

Selection should be immediate and reversible.

Selected:

```text
┌─────────────────────────┐
│ ✓ 🎓 Scholarships       │
└─────────────────────────┘

```

The system must visually distinguish selected and unselected states without relying solely on color.

---

# 10. Profile Review

After Step 3, display a lightweight confirmation rather than immediately submitting.

Purpose:

- prevent mistaken matches
- give the user control
- show what the system understood
- increase trust

Recommended content:

```text
YOUR PROFILE

📍 Region IV-A
🎂 Age 20
🎓 College student
🎯 Scholarships · Training

[Edit]

```

Each section may expose an edit control.

Primary action:

> **Find opportunities →**

This stage should be visually lighter than the actual questionnaire cards.

---

# 11. Matching Transition

After submission, the frontend sends the collected information to the backend matching endpoint.

Conceptually:

```text
User profile
     ↓
POST /match
     ↓
Matching engine
     ↓
Results

```

The user-facing transition can be:

```text
That's it!

We're finding opportunities
that may fit your profile.

```

Avoid unnecessary long loading animations.

The system should transition into the results experience as soon as practical.

---

# 12. Questionnaire State Model

The frontend should maintain a single form state object.

Example:

```javascript
formData = {
    location: null,
    age: null,
    employment_status: null,
    education_level: null,
    categories_needed: []
}

```

The exact property names must follow the agreed backend contract.

The team's current implementation mapping already identifies:

```text
formData.location
formData.age
formData.employment_status
formData.education_level
formData.categories_needed

```

as the frontend-bound state properties.

---

# 13. Data Mapping

The questionnaire should map directly to the matching payload.

Conceptually:

```text
UI
 ↓
formData
 ↓
validation
 ↓
matching request
 ↓
backend

```

Recommended mapping:

| Questionnaire stepUI elementState |                             |                              |
| --------------------------------- | --------------------------- | ---------------------------- |
| Who & Where                       | Region selector             | `formData.location`          |
| Who & Where                       | Age input                   | `formData.age`               |
| Background & Study                | Status cards                | `formData.employment_status` |
| Background & Study                | Education cards             | `formData.education_level`   |
| Support Needed                    | Multi-select category cards | `formData.categories_needed` |

The frontend should not invent alternate representations unless required by the backend.

---

# 14. Component Model

Components should emerge from the UX rather than be invented before the screens are designed.

Recommended conceptual structure:

```text
QuestionnairePage
│
├── QuestionnaireHeader
│   ├── Brand
│   └── ProgressIndicator
│
├── QuestionnaireStep
│   ├── StepHeader
│   ├── QuestionGroup
│   │   ├── QuestionLabel
│   │   ├── HelperText
│   │   └── Input / SelectionControl
│   └── StepNavigation
│
├── ProfileReview
│
└── ...

```

Likely reusable controls:

```text
ProgressIndicator
QuestionHeader
SingleChoiceCard
MultiChoiceCard
RegionSelector
AgeInput
NavigationControls
ProfileSummary

```

These are implementation abstractions, not necessarily separate pages.

---

# 15. Design System

## 15.1 Philippine-inspired visual identity

The questionnaire should use Philippine flag colors as a **motif**, not as a literal equal distribution of red, blue, yellow, and white across every element.

Recommended hierarchy:

```text
BLUE
Primary identity
Primary buttons
Navigation
Selected states
Links / interactive emphasis

YELLOW
Highlights
Progress
Helpful information
Positive visual accents

RED
Warnings
Critical attention
Important deadlines/issues

WHITE
Main background
Cards
Breathing space
Content surfaces

```

Blue should be the dominant brand/action color.

Yellow should create warmth and optimism.

Red should be used sparingly and semantically.

White should provide visual breathing room.

Do not use red for ordinary selected states because users may interpret red as danger, error, or incorrect input.

---

# 16. Visual Language

The current visual direction uses:

- Filipino cultural illustrations
- Philippine-inspired iconography
- generous white space
- rounded cards
- large controls
- strong blue primary actions
- subtle yellow accents
- carefully controlled red accents
- friendly but professional typography

The Philippine visual motif should communicate:

> Filipino identity + public service + opportunity

It should not become decorative noise.

Illustrations should support context rather than compete with the questionnaire itself.

---

# 17. Accessibility Requirements

Accessibility is a design requirement, not an optional polish item.

## 17.1 Text

- Use readable font sizes.
- Maintain strong text/background contrast.
- Do not communicate essential information using tiny helper text.
- Avoid long paragraphs inside interaction areas.

## 17.2 Touch targets

Interactive controls should be large enough to comfortably select.

Cards should be clickable over their full visible area where appropriate.

## 17.3 Keyboard accessibility

All interactive elements must be reachable and operable through keyboard navigation.

## 17.4 Focus visibility

Keyboard users must have a clear visual indication of the currently focused element.

## 17.5 Color independence

Never rely solely on:

```text
blue = selected
gray = unselected

```

Use:

```text
icon
border
shape
text
color

```

in combination.

## 17.6 Error communication

Errors should appear close to the problematic field.

Bad:

> Invalid form.

Better:

> Enter an age between 1 and 120.

---

# 18. Responsive Design

The questionnaire should work across:

```text
Desktop
Laptop
Tablet
Mobile

```

Mobile should not be treated as a reduced desktop version.

On smaller screens:

```text
Step progress
↓
Question
↓
Answer controls
↓
Navigation

```

should remain visually clear.

Large multi-column answer layouts can collapse into one-column cards on mobile.

Buttons should remain comfortably tappable.

## The team's frontend responsibility explicitly includes responsive design, and the later polish phase includes mobile responsiveness.

# 19. Interaction Rules

## Single-choice controls

Selecting an option:

```text
unselected
    ↓
selected
    ↓
visual confirmation

```

Moving to another option must automatically deselect the previous one.

Where appropriate, selection may advance automatically, but this should only be used when the next action is obvious and the user retains a clear way to go back.

---

## Multi-choice controls

Selecting an item toggles it.

The interface must allow:

```text
select
deselect
select multiple

```

The "Find opportunities" action should remain available when at least one valid category is chosen.

---

## Back behavior

When going back:

- preserve all previous answers
- do not reset the questionnaire
- return to the previous step in the same state

---

## Skip behavior

Skipping an optional question should:

- preserve previously entered information
- store `null`/empty state appropriately
- allow the user to continue
- not imply that the system has permanent profile storage

The backend must be capable of handling incomplete information safely.

---

# 20. Empty and Uncertain States

The questionnaire should not imply that every user fits neatly into the predefined categories.

For unusual cases:

```text
Other
Prefer not to say
Skip

```

may be considered where appropriate.

However, every additional option should have a clear matching behavior.

Do not add an option merely because it looks inclusive if the backend has no meaningful way to process it.

---

# 21. Data Minimization

The questionnaire should only request information that contributes meaningfully to matching.

Do not request:

- full name
- email
- phone number
- exact address
- unnecessary demographic data
- unrelated personal information

unless a future product requirement explicitly requires them.

The current MVP does not include account creation.

A fundamental rule:

> **Every question must earn its place.**

If a field is not used by the matching logic, it should not be requested solely because the data might be "useful someday."

---

# 22. Trust and Responsible Matching

The questionnaire should not imply:

> "We know exactly what you're eligible for."

Instead, the product should communicate:

> **"These programs may be relevant to you."**

This distinction is important because scraped eligibility information can be incomplete or ambiguous.

The team's matching design explicitly includes uncertainty explanations such as requirements needing verification.

The questionnaire therefore begins a chain of **potential matching**, not guaranteed eligibility.

---

# 23. Recommended Microcopy

## Introduction

> **Find opportunities that may fit you.**

> 3 quick steps · About 1 minute

> No sign-up required.

---

## Step 1

> **Who & Where**

> Tell us a little about your location and age.

### Location

> **Where do you currently live?**

> This helps us show programs available in your area.

### Age

> **How old are you?**

> Used to check age requirements for some programs.

---

## Step 2

> **Background & Study**

> Tell us about your current situation.

### Status

> **What's your current situation?**

> Choose the one that best describes you.

### Education

> **What's your current education level?**

---

## Step 3

> **Support Needed**

> **What are you looking for?**

> Select everything you're interested in.

---

## Skip

Preferred:

> **Skip this question**

> You can still continue.

Alternative:

> **Skip what you're unsure about**

> We'll use what you've provided.

---

## Final action

> **Find opportunities →**

Avoid:

> Submit

because "Find opportunities" communicates the result of the action.

---

# 24. Profile Review Copy

Recommended:

> **Your profile**

> Here's what we'll use to find potential matches.

Then:

```text
📍 Region IV-A
🎂 Age 20
🎓 College student
🎯 Scholarships · Training

```

Optional:

> **Edit**

Final CTA:

> **Find opportunities →**

---

# 25. Questionnaire Visual Hierarchy

Each screen should follow roughly this hierarchy:

```text
BRAND / PROGRESS
       ↓
STEP TITLE
       ↓
QUESTION
       ↓
SHORT EXPLANATION
       ↓
PRIMARY INTERACTION
       ↓
OPTIONAL HELPER
       ↓
NAVIGATION

```

Do not allow illustrations, decorative graphics, or secondary information to compete with the question and answer controls.

---

# 26. Information Density

The questionnaire should feel spacious.

Avoid:

- dense tables
- long paragraphs
- multiple nested controls
- unnecessary secondary actions
- excessive icons
- decorative elements inside every card

The interface should have enough white space to clearly distinguish:

```text
Question
from
Answer
from
Navigation

```

---

# 27. Recommended Visual Behavior

The interface should visually communicate state transitions:

### Unselected

Neutral surface, low visual emphasis.

### Hover

Subtle elevation/border adjustment on desktop.

### Focus

Strong visible focus outline.

### Selected

Primary blue border + subtle tinted surface + check indicator.

### Disabled

Lower contrast while preserving readability.

### Error

Red semantic accent + explanatory message.

### Completed

Check indicator and/or progress update.

---

# 28. Animation Principles

Animation should support orientation, not decoration.

Good uses:

- subtle transition between questionnaire steps
- progress movement
- selected-card confirmation
- results loading transition

Avoid:

- long page transitions
- bouncing cards
- excessive parallax
- animated decorative elements near controls
- motion that delays the user's next action

The intended feeling is:

> **fast, calm, confident**

not:

> flashy.

---

# 29. Questionnaire Wireframe Specification

## Screen A — Introduction

```text
┌────────────────────────────────────┐
│ ParaSa'yo                          │
│                                    │
│             Para Sa Akin?          │
│                                    │
│    Find opportunities that may     │
│            fit you.                │
│                                    │
│       3 quick steps · ~1 min       │
│       No sign-up required          │
│                                    │
│          [ Get Started ]           │
└────────────────────────────────────┘

```

---

## Screen B — Step 1

```text
┌────────────────────────────────────┐
│ ParaSa'yo                     1/3  │
│ ●━━━━━━━━○━━━━━━━━○               │
│                                    │
│ Who & Where                        │
│                                    │
│ Where do you currently live?       │
│                                    │
│ [ 📍 Region IV-A (CALABARZON) ▼ ]│
│                                    │
│ This helps us show programs        │
│ available in your area.            │
│                                    │
│ How old are you?                   │
│                                    │
│ [ 20 ]   [ − ] [ + ]              │
│                                    │
│ [ Skip this question ] [Continue]  │
└────────────────────────────────────┘

```

---

## Screen C — Step 2

```text
┌────────────────────────────────────┐
│ ParaSa'yo                     2/3  │
│ ━━━━━━━●━━━━━━━○                  │
│                                    │
│ Background & Study                 │
│                                    │
│ What's your current situation?     │
│                                    │
│ [ 🎓 Student ]                     │
│ [ 💼 Working ]                     │
│ [ 🔎 Looking for work ]            │
│ [ Other ]                          │
│                                    │
│ What's your education level?       │
│                                    │
│ [ High school ]                    │
│ [ Senior high ]                   │
│ [ College ]                       │
│ [ Graduate / higher ]             │
│                                    │
│ [ ← Back ]            [ Continue ] │
└────────────────────────────────────┘

```

---

## Screen D — Step 3

```text
┌────────────────────────────────────┐
│ ParaSa'yo                     3/3  │
│ ━━━━━━━━━●━━━━━━━━                 │
│                                    │
│ Support Needed                     │
│                                    │
│ What are you looking for?          │
│ Select everything you're           │
│ interested in.                     │
│                                    │
│ [ 🎓 Scholarships ] [ 🛠 Training ]│
│ [ 💰 Assistance ] [ 💼 Employment] │
│ [ 🌱 Livelihood ]  [ 🚀 Business ] │
│                                    │
│ YOUR PROFILE                       │
│ 📍 Region IV-A                     │
│ 🎂 Age 20                         │
│ 🎓 College student                │
│ 🎯 Scholarships · Training        │
│                                    │
│ [ ← Back ]   [Find opportunities] │
└────────────────────────────────────┘

```

---

# 30. AI Visualization Prompt Guidance

When generating visual concepts for the questionnaire, the AI should preserve the following design constraints.

## Overall aesthetic

> A modern Philippine public-service web application combining professional SaaS usability with warm Filipino cultural identity. Clean white content surfaces, strong Philippine-inspired blue primary color, controlled red accents, warm yellow highlights, rounded cards, generous whitespace, clear typography, friendly but trustworthy illustrations, responsive desktop-first web UI.

## Cultural motif

Use Filipino visual elements subtly:

- Philippine sun motif
- jeepney
- local architectural silhouettes
- tropical environment
- Philippine geographic cues

Avoid excessive flags, patriotic decoration, or overly literal national imagery.

The product should feel **Filipino**, not like a Philippine flag pasted onto a generic interface.

## Interaction aesthetic

- Large controls
- Large selection cards
- Strong visual hierarchy
- Obvious selected states
- Minimal typing
- Simple icons
- Clear progress
- calm motion
- generous spacing

## Tone

The interface should feel:

```text
Friendly
Accessible
Trustworthy
Modern
Public-service oriented
Filipino
Efficient

```

It should not feel:

```text
Corporate bureaucracy
Government form
Children's game
Overly futuristic
AI chatbot
Financial app

```

---

# 31. AI Visualization Prompt — Base Prompt

Use the following conceptual prompt when generating questionnaire visual concepts:

> Design a high-fidelity responsive web questionnaire for "ParaSa'yo", a Philippine opportunity and public-assistance discovery platform. The interface should feel modern, trustworthy, welcoming, highly accessible, and distinctly Filipino without becoming overly decorative. Use a Philippine-inspired palette: deep blue as the primary UI color, white as the main background and content surface, warm yellow as an accent for progress and helpful information, and restrained red for important attention states. Use subtle Filipino cultural illustrations such as the Philippine sun, jeepney, tropical landscape, or local architecture.
>
> The questionnaire uses a three-step guided flow rather than five separate questions:
>
> 1. Who & Where — current region/location and age.
> 2. Background & Study — current situation/status and education level.
> 3. Support Needed — multi-select categories such as scholarships, training, assistance, employment, livelihood, and entrepreneurship.
>
> Show a clear "Step 1 of 3" progress indicator with both number and semantic title. Use large, high-contrast controls and selection cards that are easy to understand and operate for users with varying levels of digital literacy. Keep text concise. Use recognition rather than recall. Make selected states obvious through multiple cues such as border, background, check icon, and typography rather than color alone.
>
> The interface should feel like answering three short guided sections rather than filling out a form. Include clear Back and Continue controls, optional skip behavior where appropriate, and a lightweight profile review before the final "Find Opportunities" action.
>
> Avoid dense government-form aesthetics, tiny controls, long instructions, excessive decoration, unnecessary fields, excessive animations, and technical terminology.

---

# 32. Implementation Checklist

Before considering the questionnaire complete:

### UX

-  Three-step structure implemented
-  Step purpose is obvious
-  Progress is visible
-  Each question uses plain language
-  Users can go back
-  Answers persist when navigating backward
-  Optional questions can be skipped where appropriate
-  Profile can be reviewed before matching
-  Final CTA says "Find Opportunities" rather than generic "Submit"

### UI

-  Philippine-inspired color hierarchy established
-  Blue used as primary UI identity
-  Yellow used for highlights/progress
-  Red reserved for semantic attention
-  White provides breathing room
-  Selection states are visually obvious
-  Controls have sufficient size
-  Visual hierarchy remains clear without illustrations

### Accessibility

-  Keyboard navigation works
-  Focus states are visible
-  Contrast is sufficient
-  Meaning is never communicated by color alone
-  Controls are screen-reader understandable
-  Touch targets are sufficiently large
-  Error messages are contextual
-  Responsive layout works on mobile

### Data

-  `location` maps to backend schema
-  `age` maps to backend schema
-  `employment_status` maps to backend schema
-  `education_level` maps to backend schema
-  `categories_needed` maps to backend schema
-  Optional/missing values are handled safely
-  Frontend does not invent eligibility information

### Integration

-  Mock data matches actual backend shape
-  Matching endpoint contract is documented
-  Loading state exists
-  Error state exists
-  Empty result state exists
-  Matching results can be rendered from real API data

---

# 33. Final Design Decision

The ParaSa'yo questionnaire should be finalized as a **three-step guided profile matcher**.

```text
WHO & WHERE
Location + Age

        ↓

BACKGROUND & STUDY
Current Situation + Education

        ↓

SUPPORT NEEDED
Opportunity Categories

        ↓

PROFILE REVIEW

        ↓

FIND OPPORTUNITIES

        ↓

MATCHING

        ↓

PERSONALIZED RESULTS

```

The guiding UX principle is:

> **Answer, don't fill out.**

The guiding accessibility principle is:

> **Make the next action obvious.**

The guiding product principle is:

> **Ask only for information that meaningfully improves matching.**

The guiding trust principle is:

> **Show potential relevance, not guaranteed eligibility.**

The guiding visual principle is:

> **Use Philippine identity as a visual language, not as decoration.**

The guiding implementation principle is:

> **Design the experience first, derive components from the experience, then implement the components in React using the agreed backend data contract.**

The questionnaire is therefore not merely a form. It is the **bridge between the user's situation and ParaSa'yo's matching engine**, translating a small amount of understandable user input into the structured information required to retrieve potentially relevant opportunities.