PARASA'YO / DESIGN SPECIFICATION

#### PARASA'YO MATCHMAKER

# Design Specification

Experience, interface, and interaction baseline 

##### Purpose

A living specification for product experience, visual system, interaction behavior, content structure, and implementation-ready UI requirements. 

## Document Metadata

|**Field**|**Value**|
|---|---|
|**Document type**|Living design specification|
|**Status**|Working implementation baseline|
|**Primary audience**|Project owner, product/design team, engineering team, and AI/coding agents|
|**Version**|1.0|

## Document Control

|**Field**|**Current value**|
|---|---|
|**Status**|Working baseline for implementation preparation|
|**Version**|1.0|
|**Scope**|Landing page, Matchmaker questionnaire, loading state, results experience, opportunity details, design system|
|**Primary audience**|Project owner, designers, frontend engineers, backend engineers, AI/coding agents|
|**Authority**|Project owner has final authority over design/product direction|
|**Revision model**|Living document; approved decisions can be changed intentionally|



## How to read this specification

|**Status**|**Meaning**|
|---|---|
|**DECIDED**|Current intended direction; use as the default implementation target.|
|**RECOMMENDED**|Strong proposal that can still be challenged with evidence.|
|**OPEN / TO VALIDATE**|Deliberately unresolved; do not silently invent a final answer.|
|**PRINCIPLE**|A design rule that should survive changes to individual screens.|
|**CONSTRAINT**|A boundary for accessibility, trust, mobile usability, or implementation consistency.|



**Design authority principle:** This document describes the current approved direction. It is not a permanent contract. The project owner may revise any design decision. Changes should be recorded, their dependencies identified, and downstream implementation updated rather than treating old specifications as immutable. 

## Contents

|**#**|**Section**|
|---|---|
|**1.**|Product Definition and Design Goals|
|**2.**|Design Governance and Change Authority|
|**3.**|Experience Architecture and User Journey|
|**4.**|Landing Page Specification|
|**5.**|Matchmaker Questionnaire Specification|
|**6.**|Results Feed and Profile Editing|
|**7.**|Running Jeepney Matching State|
|**8.**|Opportunity Detail Experience|
|**9.**|Visual Design System|
|**10.**|Component and Interaction Specifications|
|**11.**|Responsive and Accessibility Requirements|
|**12.**|Content and Microcopy Guidelines|
|**13.**|Trust, Eligibility, and Data Communication|
|**14.**|Frontend Data Mapping and Interface Contracts|
|**15.**|Design Handoff Requirements for Engineering/Agents|
|**16.**|Validation and Acceptance Criteria|
|**17.**|Open Questions and Future Decisions|
|**18.**|Decision Log / Revision Template|



## 1. Product Definition and Design Goals

ParaSa’yo Matchmaker is a personalized discovery experience intended to help Filipino users find scholarships, grants, educational assistance, training programs, employment/livelihood opportunities, and other legitimate support programs that fit their profile. The interface should hide the complexity of eligibility filtering while giving users enough context to understand why opportunities were surfaced. 

### 1.1 Core product promise

**Core idea:** Make the user experience simple because the system behind it is complex. The user provides a small amount of information; ParaSa’yo performs the difficult filtering, matching, and organization. 

### 1.2 Primary experience goals

Reduce the effort required to discover relevant programs. 

Avoid government-form-like cognitive overload. 

Respect incomplete knowledge: users may not know every demographic or eligibility field. 

Make matching understandable instead of presenting a black-box recommendation. 

Build trust by clearly surfacing organizations, requirements, dates, and official sources. Feel distinctly Filipino without becoming visually noisy or stereotypical. 

Work well on mobile and constrained devices while remaining polished on desktop. Provide an obvious path from discovery to official application. 

### 1.3 Product personality

