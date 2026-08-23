PARASA'YO / ENGINEERING SPECIFICATION

#### PARASA'YO MATCHMAKER

# Engineering Specification

How ParaSa'yo should be built 

##### Purpose

Define a secure, traceable path from public source collection to validated program data, matching APIs, and the ParaSa'yo user experience. 

|**Document type**|Technical design document|
|---|---|
|**Status**|Working implementation baseline|
|**Primary audience**|Project owner, product/design team, engineering team, and AI/coding agents|
|**Version**|1.0  |  22 August 2026|



## Reading guide

This document uses stable decisions from the supplied project material. Statements labelled “Current” describe work documented in the report; “Required” defines the intended implementation baseline; “Open” requires a deliberate project-owner decision before it is treated as final. 

|**Section**|**Use this section to**|
|---|---|
|**1. Architecture baseline**|Separate the documented current backend from required product-facing additions.|
|**2. Data model**|Implement canonical program data, provenance, and profile contracts.|
|**3. Pipeline**|Ingest, normalize, validate, deduplicate, and observe scraper output.|
|**4. Matching & APIs**|Serve browse, details, and explainable personalized results.|
|**5. Quality & operations**|Protect data, test safely, and operate source health visibly.|



**Authority:** The project owner has final authority. An explicit project-owner decision supersedes these documents; update affected specifications and interfaces together. 

## 1. Engineering goals and decision status

ParaSa'yo is a public-program discovery system. Its technical design must favor accuracy, traceability, and defensible presentation over filling every field or asserting certainty. The user experience is consumer-simple, but the system must retain raw evidence and processing history behind every public program record. 

|**Status**|**Meaning in this document**|
|---|---|
|**Current**|Explicitly documented as implemented in the supplied backend report; retain unless intentionally changed.|
|**Required MVP**|Needed to satisfy the product and design specifications; build or confirm before release.|
|**Recommended**|A strong engineering choice that may be refined with evidence.|
|**Open**|Not settled; do not silently substitute an implementation detail for an approval.|



### 1.1 Current backend baseline

The report documents a FastAPI backend using Pydantic for structural validation, the Supabase Python client, and Supabase PostgreSQL. Raw scraper output is kept in a staging table; canonical programs are promoted only after normalization, validation, quality checks, and deterministic duplicate detection. 

|**Layer**|**Current documented capability**|**Required boundary**|
|---|---|---|
|**Collection**|Bright Data collection/Scraper Studio outputs public program JSON.|Collectors are untrusted input producers, not the canonical authority.|
|**Backend**|FastAPI routes for health, ingest, processing, programs, and scrape-run metrics.|Routes must not expose credentials, raw unpublished records, or admin mutations to the public client.|
|**Validation**|Pydantic structural validation, canonical category/status checks, and quality routing.|Maintain raw input and explain every non-promotion outcome.|
|**Database**|Supabase PostgreSQL with JSONB for complex program structures and provenance links.|Use constraints/indexes and server-side access controls appropriate to each route.|
|**Frontend**|Design specifies browse, Matchmaker, results, and details.|Consume stable API contracts and normalized IDs, not raw scraper labels.|



**Security baseline:** Credentials, API tokens, service-role keys, and source-platform secrets belong only in deployment secret stores or local environment files excluded from version control. They must never appear in frontend bundles, logs, screenshots, example payloads, or public documentation. 

## 2. System architecture

### 2.1 Required flow

|**Stage**|**Responsibility**|**Output / invariant**|
|---|---|---|
|**1. Collect**|Retrieve public program pages and extract scraper-shaped JSON.|Capture source URL, source timestamp, and original object; do not invent values.|
|**2. Ingest**|Accept batches and create a scrape-run record.|Every received object becomes an immutable raw staging record with a processing state.|
|**3. Normalize**|Map aliases, whitespace, categories, lists, nested fields, status, and date forms.|Produce a candidate canonical shape while preserving raw evidence.|
|**4. Validate**|Apply structural and quality checks.|Route each record to processed, needs_review, duplicate, or failed.|
|**5. Promote**|Insert new validated canonical programs.|Every public program links to its source raw record.|
|**6. Serve**|Expose public browse/detail/match data and admin monitoring data separately.|Public responses contain only approved canonical fields.|
|**7. Observe**|Compute metrics and detect extraction anomalies.|Source/run health is traceable and actionable.|



