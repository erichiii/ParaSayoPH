PARASA'YO / PRODUCT SPECIFICATION

#### PARASA'YO MATCHMAKER

# Product Specification

What ParaSa'yo should do 

##### Purpose

Define the user problem, product scope, expected behavior, trust rules, and measurable acceptance criteria for ParaSa'yo Matchmaker. 

|**Document type**|Product requirements document|
|---|---|
|**Status**|Working implementation baseline|
|**Primary audience**|Project owner, product/design team, engineering team, and AI/coding agents|
|**Version**|1.0  |  22 August 2026|



## Reading guide

This document uses stable decisions from the supplied project material. Statements labelled “Current” describe work documented in the report; “Required” defines the intended implementation baseline; “Open” requires a deliberate project-owner decision before it is treated as final. 

|**Section**|**Use this section to**|
|---|---|
|**1. Product frame**|Understand the problem, promise, users, and outcomes.|
|**2. Scope**|Separate the MVP from intentionally deferred work.|
|**3. Experience requirements**|Implement discovery, matching, details, and source routing.|
|**4. Product rules**|Apply eligibility, freshness, trust, and profile rules consistently.|
|**5. Acceptance & measures**|Decide whether the product is ready to demonstrate or release.|



**Authority:** The project owner has final authority. An explicit project-owner decision supersedes these documents; update affected specifications and interfaces together. 

## 1. Product frame

### 1.1 Problem

Public support and opportunity information in the Philippines is fragmented across government agencies, regional offices, LGUs, universities, foundations, and other organizations. A person often needs to inspect several websites, social posts, and application pages just to learn whether a relevant program exists, whether it is still available, and where to apply. 

### 1.2 Product proposition

**Core promise:** ParaSa'yo Matchmaker is a Filipino-oriented discovery and matching platform for legitimate scholarships, assistance, training, employment, livelihood, and related support programs. It collects a small, optional profile, identifies programs that may fit, explains why they surfaced, and guides the user to the official source. 

**Product principle:** Make the user experience simple because the data and eligibility logic behind it are complex. “You tell us a little about yourself. We do the hard filtering.” 

### 1.3 Desired product qualities

|**Quality**|**Required product expression**|**Avoid**|
|---|---|---|
|**Low effort**|Reach useful results after a short three-step questionnaire or direct browsing.|Long, government-form-like onboarding.|
|**Trust**|Show provider, source, dates/status, requirements, and uncertainty.|Presenting a listing as an official application or a guarantee.|
|**Relevance**|Use the user profile to narrow and order results, then explain the basis.|A black-box score with no interpretable reason.|
|**Forgiveness**|Permit skipping and browsing; use missing information as uncertainty.|Treating unknown input as false or ineligible.|
|**Filipino identity**|Feel locally familiar, friendly, and modern.|Decorative stereotypes or visual noise.|



### 1.4 Primary users and jobs

|**User / context**|**Job to be done**|**Product outcome**|
|---|---|---|
|**Student or learner**|Find scholarships, educational assistance, training, or certification relevant to my situation.|A short list of programs with a clear reason, dates, requirements, and source.|
|**Job seeker / worker**|Find skills, employment, career, or livelihood support without searching every agency site.|A filterable discovery feed that identifies programs that may fit.|
|**Person seeking assistance**|Find legitimate financial, medical, crisis, or local support and verify where to apply.|A trustworthy detail page that distinguishes ParaSa'yo’s summary from official information.|
|**Technical/demo audience**|See that the platform uses reliable public data rather than opaque listings.|Visible source provenance and optional source-health evidence.|



## 2. Scope and boundaries

### 2.1 MVP scope

- **Authoritative program discovery —** Aggregate a focused set of public opportunities from approximately 8– 12 authoritative sources, with an initial emphasis on scholarships, educational assistance, financial/crisis assistance, free training, and youth opportunities. 

- **Normal discovery —** Allow visitors to explore, search, and filter opportunities even without a personalized profile. 

- **Personalized discovery —** Collect location, exact age, current status, education level, and requested categories through a short questionnaire; return a personalized results feed. 

- **Explainable matching —** For every surfaced recommendation, present understandable qualitative reasons such as location, age, education, status, or requested-category alignment. 