|**Trait**|**Desired expression**|**Avoid**|
|---|---|---|
|**Friendly**|Warm copy, rounded cards, approachable illustrations|Childish or overly cartoonish UI|
|**Trustworthy**|Clear source labels, restrained visual hierarchy, transparent eligibility|Overconfident claims|
|**Local**|Subtle Filipino palette/motifs, jeepney and sun as recognizable accents|Flag overload or decorative clichés|
|**Efficient**|Short questionnaire, direct results, editable profile|Long forms and unnecessary confirmation screens|
|**Modern**|Clean typography, generous whitespace, soft cards|Government portal aesthetics|



## 2. Design Governance and Change Authority

The project owner remains the final decision-maker. The specification is a living artifact that records the current state of the design, not an irreversible contract. 

### 2.1 Authority model

The project owner may change, remove, merge, or introduce screens, interactions, branding elements, and product assumptions at any time. 

AI agents and engineering agents should treat the current document as guidance and implementation context, not as a higher authority than an explicit project-owner decision. 

When new evidence conflicts with an existing design choice, surface the conflict and trade-offs before making structural changes. 

### 2.2 Change protocol

Identify the design decision being changed. 

State the new direction explicitly. 

Record the reason when the change affects important architecture or behavior. 

List dependent screens, components, data fields, or user flows that may also need revision. 

Update this specification and any implementation-oriented handoff documents. 

Only then treat the revised choice as the new baseline. 

### 2.3 Decision status vocabulary

|**Status**|**Meaning**|**Agent behavior**|
|---|---|---|
|**DECIDED**|Current approved direction|Implement by default|
|**RECOMMENDED**|Strong proposal not yet locked|Use unless evidence suggests a better approach; flag alternatives|
|**OPEN / TO VALIDATE**|Not finalized|Do not silently invent a decision|
|**DEPRECATED**|Previously used but intentionally replaced|Do not reintroduce without explicit request|



## 3. Experience Architecture and User Journey

1. Landing Page -> Start Matching.
2. Complete the 3-Step Matchmaker: Who & Where, Background & Study, and Support Needed.
3. Show the Running Jeepney / Matching State.
4. Display the Personalized Results Feed with editable profile pills.
5. Open Opportunity Details and continue to the Official Application Source.

### 3.1 Core journey principles

Progressive disclosure: only expose information necessary for the current stage. 

Value before verification overload: get the user to results without forcing an extra review screen. 

Forgiving inputs: missing information reduces confidence instead of automatically excluding programs. Direct manipulation: users can refine their profile from results. 

Explainable output: recommendations should communicate their basis when practical. 

No dead ends: every major state should provide a reasonable next action. 

### 3.2 Information architecture

|**Area**|**Primary purpose**|**Primary action**|
|---|---|---|
|**Landing**|Explain value and establish trust|Start matching|
|**Questionnaire**|Collect high-value profile attributes|Continue / Skip|
|**Matching state**|Communicate progress while matching occurs|Wait / cancel if implemented later|
|**Results**|Present personalized opportunities|Open opportunity / refine profile|
|**Opportunity detail**|Explain opportunity and route to source|Visit official source|



## 4. Landing Page Specification

The landing page should establish the product in seconds, communicate the personalized matching value, and lead users into the Matchmaker without requiring them to understand the underlying data/scraping system. 

### 4.1 Page structure

Top Navigation Hero / Value Proposition How It Works Why It Helps / Trust Opportunity or Category Preview Call to Action Bottom Rack / Structured Footer 

### 4.2 Top navigation

Brand mark / wordmark on the left. 

Primary navigation remains minimal; avoid a dense corporate menu. 

Primary CTA should lead into the Matchmaker. 

Secondary utilities may include About, How it works, or Source/Trust information if needed.

Navigation should remain stable across desktop and mobile, collapsing into a compact menu on narrow screens. 

### 4.3 Hero

The hero should answer three questions quickly: What is this? Why should I care? What should I do next? Primary message: personalized discovery of scholarships, grants, training, and support programs. Primary CTA: begin matching. 

