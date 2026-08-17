# ParaSa'yo Program Schema

**Version:** `0.1`
**Status:** Initial / Experimental
**Schema file:** `program.v0.1.json`

## Purpose

This schema defines the common structure used by ParaSa'yo to represent public opportunities and assistance programs collected from different sources.

All scraping categories should aim to produce data that follows this structure so that the backend can process records consistently regardless of where they came from.

The current categories include:

* Scholarships
* Financial assistance
* Medical assistance
* Crisis assistance
* Disaster assistance
* Transportation assistance
* Burial assistance
* OFW-related assistance
* Training programs
* Other relevant public assistance programs

This is **Schema v0.1**. It is expected to change as we encounter real-world data that cannot be represented properly by the current structure.

---

# 1. General Rules

## 1.1 Do not infer missing information

Only extract information that is explicitly supported by the source.

If a source does not specify an age requirement:

```json
{
  "age_min": null,
  "age_max": null
}
```

Do **not** assume:

```json
{
  "age_min": 18,
  "age_max": 60
}
```

unless the source actually states those values.

The backend and matching system must be able to distinguish between:

* information explicitly stated by the source;
* information not stated by the source.

---

## 1.2 Use `null` for unknown scalar values

Use `null` when a single value cannot be determined from the source.

Examples:

```json
{
  "deadline": null,
  "age_min": null,
  "residency_requirement": null
}
```

`null` means:

> The information was not found, was not stated, or could not be determined reliably.

It does **not** automatically mean that the requirement does not exist.

---

## 1.3 Use `[]` for list fields with no extracted values

Fields that can contain multiple values should always be arrays.

Example:

```json
{
  "education_levels": [],
  "employment_statuses": [],
  "benefits": [],
  "requirements": []
}
```

If values are available:

```json
{
  "education_levels": [
    "senior_high_school",
    "undergraduate"
  ]
}
```

---

## 1.4 Preserve complicated requirements as text

Not every eligibility condition can be converted into a number or predefined field.

For example:

> Applicant must belong to a family currently experiencing a crisis situation as assessed by a social worker.

This should be preserved under:

```json
{
  "other_requirements": [
    "Applicant must belong to a family currently experiencing a crisis situation as assessed by a social worker."
  ]
}
```

Do not remove important details just to make the information fit a structured field.

---

## 1.5 Never fabricate values to complete the schema

A valid record may contain multiple `null` values or empty arrays.

Incomplete source information is preferable to incorrect information.

---

# 2. Schema Overview

```json
{
  "title": "string",
  "provider": "string",
  "category": "string",

  "description": "string | null",

  "coverage": {
    "type": "string",
    "locations": ["string"]
  },

  "eligibility": {
    "age_min": "integer | null",
    "age_max": "integer | null",

    "education_levels": ["string"],
    "employment_statuses": ["string"],

    "income": {
      "min": "number | null",
      "max": "number | null",
      "period": "string | null",
      "raw_text": "string | null"
    },

    "residency_requirement": "string | null",
    "other_requirements": ["string"]
  },

  "benefits": ["string"],

  "requirements": ["string"],

  "application": {
    "start_date": "YYYY-MM-DD | null",
    "deadline": "YYYY-MM-DD | null",
    "process": "string | null",
    "url": "string | null"
  },

  "source": {
    "url": "string",
    "last_verified_at": "ISO-8601 datetime"
  },

  "status": "string"
}
```

---

# 3. Field Reference

## `title`

**Type:** `string`
**Required:** Yes

Official or commonly used name of the program.

Example:

```json
{
  "title": "Assistance to Individuals in Crisis Situation"
}
```

Avoid creating a new title when an official program name is available.

---

## `provider`

**Type:** `string`
**Required:** Yes

Organization, agency, institution, or government unit responsible for the program.

Examples:

```json
{
  "provider": "Department of Social Welfare and Development"
}
```

```json
{
  "provider": "Commission on Higher Education"
}
```

```json
{
  "provider": "Overseas Workers Welfare Administration"
}
```