- **Official-source routing —** Provide a clear route to the official program or application page wherever one is known. 

- **Data trust signals —** Show provider, program status, deadline when known, source link, and last-checked information when backend support exists. 

### 2.2 Out of scope unless explicitly approved

|**Area**|**Boundary for the current baseline**|
|---|---|
|**Application handling**|ParaSa'yo routes people to official application destinations; it does not represent itself as the issuing agency or replace agency workflows.|
|**Eligibility guarantee**|The product may communicate “likely eligible” or “uncertain,” but does not promise eligibility or approval.|
|**Full national coverage**|The long-term vision spans health, employment, livelihood, housing, disaster, PWD, OFW, agriculture, and more; the MVP should remain source- and category-bounded.|
|**Mandatory profiling**|Personalization is optional. A user must still be able to browse and search.|
|**Unsupported data inference**|Missing provider, deadline, status, or eligibility facts must remain unknown rather than being guessed.|



**Open scope decision:** Confirm whether the launch audience is students only or the broader Filipino supportprogram audience. The current baseline supports the broader audience while maintaining an education-focused MVP. 

## 3. Required user journeys

### 3.1 Normal discovery

|**Step**|**System must enable**|
|---|---|
|**Landing**|Communicate the product’s purpose, trust stance, and paths to Explore or Start Matching.|
|**Explore**|Show a browse/search/filter entry point for available canonical programs.|
|**Opportunity card**|Expose title, provider, category, geography, status/deadline when known, and a meaningful next action.|
|**Program detail**|Explain benefits, requirements, eligibility, coverage, application process, source, and freshness.|
|**Official source**|Send the user to the relevant official program or application page; clearly label the transition.|



### 3.2 Personalized discovery

|**Step**|**Required outcome**|
|---|---|
|**Start Matchmaker**|Set the expectation that the flow is short, optional, and intended to tailor discovery.|
|**Step 1: Who & Where**|Collect region and exact numeric age; users may skip information they do not know.|
|**Step 2: Background & Study**|Collect one current-status choice and one education-level choice from validated taxonomies.|
|**Step 3: Support Needed**|Collect one or more desired categories.|
|**Matching state**|Show brief, real-progress-aware feedback while results are being prepared; do not delay ready data for animation.|
|**Results**|Show tailored programs and editable profile pills; re-query or re-rank after profile changes without restarting the whole flow.|
|**Details and action**|Show why it matched, the information needed to decide, and an official-source CTA.|



**Direct-to-value rule:** Do not insert a standalone review page before results. Profile review happens through editable context pills at the top of the results feed. 

## 4. Product behavior and decision rules

### 4.1 Profile and input rules

|**Rule**|**Required behavior**|
|---|---|
|**Exact age is canonical**|Store and use the entered numerical age. Age chips are shortcuts only; broad ranges must not replace the exact value.|
|**Skipped is unknown**|A user can continue with missing information. The matching layer must retain unknown rather than substituting a negative condition.|
|**Stable concepts**|Profile fields are location, age, employment status, education level, and needed categories. UI labels may change, but normalized IDs must remain stable.|
|**Incremental enrichment**|Add income, school, course, disability, household, skills, or special-status questions only when evidence shows that the field materially improves matching and a policy decision supports it.|
|**Profile editing**|Every displayed profile value can be revised near the results; the refreshed result set must preserve user context.|



### 4.2 Eligibility and confidence rules

|**State**|**Meaning**|**Required user-facing treatment**|
|---|---|---|
|**Likely eligible**|Known profile evidence aligns with structured criteria.|Use qualified, positive language and show the basis; never present as approval.|
|**Uncertain**|A requirement, source fact, or user profile value is missing or ambiguous.|Explain what is unknown and offer a way to refine the profile or read official requirements.|
|**Known conflict**|Known evidence conflicts with a clearly structured requirement.|May omit from personalized results or mark the conflict, according to product strategy; never call missing data a conflict.|
|**Unknown program status**|Availability cannot be reliably determined.|Show “Status unknown” rather than assuming open or ongoing.|



**Non-negotiable:** Unknown must not silently become false. Missing age, location, deadline, provider, or eligibility detail is not evidence of ineligibility, closure, or source authority. 