Support line should reassure the user that the process is short and does not require perfect information. Visual direction: modern Philippine-inspired illustration rather than stock photography. 

### 4.4 How it works

|**Step**|**User-facing idea**|**Purpose**|
|---|---|---|
|**1**|Tell us about yourself|Collect location, age, background, and needs|
|**2**|We match you|Explain that the system filters opportunities|
|**3**|Explore what fits|Show a personalized feed with reasons and official sources|



### 4.5 Filipino visual integration

Use Philippine identity as a design language rather than as repeated decoration. Acceptable motifs include a simplified sun, jeepney illustration, subtle geometric/woven patterns, city or heritage silhouettes, palm/tree forms, and small star accents. These should support hierarchy rather than compete with content. 

### 4.6 Bottom rack / structured footer

The footer should feel like the end of a coherent product page rather than an undifferentiated legal block. It can use a structured rack-like composition containing product identity, navigation, source/trust information, and short supporting links. Any decorative Filipino pattern should remain low-contrast and subordinate. 

## 5. Matchmaker Questionnaire Specification

**DECIDED:** Use three structured cards instead of six to seven single-question screens. The target is to halve unnecessary click/transition cost while retaining clear grouping and progressive disclosure. 

### 5.1 Step 1 - Who & Where

Purpose: collect the highest-value geographic and age signals for eligibility filtering. 

|**Element**|**Behavior**|**Notes**|
|---|---|---|
|**Region dropdown**|Large touch-friendly select|Show selected region with location icon; use backend region taxonomy|
|**Age numeric input**|Direct number entry|Exact age should be preserved|
|**Minus button**|Decrease age|Prevent invalid negative / out-of-range states|
|**Plus button**|Increase age|Respect configured maximum|
|**Optional age chips**|Quickly jump to common brackets|Convenience only; exact age remains canonical|
|**Skip**|Continue with missing data|Unknown is not equal to ineligible|
|**Continue**|Validate and advance|Do not over-validate optional fields|



### 5.2 Age design

Broad brackets such as 18-34 and 35-59 were rejected because they are too coarse for Philippine program criteria. Many programs can use narrow age cutoffs. The UI therefore prioritizes exact numeric age while optionally providing quick range chips such as: Under 18, 18-21, 22-25, 26-30, 31-59, and 60+. 

### 5.3 Step 2 - Background & Study

Use a card/grid interaction rather than a long sequence of dropdowns. 

|**Group**|**Example choices**|**Interaction**|
|---|---|---|
|**Current status**|Student, Employed, Self-employed, Unemployed, Looking for work, Other|Single select cards|
|**Education level**|Junior High, Senior High, College, Graduate/Postgraduate, Vocational/Technical, Out of school, Other|Single select cards|



Final option taxonomy remains subject to validation against actual backend eligibility rules. 

### 5.4 Step 3 - Support Needed

Use multi-select category badges/chips. Example categories include Scholarship, Financial Assistance, Education Support, Skills Training, Employment, Entrepreneurship, Livelihood, Certification/TESDA, and Other Government Assistance. 

### 5.5 Skip behavior

**PRINCIPLE:** Unknown information should weaken confidence, not silently become false. A missing age or location must not cause a blanket “no results” state if other evidence can still identify useful opportunities. 

### 5.6 Progress indicator

Step 1 of 3 1 ───────── 2 ───────── 3 Who & Where    Background    Support 

Current step visually emphasized. 

Completed steps can be visually distinguished.

Labels should be readable but not dominate the questionnaire. 

### 5.7 Action area

[ Skip for now ]                                      [ Continue → ] 

Continue is the primary action. 

Skip is visually secondary but easy to find. 

Do not hide skip behind a tiny link or overflow menu. 

## 6. Results Feed and Profile Editing

The Results Feed is where the product should deliver the first major “aha” moment: the user sees opportunities that appear relevant to them, not an undifferentiated directory. 

### 6.1 No standalone review page