Prefer the official provider name when it can be identified.

Provider normalization such as converting `"DSWD"` and `"Department of Social Welfare and Development"` into one canonical representation may be handled by the backend.

---

## `category`

**Type:** `string`
**Required:** Yes

Primary category of the program.

Current allowed values:

```text
scholarship
financial_assistance
medical_assistance
crisis_assistance
disaster_assistance
transportation_assistance
burial_assistance
ofw_assistance
training
other
```

Use the category that best represents the **overall purpose of the program**.

A program may provide multiple types of benefits. Do not create duplicate records solely because one program provides several forms of assistance.

For example, a crisis assistance program may have:

```json
{
  "category": "crisis_assistance",
  "benefits": [
    "Medical assistance",
    "Burial assistance",
    "Transportation assistance"
  ]
}
```

---

# 4. Description

## `description`

**Type:** `string | null`

A short description explaining what the program is and whom it is intended to help.

Example:

```json
{
  "description": "Provides assistance to individuals and families experiencing crisis situations."
}
```

Keep the meaning of the original source. Avoid adding claims that are not supported by it.

---

# 5. Geographic Coverage

## `coverage`

Describes where the program is available.

```json
{
  "coverage": {
    "type": "nationwide",
    "locations": ["Philippines"]
  }
}
```

### `coverage.type`

Current allowed values:

```text
nationwide
regional
provincial
city
municipal
district
unknown
```

Examples:

Nationwide:

```json
{
  "type": "nationwide",
  "locations": ["Philippines"]
}
```

Regional:

```json
{
  "type": "regional",
  "locations": ["Region VII"]
}
```

City:

```json
{
  "type": "city",
  "locations": ["Manila"]
}
```

If the geographic coverage cannot be determined:

```json
{
  "type": "unknown",
  "locations": []
}
```

Do not assume that a program is nationwide simply because it is operated by a national government agency.

---

# 6. Eligibility

The `eligibility` object contains conditions determining who may qualify for the program.

```json
{
  "eligibility": {
    "age_min": null,
    "age_max": null,
    "education_levels": [],
    "employment_statuses": [],
    "income": {
      "min": null,
      "max": null,
      "period": null,
      "raw_text": null
    },
    "residency_requirement": null,
    "other_requirements": []
  }
}
```

---

## `age_min` / `age_max`

**Type:** `integer | null`

Minimum and maximum ages explicitly stated by the source.

Example:

```json
{
  "age_min": 18,
  "age_max": 30
}
```

If no age restriction is stated:

```json
{
  "age_min": null,
  "age_max": null
}
```

---

## `education_levels`

**Type:** `array[string]`

Education levels explicitly associated with eligibility.

Example:

```json
{
  "education_levels": [
    "senior_high_school_graduate",
    "undergraduate"
  ]
}
```

For v0.1, uncommon education descriptions may be preserved as strings rather than forcing them into an incorrect classification.

---

## `employment_statuses`

**Type:** `array[string]`

Employment-related eligibility stated by the source.

Example:

```json
{
  "employment_statuses": [
    "unemployed"
  ]
}
```

If employment status is irrelevant or not specified:

```json
{
  "employment_statuses": []
}
```

---

# 7. Income Requirement

Income is represented using both structured values and the original meaning.

```json
{
  "income": {
    "min": null,
    "max": 400000,
    "period": "annual",
    "raw_text": "Combined annual gross income of parents or guardian must not exceed PHP 400,000."
  }
}
```

## `income.min`

Minimum income requirement, if explicitly specified.

## `income.max`

Maximum income requirement, if explicitly specified.

## `income.period`

Period associated with the income amount.

Current expected values include:

```text
monthly
annual
null
```

Additional values may be introduced if real sources require them.

## `income.raw_text`

The original income condition or a faithful representation of it.

This field is important because many government programs describe income eligibility in ways that cannot be represented accurately using numbers.

Example:

```json
{
  "min": null,
  "max": null,
  "period": null,
  "raw_text": "Applicant must belong to an indigent family."
}
```