### 2.2 Component responsibilities

|**Component**|**Responsibilities**|**Must not do**|
|---|---|---|
|**Collector / scraper**|Discover relevant pages; extract facts and raw text; identify source page.|Guess missing facts or force all sources into a perfect schema.|
|**Ingestion service**|Store raw payloads, create scrape runs, assign metadata.|Promote raw objects directly to public programs.|
|**Normalization service**|Map aliases and normalize formats into canonical semantics.|Erase raw text that is needed for traceability.|
|**Validation service**|Verify structural constraints and quality gates.|Treat optional information as mandatory or translate null to a fabricated default.|
|**Duplicate service**|Recognize repeated observations through deterministic rules.|Delete duplicate raw observations or lose linkage to the existing program.|
|**Matching service**|Compare known profile signals with structured criteria and generate reasons.|Claim eligibility from incomplete/unstructured evidence.|
|**Public API**|Serve safe, stable, canonical views.|Expose raw JSON, review queues, service credentials, or internal operational details.|



**Self-healing definition:** Self-healing is a data-quality capability, not merely retrying HTTP failures. A source change should be detectable through extraction/validation metrics, diagnosable with preserved raw evidence, repairable in the collector, and verifiable by a subsequent healthy run. 

## 3. Data model and canonical contracts

### 3.1 Data representation rules

- **Unknown scalar —** Use null. Null means unknown, absent, or not reliably stated; it does not mean false. 

- **No list values —** Use an empty array when no values were extracted; do not use placeholder strings. 

- **Raw eligibility —** Keep original eligibility wording in raw_text and other_requirements alongside structured fields. 

- **Field discipline —** Put documentary evidence in requirements; conditions the applicant must meet in eligibility; do not confuse citizenship with residency. 

- **Source authority —** A scraper-shaped object is not trusted merely because it was extracted. Canonical records retain source URL and last verification time. 

### 3.2 Canonical program contract (program.v0.1)

|**Field group**|**Contract**|**Notes**|
|---|---|---|
|**Identity**|title: required string; provider: string or null; category: required canonical string; description: string or null.|Title/category cannot be blank. Provider is not guessed.|
|**Coverage**|coverage.type: nationwide, regional, provincial, city, municipal, district, or unknown; locations: string[].|Unknown coverage is type=unknown and locations=[].|
|**Eligibility**|age, education, employment, income, residency, other_requirements; each structured group retains raw_text where relevant.|Structured values enable matching; raw text preserves nuance.|
|**Benefits & requirements**|benefits: string[]; requirements: string[].|Do not conflate benefits, conditions, advice, and documents.|
|**Application**|start_date, deadline, process, url; each nullable.|Dates use YYYY-MM-DD; unknown deadline is null.|
|**Source & status**|source.url; source.last_verified_at; status: open, ongoing, upcoming, closed, or unknown.|Never infer open/ongoing solely from absent deadline.|



### 3.3 Frontend profile contract

|**Property**|**Type / normalization**|**Product use**|
|---|---|---|
|**location**|nullable canonical geographic ID|Coverage/residency alignment and regional discovery.|
|**age**|nullable integer with bounded client/server validation|Exact comparison to age_min and age_max.|
|**employment_status**|nullable normalized ID|Employment eligibility alignment.|
|**education_level**|nullable normalized ID|Education eligibility alignment.|
|**categories_needed**|array of normalized category IDs|Intent and category ranking signal.|