**DECIDED:** After Step 3, route directly to results. Replace the former review page with an editable profile summary pinned at the top of the feed. 

### 6.2 Profile pill bar

Your Profile [ ✎ ✎ Manila 🎓 ] [ 20 years old   ✎ ] [ 💰 College   ✎ ] [ Scholarship   ✎] 

Each pill can open the corresponding edit control. 

Editing should avoid losing the current results context unnecessarily. 

After change, the system can refresh or re-rank results. 

### 6.3 Result card anatomy

|**Element**|**Purpose**|
|---|---|
|**Program title**|Primary recognition|
|**Provider / agency**|Trust and source identification|
|**Category**|Quick classification|
|**Location**|Regional relevance|
|**Match explanation**|Why this opportunity surfaced|
|**Eligibility signal**|Eligible / Uncertain / other supported state|
|**Deadline / status**|Time sensitivity|
|**Primary action**|View details / official source|



### 6.4 Ranking and explanation

The exact ranking algorithm remains an engineering decision, but the UI should support explainability. A “Why this matched” area can summarize positive signals such as location, age, student status, education level, and requested category. Avoid presenting a precise numerical match score unless the underlying model can justify it consistently. 

## 7. Running Jeepney Matching State

**DECIDED:** Keep the custom running-jeepney loading state. It is a signature moment that makes the matching process feel intentional and distinctly local. 

### 7.1 State composition

Centered or visually dominant jeepney illustration. 

Primary status: “Finding your best matches...” or equivalent. 

Rotating status messages may mention real system stages without exposing unnecessary technical jargon. 

Optional subtle progress or motion cues should reassure without implying a false percentage. 

### 7.2 Suggested status copy

Filtering CHED scholarships... Matching TESDA programs... Checking regional opportunities... Comparing eligibility requirements... 

Finding opportunities for you... 

### 7.3 Motion principles

Motion should be playful but brief. 

Do not trap users in a long animation if the data is ready. 

Provide reduced-motion compatibility for accessibility. 

## 8. Opportunity Detail Experience

The detail page bridges recommendation and action. It should make it easy to judge whether an opportunity is worth pursuing and then route the user to the legitimate source. 

### 8.1 Information hierarchy

Program name and provider 

What the program offers Why it may fit the user 

Eligibility requirements 

Important dates / status

Location / coverage 

What the user needs to prepare 

Official application link 

Source metadata / last checked state, where available 

### 8.2 Trust rules

Primary application CTA should point to the official source when possible. 

Do not imply ParaSa’yo is the issuing agency unless that is actually true. 

Clearly distinguish scraped/aggregated information from official requirements. 

Where data may be stale or ambiguous, communicate uncertainty rather than masking it. 

## 9. Visual Design System

### 9.1 Typography

The current generated visual direction uses a rounded modern sans-serif aesthetic. The exact generated font is not guaranteed to correspond to a real production font. 

|**Role**|**Preferred**|**Weight**|
|---|---|---|
|**Headings**|Plus Jakarta Sans|600-700|
|**Body**|Plus Jakarta Sans|400-500|
|**UI labels**|Plus Jakarta Sans|500-600|
|**Buttons**|Plus Jakarta Sans|600|
|**Alternative**|Poppins|400-700|



Poppins is the closest visual alternative to the generated reference. 

Avoid mixing many typefaces. A single family with weight hierarchy is preferred. 

### 9.2 Color direction

|**Role**|**Direction**|**Usage**|
|---|---|---|
|**Primary blue**|Strong modern blue|CTA, selection, links, progress|
|**Accent red**|Philippine-inspired red|Brand accent and limited emphasis|
|**Warm yellow**|Sun/highlight yellow|Decorative support, illustration accents|
|**Dark navy**|Deep text/navigation neutral|Headings, strong text|
|**Off-white**|Light neutral|Page background / surfaces|
|**White**|Clean surface|Cards and input controls|
|**Gray**|Muted neutral|Helper text, borders, metadata|