Do **not** invent an income threshold for conditions like this.

---

# 8. Residency Requirement

## `residency_requirement`

**Type:** `string | null`

Residency-related eligibility condition.

Example:

```json
{
  "residency_requirement": "Must be a resident of Manila for at least six months."
}
```

This is different from `coverage`.

`coverage` describes **where the program operates**.

`residency_requirement` describes **what residency condition an applicant must satisfy**.

---

# 9. Other Eligibility Requirements

## `other_requirements`

**Type:** `array[string]`

Eligibility conditions that do not fit safely into the structured fields.

Example:

```json
{
  "other_requirements": [
    "Must be an active OWWA member.",
    "Applicant must be a dependent of an OFW."
  ]
}
```

This field should preserve important eligibility information instead of discarding it.

---

# 10. Benefits

## `benefits`

**Type:** `array[string]`

Assistance, services, grants, subsidies, or other benefits provided by the program.

Example:

```json
{
  "benefits": [
    "Medical assistance",
    "Transportation assistance",
    "Financial assistance"
  ]
}
```

When an exact monetary benefit is stated, preserve that information:

```json
{
  "benefits": [
    "Financial assistance of up to PHP 10,000"
  ]
}
```

Do not infer an amount when none is provided.

---

# 11. Documentary Requirements

## `requirements`

**Type:** `array[string]`

Documents or materials that applicants are required to submit.

Example:

```json
{
  "requirements": [
    "Valid government-issued ID",
    "Barangay certificate",
    "Medical certificate"
  ]
}
```

Do not confuse documentary requirements with eligibility conditions.

For example:

```text
Must be a Manila resident
```

belongs under `eligibility`.

```text
Proof of residency
```

belongs under `requirements`.

---

# 12. Application

Application-related information is grouped under the `application` object.

```json
{
  "application": {
    "start_date": null,
    "deadline": null,
    "process": null,
    "url": null
  }
}
```

## `start_date`

**Type:** `YYYY-MM-DD | null`

Date applications begin.

Example:

```json
{
  "start_date": "2026-08-01"
}
```

---

## `deadline`

**Type:** `YYYY-MM-DD | null`

Application cutoff date.

Example:

```json
{
  "deadline": "2026-08-31"
}
```

If no deadline is stated:

```json
{
  "deadline": null
}
```

A missing deadline does **not** automatically mean that the program is ongoing.

---

## `process`

**Type:** `string | null`

Instructions explaining how an applicant applies.

Example:

```json
{
  "process": "Submit the required documents to the nearest DSWD field office for assessment."
}
```

This is especially important for programs that do not have online applications.

---

## `url`

**Type:** `string | null`

Direct application URL, if one exists.

Example:

```json
{
  "url": "https://example.gov.ph/apply"
}
```

If applications must be submitted physically or no application portal is provided:

```json
{
  "url": null
}
```

Do not use the general agency homepage as the application URL unless it is actually where applications are submitted.

---

# 13. Source

Every program must remain traceable to its source.

```json
{
  "source": {
    "url": "https://example.gov.ph/program/example-program",
    "last_verified_at": "2026-08-17T17:30:00+08:00"
  }
}
```

## `source.url`

**Required:** Yes

Exact webpage where the program information was obtained.

Prefer:

```text
https://agency.gov.ph/programs/example-assistance
```

over:

```text
https://agency.gov.ph
```

when the first URL contains the actual program information.

---

## `source.last_verified_at`

**Required:** Yes

Timestamp representing when the source was last checked.

Use ISO-8601 format.

Example:

```text
2026-08-17T17:30:00+08:00
```

This does **not** mean the government agency updated the page at that time. It means ParaSa'yo checked the source at that time.

---

# 14. Status

## `status`

Represents the program's current application/availability state.

Current allowed values:

```text
open
ongoing
upcoming
closed
unknown
```

### `open`

Applications are currently being accepted and the program has a defined application period.

### `ongoing`