**Contract rule:** The frontend submits normalized IDs and uses display labels from controlled taxonomies. Do not base matching on arbitrary UI strings or scraper-provided labels. 

## 4. Database and provenance

### 4.1 Required tables

|**Table**|**Key fields**|**Purpose**|
|---|---|---|
|**scrape_runs**|id, source, started_at, completed_at, status, records_received, processed_count, duplicate_count, needs_review_count, failed_count.|Groups each ingestion run and supports source/run health metrics.|
|**raw_scraped_records**|id, source_url, scraped_at, raw_data JSONB, processing_status, processing_error, scrape_run_id, duplicate_of_program_id, created_at.|Immutable staging and audit layer for all received extraction output.|
|**programs**|id, identity fields, canonical JSONB groups, status, raw_record_id, created_at, updated_at.|Validated canonical programs served to product experiences.|



### 4.2 Integrity and retention rules

- **Traceability —** programs.raw_record_id references the raw record that produced the canonical program; raw records link to scrape runs. 

- **Processing states —** raw_scraped_records.processing_status supports pending, processed, needs_review, failed, and duplicate. 

- **Duplicate trace —** A duplicate raw observation is preserved and linked through duplicate_of_program_id rather than deleted. 

- **Atomic promotion —** Insert a canonical program successfully before marking its raw record processed; record a failure reason if promotion cannot complete. 

- **Indexes —** Index processing status, scrape_run foreign keys, duplicate linkage, program category, program status, raw_record_id, and API query/filter keys. 

- **Access control —** Public clients may read approved program views only. Ingestion, processing, review queues, raw data, and metrics administration require protected service access. 

## 5. Ingestion, normalization, validation, and deduplication

### 5.1 Ingestion contract

|**Operation**|**Required behavior**|**Response minimum**|
|---|---|---|
|**POST /api/ingest**|Accept a batch of scraper-shaped objects via authenticated server-to-server callers. Create one scrape_run per request, store raw_data untouched, and set each record pending.|records_received, records_inserted, inserted_ids, scrape_run_id.|
|**POST /api/process**|Process only pending records. Normalize, structurally validate, quality-check, deduplicate, classify, and update run metrics.|records_checked, processed, duplicates, needs_review, failed.|
|**Process retry**|Do not reprocess already classified raw records silently. Explicit retry/requeue must retain history and be authorized.|Recorded operator/audit reason if implemented.|



### 5.2 Normalization requirements

- **Aliases —** Map independently produced scraper field aliases into the canonical field names at the backend boundary. 

- **Strings —** Trim whitespace and normalize safe formatting without overwriting raw evidence. 

- **Categories —** Normalize source variants to the canonical set: scholarship, financial_assistance, medical_assistance, crisis_assistance, disaster_assistance, transportation_assistance, burial_assistance, ofw_assistance, training, other.

- **Lists and nesting —** Normalize scalar/list representation while retaining the required nested coverage, eligibility, application, and source structures. 

- **Status —** Normalize only supported values. Unknown or absent status becomes unknown, not open. 

### 5.3 Validation and processing outcomes

|**Outcome**|**Conditions**|**Persistence behavior**|
|---|---|---|
|**processed**|Valid normalized structure, known provider, usable description, valid HTTP(S) source URL, supported status/category, not duplicate.|Insert canonical program; retain raw record and provenance; clear error.|
|**needs_review**|Structurally representable but provider/source/description/status quality gate fails.|Keep raw record only; write explicit processing_error; do not publish.|
|**failed**|Missing/blank title, missing/blank/unsupported category, incompatible structure, or promotion failure.|Keep raw record and failure reason; do not publish.|
|**duplicate**|Valid observation matches an existing canonical program by deterministic criteria.|Keep raw record and set duplicate_of_program_id; do not create a second canonical row.|



### 5.4 Duplicate detection

**MVP rule:** Current documented matching is deterministic: exact source.url is the strongest signal; normalized title plus normalized provider is a secondary signal. Preserve this conservative rule for the MVP. Any future fuzzy matching must be explainable, reviewable, and protected against accidental program merges. 