**Color restraint:** Do not apply the full Philippine flag palette to every component. Large areas should remain neutral so blue, red, and yellow retain meaning and do not create visual fatigue.

### 9.3 Surface and shape language

Rounded cards with soft shadows or subtle elevation. 

Generous padding and spacing. 

Clear borders on form controls where needed. 

Avoid excessive glassmorphism, hard gradients, or overly decorative containers. 

### 9.4 Illustration language

Simplified vector forms. 

Friendly geometry. 

Limited detail. 

No visual competition with key form/result content. 

### 9.5 Filipino motifs

|**Motif**|**Preferred use**|**Do not**|
|---|---|---|
|**Jeepney**|Loading state, small supporting illustration|Repeat it on every screen|
|**Philippine sun**|Brand/hero accent|Turn it into a dominant background pattern|
|**Woven/geometric pattern**|Subtle texture in background/footer|Use dense high-contrast pattern behind forms|
|**City/heritage silhouette**|Hero/supporting scene|Create visually busy full-page illustrations|
|**Stars**|Tiny identity accent|Scatter them across every component|



## 10. Component and Interaction Specifications

### Brand / wordmark

Readable at small sizes; “ParaSa’yo” should remain the dominant brand expression. 

### Primary button

High-contrast; clear action verb; large touch target; disabled state must remain understandable. 

### Secondary button

Lower visual weight; used for skip/back/cancel. 

### Dropdown

Large hit area; selected value visible; keyboard accessible. 

### Numeric age control

Direct entry + minus/plus; preserves exact value. 

### Radio card

Whole card can be clickable; selected state obvious through border/background/icon. 

### Multi-select chip

Clear selected/unselected state; support wrap on narrow screens. 

### Profile pill

Compact, editable; must not obscure key result content on mobile. 

### Opportunity card

Consistent anatomy; prioritize title, provider, match rationale, action. 

### Status badge

Use semantic states consistently; avoid color-only meaning. 

### Progress indicator

Shows 1/3, 2/3, 3/3; accessible text should not rely solely on visual state. 

### Loading illustration

Jeepney with controlled motion and textual status. 

### Inline info callout

Used for skip/uncertainty/trust explanations; should not dominate. 

### 10.1 Interaction states

|**State**|**Required behavior**|
|---|---|
|**Default**|Clean, unambiguous control appearance|
|**Hover**|Subtle feedback on pointer devices|
|**Focus**|Visible keyboard/focus indicator|
|**Selected**|Strong but controlled visual confirmation|
|**Disabled**|Clearly unavailable without becoming illegible|
|**Error**|Specific message explaining how to recover|
|**Loading**|Indicates ongoing action without pretending to show exact progress|



## 11. Responsive and Accessibility Requirements

### 11.1 Responsive behavior

Desktop: centered questionnaire card with sufficient whitespace and supportive illustration. 

Tablet: reduce decorative margins while keeping the card hierarchy. 

Mobile: stack form controls, convert multi-column option grids into responsive rows, keep action area reachable, and preserve progress context. 

Do not rely on hover interactions for any primary task. 

### 11.2 Touch targets

Primary interactive controls should be comfortably tappable. 

Age minus/plus controls must remain separated enough to avoid accidental taps. 

Chips should have sufficient horizontal/vertical padding rather than functioning as tiny text links. 

### 11.3 Accessibility

Do not encode meaning by color alone. 

Maintain sufficient contrast between text and background. 

Keyboard focus must be visible. 

Form controls require programmatic labels. 

Illustrations should have useful alternative descriptions when informational; decorative imagery should be marked decorative. 

Respect reduced-motion preferences for the jeepney animation and other transitions. 

## 12. Content and Microcopy Guidelines

Use plain, conversational English unless Filipino/Taglish improves clarity or product identity. 

Keep questions short and concrete. 

Explain why a question is being asked when that context reduces uncertainty. 