The program appears to operate continuously or accepts applications without a fixed application window.

Common for some government and social assistance programs.

### `upcoming`

Applications are expected to open in the future.

### `closed`

The application period has ended or the source explicitly states that applications are closed.

### `unknown`

The current availability cannot be reliably determined.

When uncertain, use:

```json
{
  "status": "unknown"
}
```

Do not automatically mark a program as `ongoing` simply because no deadline was found.

---

# 15. Complete Example

```json
{
  "title": "Example Crisis Assistance Program",
  "provider": "Example Government Agency",
  "category": "crisis_assistance",

  "description": "Provides assistance to qualified individuals and families experiencing crisis situations.",

  "coverage": {
    "type": "nationwide",
    "locations": ["Philippines"]
  },

  "eligibility": {
    "age_min": null,
    "age_max": null,

    "education_levels": [],
    "employment_statuses": [],

    "income": {
      "min": null,
      "max": null,
      "period": null,
      "raw_text": "Applicant must be assessed as financially incapable of addressing the current crisis."
    },

    "residency_requirement": null,

    "other_requirements": [
      "Applicant must currently be experiencing a crisis situation."
    ]
  },

  "benefits": [
    "Medical assistance",
    "Burial assistance",
    "Transportation assistance"
  ],

  "requirements": [
    "Valid government-issued ID",
    "Supporting documents related to the requested assistance"
  ],

  "application": {
    "start_date": null,
    "deadline": null,
    "process": "Submit the required documents to the appropriate government office for assessment.",
    "url": null
  },

  "source": {
    "url": "https://example.gov.ph/programs/crisis-assistance",
    "last_verified_at": "2026-08-17T17:30:00+08:00"
  },

  "status": "ongoing"
}
```

---

# 16. Scraper Responsibilities vs Backend Responsibilities

The scraper and backend have different responsibilities.

## Scraper

The scraper should:

1. Find relevant program pages.
2. Extract information supported by the source.
3. Preserve important text.
4. Produce data as close as possible to this schema.
5. Use `null` or `[]` instead of guessing missing values.
6. Include the exact source URL.

The scraper does **not** need to solve every normalization problem.

---

## Backend

The backend will eventually handle:

```text
Scraped Record
      ↓
Normalization
      ↓
Validation
      ↓
Deduplication
      ↓
Database
      ↓
Matching Engine
      ↓
API
```

Examples of backend normalization may include:

```text
"DSWD"
"Department of Social Welfare & Development"
"Department of Social Welfare and Development"

                ↓

Department of Social Welfare and Development
```

or:

```text
"Scholarship"
"SCHOLARSHIP"
"scholarships"

        ↓

scholarship
```

This separation prevents every scraper from implementing its own interpretation of the data.

---

# 17. Schema Evolution

This schema is intentionally versioned:

```text
program.v0.1.json
```

Do not modify the meaning of existing fields silently once multiple team members are using the schema.

When real-world scraping reveals a limitation:

1. Save the problematic example.
2. Document why the current schema cannot represent it properly.
3. Discuss the change with the team.
4. Update the schema.
5. Increment the version when necessary.

Example:

```text
program.v0.1.json
        ↓
Real DSWD / CHED / OWWA data
        ↓
Schema limitation discovered
        ↓
Team discussion
        ↓
program.v0.2.json
```

The goal of v0.1 is **not to predict every possible government program**.

The goal is to provide a common, safe, and testable structure that lets the scraping and backend teams start integrating real data.

---

# Quick Reference

When scraping, remember:

```text
Missing scalar value      → null

Missing list values       → []

Not explicitly stated     → DO NOT GUESS

Complex eligibility       → other_requirements

Complex income condition  → income.raw_text

No deadline found         → deadline: null
                            NOT automatically "ongoing"

No online application     → application.url: null

Program information       → exact source URL

Multiple assistance types → one program with multiple benefits
                            when they belong to the same program
```

**When in doubt, preserve the source information rather than forcing it into an incorrect structured value.**
