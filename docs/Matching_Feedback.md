# ParaSa’yo Matching Transition & Result Preview

## Continuation of Questionnaire UX/UI Specification

This document defines the UX and UI behavior immediately after the user completes the ParaSa’yo questionnaire.

The design must continue the questionnaire's existing visual language:

- clean, spacious white interface
- strong Philippine-inspired blue as the primary color
- yellow as a restrained accent
- red used only for meaningful attention states
- minimal visual noise
- clear typography
- large, understandable UI elements
- consistent progress and navigation patterns

The matching experience should feel like a **natural continuation of the questionnaire**, not a separate application or loading screen.

---

# 1. Experience Goal

The transition should answer three questions for the user:

> **What is happening?**

> **Why is it happening?**

> **What did ParaSa’yo find?**

The intended experience is:

```text
Questionnaire
      ↓
Find Opportunities
      ↓
Matching / Loading State
      ↓
Match Summary
      ↓
Results

```

The system should feel responsive, calm, and trustworthy.

Avoid making the user feel that the application is "processing mysteriously."

---

# 2. Matching Transition / Loading State

## 2.1 Purpose

The loading state appears after the user presses:

> **Find Opportunities**

It represents the actual matching request being processed by the backend.

It should not be treated as a separate page unless the implementation requires it. Conceptually it is a **temporary application state** between the questionnaire and results.

```text
QuestionnairePage
      ↓
matching = true
      ↓
MatchingTransition
      ↓
matching = false
      ↓
ResultsPage

```

---

# 3. Visual Direction

The loading screen should preserve the same simplicity as the finalized questionnaire.

Do **not** introduce a dramatically different visual style.

Recommended composition:

```text
┌─────────────────────────────────────────────┐
│ ParaSa’yo                              ☀    │
│                                             │
│                                             │
│            Finding your matches             │
│                                             │
│       We're looking for programs            │
│          that may fit your profile.         │
│                                             │
│              [visual indicator]             │
│                                             │
│          Applying your preferences          │
│          Checking relevant programs          │
│                                             │
└─────────────────────────────────────────────┘

```

The screen should remain visually quiet.

---

# 4. Loading Copy

Recommended primary message:

> **Finding your matches...**

Supporting message:

> We're looking for opportunities that may fit your profile.

Avoid technical language such as:

- Querying database
- Running matching algorithm
- Processing API request
- Analyzing eligibility vectors
- AI processing

The user does not need to understand the implementation.

---

# 5. Progress / Activity Messaging

The system may show lightweight activity indicators such as:

```text
✓ Reading your profile
● Finding relevant programs
○ Preparing your matches

```

However, these statuses should correspond to genuine application states.

Do not fabricate a multi-stage technical process simply to make the animation look sophisticated.

The primary goal is to communicate:

> **"Your request is being processed."**

---

# 6. Animation

Animation should be subtle.

Recommended:

- gentle progress movement
- pulsing indicator
- small Philippine sun or ParaSa’yo visual motif
- soft transition into the results

Avoid:

- long cinematic animations
- excessive bouncing
- spinning UI that suggests an error
- forced delays

The result should appear as soon as the actual matching response is available.

---

# 7. Loading Failure State

If the matching request fails, do not leave the user staring at an infinite loader.

Show:

```text
We couldn't find your matches right now.

Your answers are still saved.

[Try again]

```

The user should not need to restart the questionnaire.

This is important:

```text
Matching error
     ↓
Retry
     ↓
reuse existing formData
     ↓
POST /match again

```

The questionnaire state must therefore remain available while matching is in progress.

---

# 8. Match Summary / Result Preview

After the matching request succeeds, introduce a lightweight result reveal before the full results list.

This should **not become another large questionnaire-like page**.

Its purpose is to give the user an immediate understanding of the result.

Recommended structure:

```text
We found 12 opportunities
that may fit your profile.

Based on:

✓ Your location
✓ Your education
✓ Your current situation
✓ Your interests

```

Then transition directly into the results.

---

# 9. Match Summary Visual Hierarchy

The summary should follow:

```text
RESULT COUNT
     ↓
WHAT IT MEANS
     ↓
WHY WE FOUND THEM
     ↓
VIEW RESULTS

```

Example:

```text
┌──────────────────────────────────────┐
│                                      │
│           We found 12                │
│      potential opportunities         │
│          for you.                    │
│                                      │
│  ✓ Location matches                  │
│  ✓ Education matches                 │
│  ✓ Current situation matches         │
│  ✓ Interests match                   │
│                                      │
│        [ See my matches → ]          │
│                                      │
└──────────────────────────────────────┘

```

---

# 10. Terminology: "Potential Match"

Use:

> **Potential Match**

rather than:

> Eligible

or:

> Guaranteed Match

The matching engine is intended to identify opportunities that **may be relevant**, not definitively determine eligibility.

Therefore:

```text
12 potential opportunities

```

is preferable to:

```text
12 opportunities you're eligible for

```

Individual cards may later display:

> **94% Potential Match**

but this must not be presented as a guarantee of eligibility.

---

# 11. Do Not Overuse Match Scores

The summary screen does not need a giant percentage.

Avoid:

```text
94% MATCH

```

because users may interpret the number as a probability of eligibility.

Instead:

```text
12 potential matches

```

Then individual result cards can provide the more detailed match score and explanation.

---

# 12. Match Explanation