Avoid bureaucratic phrasing such as “hereby,” “applicant shall,” or dense policy language in the user flow. 

Use action-oriented buttons: Continue, See matches, View program, Apply at official site. 

Avoid “Submit” when the action is actually progression to matching. 

### 12.1 Approved/reference questionnaire copy

|**UI**|**Reference copy**|
|---|---|
|**Step heading**|Let’s get to know you|
|**Supporting line**|This helps us match you with scholarships, grants, and programs that fit your profile.|
|**Location label**|Where do you currently reside?|
|**Location helper**|We’ll show programs available in your area.|
|**Skip helper**|You can skip any question if you’re not sure. We’ll still show you relevant results.|
|**Primary action**|Continue →|
|**Secondary action**|Skip for now|



## 13. Trust, Eligibility, and Data Communication

### 13.1 Eligibility states

|**State**|**Meaning**|**UI implication**|
|---|---|---|
|**Eligible / likely eligible**|Known criteria align with available profile|Positive but not overclaiming language|
|**Uncertain**|Information is missing or ambiguous|Explain what is unknown; invite profile refinement|
|**Not eligible**|Known criteria clearly conflict|Can be shown as excluded or omitted depending on product strategy|



### 13.2 Uncertainty rule

**NON-NEGOTIABLE PRINCIPLE:** Unknown must not be silently converted to false. A missing profile field should not automatically eliminate an opportunity. 

### 13.3 Source communication

Show who provides the opportunity. 

Make official sources easy to identify. 

Distinguish ParaSa’yo summaries from the issuing organization’s original requirements. 

Where freshness is important, surface dates/last-checked metadata where the backend can support it. 

## 14. Frontend Data Mapping and Interface Contracts

|**Wizard step**|**UI**|**State property**|
|---|---|---|
|**Step 1: Identity**|Region dropdown + age numeric input|formData.location, formData.age|
|**Step 2: Background**|Status + education card grid|`formData.employment_status`, `formData.education_level`|
|**Step 3: Goals**|Multi-select badges|formData.categories_needed|



### 14.1 Conceptual profile object

```js
formData = { location, age, employment_status, education_level, categories_needed }
```

Future fields such as income range, school, course, disability status, family status, employment type, skills, or special eligibility should only be added when they clearly improve matching and are supported by evidence and policy decisions. 

### 14.2 Component-to-state rule

UI labels should correspond to stable domain concepts, not arbitrary display strings. 

Frontend values should use normalized IDs where possible rather than relying on display names. 

Validation should distinguish missing, invalid, and unknown values. 

## 15. Design Handoff Requirements for Engineering / AI Agents

Before implementation, the design should be translated into implementation-ready artifacts. The goal is to prevent coding agents from repeatedly rediscovering product decisions. 

### 15.1 Handoff package

This design specification. 

Page-by-page wireframes or final UI mockups. 

Design tokens: colors, typography, spacing, radii, shadows. 

Component inventory and states. 

Responsive rules per page/component. 

Content/microcopy reference. 

Frontend state and backend field mapping. 

Acceptance criteria for each major flow. 

Known open questions and explicit assumptions. 

### 15.2 Agent responsibilities

|**Agent role**|**Primary responsibility**|**Do not**|
|---|---|---|
|**Design/research agent**|Explore alternatives and validate decisions|Silently override approved direction|
|**Planning agent**|Break approved design into implementation tasks|Invent product requirements|
|**Frontend agent**|Implement UI and interaction behavior|Redesign UX without authorization|
|**Backend/data agent**|Implement contracts, matching, ingestion|Assume unknown = ineligible|
|**QA/review agent**|Test against acceptance criteria and visual reference|Rewrite design during QA|



### 15.3 Agent prompt principle

**Recommended instruction:** Treat the specification as the current source of truth. When an explicit projectowner instruction conflicts with the document, the explicit instruction wins; update the affected specification section and identify downstream impact. 

## 16. Validation and Acceptance Criteria