## 6. Matching engine

### 6.1 Matching policy

|**Signal**|**Comparison**|**Effect**|
|---|---|---|
|**Category intent**|profile.categories_needed vs program.category.|Positive ranking signal; no assumption when the profile has no selected categories.|
|**Location**|profile.location vs coverage and explicit residency eligibility.|Positive alignment; conflicting known residency can be a negative/exclusion signal; unknown is uncertain.|
|**Age**|exact profile.age vs eligibility.age.min/max.|Positive within known range; known out-of-range may be excluded/flagged; absent program/profile age is not negative.|
|**Education**|normalized profile.education_level vs eligibility.education.levels.|Positive when aligned; no penalty when program has no structured education rule.|
|**Employment**|normalized profile.employment_status vs eligibility.employment.statuses.|Positive when aligned; absent data remains uncertain.|
|**Freshness/status**|program.status and source.last_verified_at.|Filtering/display decision, not proof of eligibility. Closed can be deprioritized or excluded.|



### 6.2 Result contract

|**Field**|**Purpose**|
|---|---|
|**program**|Canonical public program summary, with no raw staging/internal data.|
|**match_state**|Qualitative state such as likely_eligible, uncertain, or known_conflict where evidence supports it.|
|**reasons[]**|Short reason objects containing a stable signal ID and user-readable copy; only emit facts backed by program + profile data.|
|**unknown_requirements[]**|Optional concise list of missing/ambiguous signals that limit confidence.|
|**source_meta**|Source URL, provider/authority label, last_checked, and application URL only when safe and known.|



**No black box:** Do not expose a precise percentage match unless the algorithm, calibration, and explanation model can justify it consistently. Qualitative state plus actual reasons is the MVP baseline. 

### 6.3 Required match APIs (MVP proposal)

|**Method / route**|**Role**|**Notes**|
|---|---|---|
|**GET /programs**|Public browse/search/filter list of canonical programs.|Paginate; allow only controlled filters/sorts; default to non-closed according to product policy.|
|**GET /programs/{id}**|Public program detail.|Return canonical detail, provenance metadata safe for users, and official application/source links.|
|**POST /api/match**|Compute qualitative, explainable matches from a transient profile payload.|Validate approved profile IDs server-side; omit known conflicts and do not store profile data.|
|**GET /api/scrape-runs/{id}/metrics**|Technical/demo source-health data.|Protect or separate from public product surfaces if operational detail is sensitive.|
|**GET /health**|Service health probe.|Must not disclose dependency secrets or stack traces.|



## 7. Frontend integration and state management

- **Questionnaire state —** Keep formData distinct from display copy; validate missing versus invalid versus unknown. 

- **Network state —** The jeepney loading state must reflect an actual pending query and be bypassed immediately when results are ready or cached. 

- **Editing —** Profile-pill edits must update the canonical state, invalidate/reissue the match query, and preserve results context. 

- **Error handling —** Show recovery options for request failures and empty states; do not imply zero eligibility because the API failed. 

- **Accessibility —** Use semantic controls and labels, visible focus, keyboard operability, touch-safe targets, and reduced-motion support. 

- **Responsive behavior —** Keep matching, editing, results, and official-source actions usable on narrow devices without hover dependency. 

## 8. Observability, source health, and self-healing

### 8.1 Required metrics

|**Metric**|**Formula / source**|**Use**|
|---|---|---|
|**Acceptance rate**|processed / records_received.|Detect whether source output promotes successfully.|
|**Duplicate rate**|duplicate / records_received.|Understand repeated collection and tune collection scope.|
|**Review rate**|needs_review / records_received.|Find usable but incomplete extraction or source-quality issues.|
|**Failure rate**|failed / records_received.|Detect schema breaks, category drift, or invalid shapes.|
|**Field completeness trend**|Per-source proportion of key extracted fields over time.|Detect silent extraction degradation such as a sudden deadline/provider drop.|