An optional recommendation may appear only for an open program with sufficient confirmed structured eligibility evidence and no relevant unresolved requirement. It must show its factual basis and must not claim a best/top result, score, rank, percentage, or guarantee.

### 4.3 Trust and source rules

- **Identity —** Always show the provider/agency when known and make the source origin legible. 

- **Separation —** Identify ParaSa'yo text as an aggregated summary; distinguish it from original eligibility and application requirements. 

- **Freshness —** Show last-checked/source metadata when it is available. Do not invent freshness or dates. 

- **Route —** Prefer official national, regional, LGU, or program/application sources. If no official application destination is known, retain source provenance without implying a direct application link. 

- **Legitimacy —** Third-party sources may help discovery but should not receive the same trust treatment as verified authoritative program pages. 

## 5. Functional requirements

|**ID**|**Requirement**|**Acceptance signal**|
|---|---|---|
|**PRD-01**|Provide normal browse/search discovery without requiring questionnaire completion.|A new user can reach and open a program from Explore.|
|**PRD-02**|Provide a three-stage Matchmaker flow with optional answers.|A user can reach results after three cards, including when information is skipped.|
|**PRD-03**|Match against location, age, status, education, and selected categories where structured data supports it.|Results and reasons reflect known profile-to-program comparisons.|
|**PRD-04**|Present qualitative match explanations.|A result can show one or more actual alignment signals; no unsupported numeric score is required.|
|**PRD-05**|Support profile refinement from the results feed.|Editing a profile pill updates matching context without a full onboarding restart.|
|**PRD-06**|Provide detail pages with benefits, eligibility, requirements, coverage, application, source, and status data when available.|Missing fields are communicated as unknown or omitted with no fabrication.|
|**PRD-07**|Provide a clear official-source/application action.|The action identifies the target as an official source when verified.|
|**PRD-08**|Preserve trust under data uncertainty.|The UI does not turn unknown data into certainty, approval, or closure.|



## 6. Success measures and release acceptance

### 6.1 Product measures

|**Measure**|**What it indicates**|**MVP measurement approach**|
|---|---|---|
|**Questionnaire completion to results**|The Matchmaker is short and understandable.|Track completed Step 3 / started Matchmaker; interpret together with skip use.|
|**Time to first useful result**|The product delivers value quickly.|Measure from Start Matching or Explore to first rendered result.|
|**Source CTA rate**|Users can find a credible next action.|Track visits to official application/source destinations.|
|**Profile refinement rate**|Users understand and use the editable matching model.|Track results-to-profile-pill edits and subsequent result refreshes.|
|**Data usefulness**|The data pipeline is producing usable programs.|Monitor processed, duplicate, review, and failure rates per scrape run.|



### 6.2 Product acceptance checklist

- **Discovery —** Both browse and matching paths reach real canonical programs and program detail pages. 

- **Matching —** The three-step flow accepts partial profiles, preserves exact age, and produces explainable qualitative results. 

- **Trust —** Every opportunity clearly identifies provider/source when known; uncertain data is not overstated. 

- **Action —** Detail views route users to an official source or accurately explain that only the source page is available. 

- **Accessibility and device support —** Core tasks work with keyboard, visible focus, assistive labels, reduced motion, and narrow mobile viewports. 

- **Data boundary —** Only validated canonical programs appear in the public discovery surface; raw/review/failed records are not exposed as trusted listings. 

## 7. Open decisions and change control

|**Decision area**|**Current direction**|**Decision needed before scale-up**|
|---|---|---|
|**Audience**|Broader support-program audience is plausible; education is a strong MVP focus.|Confirm audience positioning and initial category coverage.|
|**Question taxonomies**|Concise status, education, and category choices are preferred.|Finalize normalized option IDs against real eligibility rules.|
|**Ranking**|Use explainable qualitative matching.|Approve ranking weights, exclusion policy, and whether any score can be defended.|
|**Freshness**|Surface last-checked data where available.|Define stale-data policy, refresh cadence, and user-facing labels.|
|**Additional profile data**|Only add when it materially improves matching.|Approve evidence, consent, and data-retention policy per field.|



**Change protocol:** When a decision changes, state the old and new direction, reason, affected screens/components, affected data contracts, migration notes, and approval status. Update Product, Design, and Engineering specifications together. 

 