The summary should reinforce that matching was based on the user's own answers.

Example:

```text
Based on your profile:

✓ Region IV-A
✓ College student
✓ Looking for training
✓ Interested in scholarships

```

This makes the system's behavior understandable.

The user should feel:

> "It found these because of what I told it."

rather than:

> "The application randomly showed me these."

---

# 13. Recommended Transition Sequence

The complete interaction should be:

```text
STEP 3
Support Needed
      ↓
Profile Review
      ↓
[FIND OPPORTUNITIES]
      ↓
MATCHING STATE
      │
      ├── Success
      │      ↓
      │   RESULT SUMMARY
      │      ↓
      │   RESULTS
      │
      └── Failure
             ↓
        RETRY STATE

```

---

# 14. Results Entry Animation

Once matching completes, the results page can enter with a subtle transition.

Recommended:

```text
summary fades/slides into place
        ↓
result cards appear

```

Avoid excessive animations on every card.

The user's attention should immediately go toward:

1. Number of potential matches
2. Most relevant opportunity
3. Why it matches

---

# 15. Recommended First Results View

The first visible area of the Results page should contain:

```text
ParaSa’yo

12 opportunities may be relevant to you.

Based on:
Location · Education · Situation · Interests

──────────────────────────

TOP MATCH

┌───────────────────────────────┐
│ 94% Potential Match           │
│                               │
│ TESDA Web Development         │
│ Training                      │
│                               │
│ ✓ Region matches              │
│ ✓ Education matches           │
│ ✓ Interest matches            │
│                               │
│ [View program →]              │
└───────────────────────────────┘

```

This lets the user immediately understand the value of the product.

---

# 16. Relationship to Questionnaire Design

The matching transition must visually feel like the **next phase of the same interaction**.

Questionnaire:

```text
Tell us about yourself

```

Matching:

```text
We're finding opportunities for you

```

Results:

```text
Here are opportunities that may fit you

```

The narrative becomes:

```text
TELL US
   ↓
UNDERSTAND YOU
   ↓
FIND
   ↓
SHOW
   ↓
EXPLAIN

```

This should be preserved in both copy and visual design.

---

# 17. Component / State Model

The implementation can remain simple.

Conceptually:

```text
Questionnaire
│
├── formData
│
└── submit()
      ↓
   matching state
      ↓
   MatchingTransition
      ↓
   API response
      ↓
   MatchSummary
      ↓
   Results

```

Suggested React-level components:

```text
MatchingTransition
MatchSummary
MatchReasonList
ResultHeader
OpportunityCard

```

These components should be derived from the UX and remain reusable.

---

# 18. Matching API Relationship

The frontend sends the questionnaire state to the backend.

Conceptually:

```text
formData
   ↓
POST /match
   ↓
Matching Engine
   ↓
JSON response

```

Possible response:

```json
{
  "count": 12,
  "results": [
    {
      "program_id": 42,
      "score": 94,
      "matches": [
        "Location matches",
        "Education matches",
        "Interest matches"
      ],
      "uncertain": []
    }
  ]
}

```

The frontend should display the information rather than independently calculating the match.

The backend remains responsible for matching logic.

---

# 19. Important Loading-State Rules

### Do

- Preserve the user's questionnaire answers.
- Show clear progress/activity.
- Keep messaging simple.
- transition immediately when the response arrives.
- provide retry behavior.
- maintain the same visual language as the questionnaire.

### Avoid

- fake technical processes
- forced delays
- infinite spinners
- unexplained waiting
- destroying the user's answers after failure
- claiming guaranteed eligibility
- overly elaborate animations

---

# 20. Visual Consistency with the Final Questionnaire

Use the same design system:

```text
Primary
→ ParaSa’yo blue

Accent
→ Philippine-inspired yellow

Attention
→ restrained red

Background
→ white / very light neutral

Typography
→ same questionnaire typography

Cards
→ same radius, borders, and spacing

Buttons
→ same primary CTA treatment

```

The match transition should feel like it belongs to the same application.

---

# 21. Optional Cultural Detail

A small Philippine-inspired visual cue can appear in the matching state:

```text
ParaSa’yo sun

```

or a restrained Filipino illustration.

However, keep it subtle.

The questionnaire already establishes the cultural identity. The matching screen should focus on the **transition and anticipation of results**.

---

# 22. Final UX Flow

The finalized experience is:

```text
QUESTIONNAIRE
───────────────────────
Step 1 — Who & Where
Step 2 — Background & Study
Step 3 — Support Needed
Profile Review

          ↓

FIND OPPORTUNITIES

          ↓

MATCHING STATE
───────────────────────
"Finding your matches..."

          ↓

MATCH SUMMARY
───────────────────────
"We found 12 potential
opportunities for you."

✓ Location
✓ Education
✓ Situation
✓ Interests

[See my matches →]

          ↓

RESULTS
───────────────────────
Potential Match
Why it matches
Program details
Official source

```

# Final Design Decision

The matching experience should remain **quiet, short, and purposeful**.

The questionnaire asks:

> **"Who are you and what are you looking for?"**

The loading state says:

> **"We're using that information."**

The match summary says:

> **"Here's what we found and why."**

Then the Results page lets the user explore the actual opportunities.

This keeps the transition understandable without adding unnecessary screens, while maintaining the same clean, non-distractive design direction established by the finalized questionnaire.