### 8.2 Healing workflow (recommended)

|**Step**|**System behavior**|
|---|---|
|**Detect**|Compare per-source metric/field-completeness baselines and flag material degradation.|
|**Diagnose**|Locate affected scrape runs and inspect preserved raw records plus collector/source changes.|
|**Repair**|Update the collector/extraction configuration under version control; do not patch canonical data blindly.|
|**Validate**|Run the repaired collector against representative pages and require schema/quality checks to recover.|
|**Record**|Log source, incident, repair, validation evidence, and outcome in a source-health timeline.|



## 9. Security, privacy, quality, and delivery

### 9.1 Security and privacy requirements

- **Secrets —** Use environment variables or managed secret stores; rotate exposed or suspected-exposed credentials; enforce least privilege. 

- **Boundary protection —** Authenticate ingestion/processing/admin endpoints. Apply authorization and row/API policies to raw records and operational tables. 

- **Input safety —** Validate payload size, types, URLs, and allowed enum values; avoid logging complete untrusted payloads or user profiles unnecessarily. 

- **Privacy minimization —** A matching request should be transient by default. Persist profile data only after an explicit product decision, consent design, retention policy, and access-control implementation. 

- **Outbound safety —** Validate official/application URLs before rendering navigation. Label links accurately and avoid proxying applications unless separately designed. 

### 9.2 Test strategy

|**Test layer**|**Required coverage**|
|---|---|
|**Unit**|Normalization aliases, canonical categories/statuses, null/empty-array rules, validation routing, duplicate keys, and match-reason construction.|
|**Integration**|Ingest -> raw store -> process -> canonical promotion; metric updates; duplicate linkage; protected route behavior.|
|**Contract**|Frontend fixtures for program list/detail and matches, including missing data and uncertain eligibility states.|
|**End-to-end**|Browse; three-step partial-profile Matchmaker; editable profile; matching state; detail; official-source route; network failure recovery.|
|**Regression corpus**|Representative scraper outputs per source, including intentionally malformed/changed records to verify self-healing detection.|
|**Security**|No secrets in repository/build output; authorization checks; URL validation; rate/abuse safeguards appropriate to deployment.|



### 9.3 Engineering acceptance checklist

- **Traceable public data —** Every program returned to the client is canonical, validated, and linked to preserved raw provenance. 

- **Safe operations —** Raw/review/admin data is protected; secrets never enter client code, docs, or logs. 

- **Observable pipeline —** Each scrape run has counts/rates, and source degradation can be detected with evidence. 

- **Design fidelity —** The frontend implements the supplied Design Specification’s questionnaire, results editing, detail hierarchy, accessibility, and motion rules without inventing new product behavior. 

## 10. Open engineering decisions

|**Area**|**Current baseline**|**Decision to record**|
|---|---|---|
|**Source scheduling**|Per-request scrape runs are documented; periodic scanning is suggested.|Cadence, orchestration, retry budget, and source ownership.|
|**Semantic validation**|Structural + quality checks are implemented; deep cross-field consistency is future work.|Rules and confidence thresholds for detecting text/structured-data contradiction.|
|**Ranking**|Explainable qualitative matching is required.|Weights, exclusion handling, tie-breaking, and calibration/review process.|
|**Public API shape**|GET /programs and `POST /api/match` are approved public MVP routes.|Versioning, pagination, filtering, cache behavior, and auth exposure.|
|**Manual review**|needs_review preserves data for later action.|Review queue owner, tooling, SLAs, and publish/remediation audit trail.|
|**Data retention**|Raw evidence is required for provenance.|Retention period, archival, deletion, and privacy policy for source/profile data.|



**Implementation handoff:** Treat this document, the supplied Design Specification, and the Product Specification as a coordinated baseline. If a code decision changes a user-facing behavior or data contract, record it in all affected documents before it becomes the new default. 