### 16.1 Questionnaire acceptance criteria

User can understand that the Matchmaker takes three stages at a glance. 

User can complete Step 1 with region and exact age without hunting for controls. 

User can skip missing information and still proceed. 

User sees clear selected/unselected states on Step 2 and Step 3. 

No standalone review screen blocks access to results. 

Results provide an editable profile summary. 

Editing profile data does not require restarting the entire experience. 

Jeepney matching state appears during actual processing but does not delay ready results unnecessarily. 

### 16.2 Visual acceptance criteria

Typography hierarchy is obvious without excessive bolding. 

Primary CTA is visually dominant without overwhelming the interface. 

Filipino cues are noticeable but not distracting. 

Cards, spacing, and controls look coherent across pages. 

Mobile layouts do not create horizontal scrolling. 

Illustrations support the content rather than compete with it. 

### 16.3 Trust acceptance criteria

Official source is easy to identify. 

Uncertain eligibility is not presented as guaranteed eligibility. 

Missing data never silently means “not eligible.” 

Opportunity detail distinguishes summary information from official program requirements. 

## 17. Open Questions and Future Decisions

|**Area**|**Open question**|**Current direction**|
|---|---|---|
|**Target audience**|Students only or broader Filipino population?|Broader support-program audience is currently plausible; validate|
|**Step 2 taxonomy**|Exact status/education choices?|Use concise card groups; validate against actual rules|
|**Step 3 taxonomy**|Exact category set?|Multi-select opportunity categories; validate|
|**Results ranking**|Exact algorithm?|Explainable matching; implementation open|
|**Match score**|Numeric score or qualitative state?|Prefer interpretable qualitative state unless score is defensible|
|**Freshness**|How to expose stale data?|Last-checked/source metadata where available|
|**Additional fields**|Should income/school/course/etc. be added?|Only if they materially improve matching|
|**Scraper architecture**|Exact self-healing design?|Research/engineering phase|



## 18. Decision Log / Revision Template

Use this section as the project evolves. The purpose is not bureaucracy; it is to prevent future agents and collaborators from misunderstanding why the design changed. 

|**Date**|**Area**|**Old decision**|**New decision**|**Reason / evidence**|**Impact**|
|---|---|---|---|---|---|
|**YYYY-MM-DD**|Example: Questionnaire|6-7 screens|3 cards|Reduce click fatigue|Update flow + UI specs|
|**YYYY-MM-DD**|Example: Results|Standalone review|Editable profile on results|Faster access to value|Update results architecture|



### 18.1 Change request template

**CHANGE REQUEST Area: Current decision: Proposed change: Reason: Evidence / research: Affected screens/components: Affected data contracts: Migration / implementation notes: Decision status: OPEN / APPROVED / REJECTED** 

### 18.2 Final design baseline checklist

Landing page structure approved. 

Typography selected and available for production. 

Color tokens defined.

Questionnaire screens approved for all three steps. Results feed anatomy approved. Opportunity detail hierarchy approved. Responsive layouts defined. Accessibility rules included. Microcopy reviewed. Engineering handoff package prepared. Open questions clearly separated from decisions. 

## Appendix A - Current Design Snapshot

PARASA’YO MATCHMAKER 

Landing → explain the value → start matching 

Step 1: WHO & WHERE → region → exact age 

Step 2: BACKGROUND & STUDY → current status → education level 

Step 3: SUPPORT NEEDED → multi-select needs/categories 

Matching → running jeepney → “Filtering CHED scholarships...” 

Results 

→ editable profile pills → personalized opportunity cards → why this matched → official sources 

Opportunity Detail → requirements → dates/status → official application CTA 

## Appendix B - Design north star

**North star:** ParaSa’yo should feel like a modern Filipino recommendation product that happens to handle complex scholarship, assistance, training, and eligibility data. The interface earns trust by being simple, clear, transparent, and locally resonant - not by being bureaucratic or visually overloaded. 

 

