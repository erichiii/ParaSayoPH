# ParaSa'yo Program Schema

**Version:** `0.1`
**Status:** Initial / Experimental
**Schema file:** `program.v0.1.json`

## Purpose

This schema defines the **canonical structure** used by ParaSa'yo to represent scholarships, government assistance, training programs, and other public opportunities.

Scrapers should produce data as close to this structure as reasonably possible. However, **scraper output does not need to perfectly match this schema**.

The backend is responsible for converting raw scraped data into the canonical ParaSa'yo format through:

```text
Website
   ↓
Bright Data / Scraper
   ↓
Raw Scraped Record
   ↓
Normalization
   ↓
Validation
   ↓
Canonical ParaSa'yo Program
   ↓
Database
```

This distinction is important because scraped information can be incomplete, inconsistently formatted, or incorrectly classified.

Schema `v0.1` is intentionally experimental and may change after testing against more real-world sources.

---

# 1. General Rules

## 1.1 Do not guess missing information

Only extract or normalize information that can be supported by the source.

If the source does not specify an age requirement:

```json
{
  "age": {
    "min": null,
    "max": null,
    "raw_text": null
  }
}
```

Do **not** invent an age range.

---

## 1.2 `null` means unknown or not stated

Use `null` when a scalar value cannot be reliably determined.

For example:

```json
{
  "deadline": null
}
```

means:

> No reliable deadline was found.

Do not use placeholder values such as:

```json
{
  "deadline": "Check official page"
}
```

A placeholder is not a date and should not be stored as one.

Similarly:

```json
{
  "income": {
    "max": null
  }
}
```

does not mean there is no income restriction. It means no structured maximum could be reliably determined.

---

## 1.3 `[]` means no extracted list values

Fields that may contain multiple values should use arrays.

```json
{
  "benefits": [],
  "requirements": []
}
```

When information is available:

```json
{
  "benefits": [
    "Medical assistance",
    "Transportation assistance"
  ]
}
```

---

## 1.4 Preserve raw eligibility text

Real eligibility conditions are often more complicated than a simple number or category.

For example:

> Must be a qualified dependent of an active OWWA-member OFW.

Instead of discarding this because it does not currently have a dedicated field:

```json
{
  "other_requirements": [
    "Must be a qualified dependent of an active OWWA-member OFW."
  ]
}
```

Structured fields should be used when information can be reliably extracted, while raw text should preserve important context.

---

## 1.5 Do not force information into the wrong field

If a requirement cannot be represented accurately using a structured field, preserve it as text instead.

For example:

> Applicant must belong to an indigent family.

Do not invent an income value.

Use:

```json
{
  "income": {
    "min": null,
    "max": null,
    "period": null,
    "scope": null,
    "raw_text": "Applicant must belong to an indigent family."
  }
}
```

---

## 1.6 Scraped JSON is not automatically trusted data

Receiving structured JSON from a scraper does not guarantee that every field is correct.

Scraping may result in:

* Missing eligibility information
* Incorrect program boundaries
* Section headings being mistaken for programs
* Requirements from unrelated sections
* Incorrect provider identification
* Incorrect program status
* Missing locations
* Information from multiple programs being combined

Because of this, raw scraper output should pass through backend normalization and validation before becoming a canonical program.

---

# 2. Canonical Schema Overview

```json
{
  "title": "string",
  "provider": "string | null",
  "category": "string",

  "description": "string | null",

  "coverage": {
    "type": "nationwide | regional | provincial | city | municipal | district | unknown",
    "locations": []
  },

  "eligibility": {
    "age": {
      "min": "integer | null",
      "max": "integer | null",
      "raw_text": "string | null"
    },

    "education": {
      "levels": [],
      "raw_text": "string | null"
    },

    "employment": {
      "statuses": [],
      "raw_text": "string | null"
    },

    "income": {
      "min": "number | null",
      "max": "number | null",
      "period": "string | null",
      "scope": "string | null",
      "raw_text": "string | null"
    },

    "residency": {
      "locations": [],
      "raw_text": "string | null"
    },

    "other_requirements": []
  },

  "benefits": [],
  "requirements": [],

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

  "status": "open | ongoing | upcoming | closed | unknown"
}
```

---

# 3. Core Program Fields

## `title`

**Type:** `string`
**Required:** Yes

Official or commonly recognized name of the program.

Example:

```json
{
  "title": "CHED Merit Scholarship Program"
}
```

Avoid treating article headings or group headings as programs.

For example:

```text
Local Government and Public Institution Scholarships
```

may describe a section containing multiple programs rather than one actual program.

---

## `provider`

**Type:** `string | null`

Agency, institution, organization, or local government unit responsible for the program.

Example:

```json
{
  "provider": "Commission on Higher Education"
}
```

If the provider cannot be reliably determined:

```json
{
  "provider": null
}
```

Do not use values such as:

```text
Unknown / General
```

as canonical provider names.

Provider normalization may be handled by the backend.

For example:

```text
CHED
Commission on Higher Education

        ↓

Commission on Higher Education
```

---

# 4. Category

## `category`

**Type:** `string`
**Required:** Yes

Primary category representing the main purpose of the program.

Current values:

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

Use lowercase `snake_case`.

Do not use inconsistent variants such as:

```text
Government Scholarships
Scholarship
SCHOLARSHIPS
```

The canonical representation should be:

```json
{
  "category": "scholarship"
}
```

A single program may provide multiple forms of assistance.

For example:

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

Do not create duplicate program records solely because one program offers several benefits.

---

# 5. Description

## `description`

**Type:** `string | null`

Short explanation of what the program does and who it is intended to help.

Example:

```json
{
  "description": "Provides financial assistance to qualified incoming first-year college students."
}
```

Descriptions should not accidentally include content belonging to the next program or unrelated parts of the source page.

---

# 6. Geographic Coverage

```json
{
  "coverage": {
    "type": "provincial",
    "locations": [
      "Northern Samar"
    ]
  }
}
```

## `coverage.type`

Allowed values:

```text
nationwide
regional
provincial
city
municipal
district
unknown
```

## `coverage.locations`

**Type:** `array[string]`

Specific geographic areas where the program is available.

Examples:

```json
{
  "type": "nationwide",
  "locations": [
    "Philippines"
  ]
}
```

```json
{
  "type": "provincial",
  "locations": [
    "Iloilo"
  ]
}
```

```json
{
  "type": "city",
  "locations": [
    "Davao City"
  ]
}
```

Do not mark a program as `regional` simply because its exact coverage could not be extracted.

When coverage cannot be determined:

```json
{
  "type": "unknown",
  "locations": []
}
```

---

# 7. Eligibility

Eligibility contains both **structured values** and **raw text**.

This allows ParaSa'yo to eventually perform matching while still preserving conditions that cannot yet be represented structurally.

---

## `eligibility.age`

```json
{
  "age": {
    "min": null,
    "max": 25,
    "raw_text": "Applicant must be no more than 25 years old."
  }
}
```

### `min`

Minimum age explicitly stated by the source.

### `max`

Maximum age explicitly stated by the source.

### `raw_text`

Original or faithfully preserved description of the age requirement.

If no age requirement is found:

```json
{
  "age": {
    "min": null,
    "max": null,
    "raw_text": null
  }
}
```

---

# 8. Education Eligibility

## `eligibility.education`

```json
{
  "education": {
    "levels": [
      "incoming_first_year_college"
    ],
    "raw_text": "Applicant must be an incoming first-year college student."
  }
}
```

### `levels`

Structured education classifications when they can be determined.

### `raw_text`

Preserves the actual education condition from the source.

Avoid vague structured values such as:

```text
Various
```

when the actual eligibility condition can be preserved.

---

# 9. Employment Eligibility

## `eligibility.employment`

```json
{
  "employment": {
    "statuses": [
      "unemployed"
    ],
    "raw_text": "Applicant must currently be unemployed."
  }
}
```

If employment is not relevant or cannot be determined:

```json
{
  "employment": {
    "statuses": [],
    "raw_text": null
  }
}
```

---

# 10. Income Eligibility

## `eligibility.income`

```json
{
  "income": {
    "min": null,
    "max": 400000,
    "period": "annual",
    "scope": "household",
    "raw_text": "Household annual income must not exceed PHP 400,000."
  }
}
```

### `min`

Minimum income value, if explicitly stated.

### `max`

Maximum income value, if explicitly stated.

### `period`

Examples:

```text
monthly
annual
null
```

### `scope`

Identifies whose income is being measured.

Examples may include:

```text
individual
household
family
parents
ofw
```

If this cannot be reliably classified:

```json
{
  "scope": null
}
```

### `raw_text`

Preserves the source's actual income condition.

This field is important because many programs describe financial eligibility in ways that cannot be represented using only a number.

---

# 11. Residency Eligibility

## `eligibility.residency`

```json
{
  "residency": {
    "locations": [
      "Iloilo Province"
    ],
    "raw_text": "Applicant must be a resident of Iloilo Province."
  }
}
```

Do not confuse **citizenship** with **residency**.

For example:

```text
Must be a Filipino citizen
```

does not mean:

```json
{
  "residency": {
    "locations": ["Philippines"]
  }
}
```

Citizenship requirements that do not currently have a dedicated structured field can temporarily be preserved under `other_requirements`.

---

# 12. Other Eligibility Requirements

## `eligibility.other_requirements`

**Type:** `array[string]`

Conditions that cannot yet be represented by the structured eligibility fields.

Example:

```json
{
  "other_requirements": [
    "Must be a Filipino citizen.",
    "Must be a dependent of an active OWWA-member OFW.",
    "Must pass the DOST-SEI qualifying examination."
  ]
}
```

Future schema versions may introduce dedicated fields if recurring requirements justify them.

---

# 13. Benefits

## `benefits`

**Type:** `array[string]`

Actual assistance, financial support, services, grants, subsidies, or other benefits provided by the program.

Example:

```json
{
  "benefits": [
    "Tuition assistance",
    "Book allowance",
    "Monthly stipend"
  ]
}
```

If an exact amount is known:

```json
{
  "benefits": [
    "Educational assistance of up to PHP 100,000 per school year"
  ]
}
```

Do not invent benefit values.

---

# 14. Requirements

## `requirements`

**Type:** `array[string]`

Documents or materials that applicants must submit.

Example:

```json
{
  "requirements": [
    "Valid government-issued ID",
    "Certificate of enrollment",
    "Proof of income"
  ]
}
```

Do not place general advice, agency names, unrelated links, or article content in this field.

For example, these are **not** documentary requirements:

```text
Check if the scholarship is currently open.
Prepare your documents early.
Check your email for updates.
Commission on Higher Education
```

Also distinguish between:

```text
Must be a resident of Manila
```

which is **eligibility**, and:

```text
Proof of Manila residency
```

which is a **documentary requirement**.

---

# 15. Application Information

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

Example:

```json
{
  "start_date": "2026-08-01"
}
```

---

## `deadline`

**Type:** `YYYY-MM-DD | null`

Example:

```json
{
  "deadline": "2026-08-31"
}
```

If no reliable deadline is available:

```json
{
  "deadline": null
}
```

Never use:

```json
{
  "deadline": "Check official page"
}
```

---

## `process`

**Type:** `string | null`

Instructions explaining how the applicant applies.

Example:

```json
{
  "process": "Submit the required documents to the nearest regional office."
}
```

Do not include generic application advice unrelated to the specific program.

---

## `url`

**Type:** `string | null`

Direct application page or portal.

Example:

```json
{
  "url": "https://example.gov.ph/apply"
}
```

If no online application portal exists or it cannot be determined:

```json
{
  "url": null
}
```

---

# 16. Source Information

```json
{
  "source": {
    "url": "https://example.gov.ph/program/example",
    "last_verified_at": "2026-08-17T18:00:00+08:00"
  }
}
```

## `source.url`

Exact URL from which the program information was obtained.

Whenever possible, ParaSa'yo should prefer **authoritative sources**, such as:

1. Official national government agency pages
2. Official regional government pages
3. Official LGU pages
4. Official program/application portals

Third-party aggregators may still be useful for **program discovery**, but the program should ideally be verified against an authoritative source before being treated as trusted data.

---

## `source.last_verified_at`

Timestamp indicating when ParaSa'yo last checked the source.

Use ISO-8601.

Example:

```text
2026-08-17T18:00:00+08:00
```

This represents when **ParaSa'yo verified the source**, not when the government agency last updated the page.

---

# 17. Program Status

## `status`

Allowed values:

```text
open
ongoing
upcoming
closed
unknown
```

### `open`

Applications are currently being accepted within a defined application period.

### `ongoing`

The program operates continuously or accepts applications without a fixed application window.

This may be common for certain government and social assistance programs.

### `upcoming`

Applications are expected to open in the future.

### `closed`

Applications are no longer being accepted.

### `unknown`

Current availability cannot be reliably determined.

When the source does not provide enough information, prefer:

```json
{
  "status": "unknown"
}
```

Do not automatically use:

```json
{
  "status": "open"
}
```

or:

```json
{
  "status": "ongoing"
}
```

simply because no deadline was found.

---

# 18. Raw Scraped Data vs Canonical Data

ParaSa'yo distinguishes between **raw scraper output** and a **canonical Program**.

## Raw record

This is exactly or nearly exactly what Bright Data or another scraper produced.

It may contain:

* Incorrect formatting
* Missing information
* Additional fields
* Incorrect classifications
* Placeholder values
* Extraction errors

The backend should preserve this data before normalization.

Example conceptual storage:

```text
raw_scraped_records

id
source_url
scraped_at
raw_data
processing_status
```

`raw_data` may be stored as PostgreSQL `JSONB`.

---

## Canonical program

This is the cleaned and validated representation used by ParaSa'yo.

```text
Raw Scraped Record
        ↓
Normalization
        ↓
Validation
        ↓
Canonical Program
        ↓
programs table
```

This means the scraper is **not responsible for making every field perfect**.

It should extract as accurately as possible while avoiding unsupported assumptions.

The backend is responsible for enforcing the canonical schema.

---

# 19. Example Canonical Record

```json
{
  "title": "Example Government Scholarship",
  "provider": "Example Government Agency",
  "category": "scholarship",

  "description": "Provides educational assistance to qualified incoming college students.",

  "coverage": {
    "type": "nationwide",
    "locations": [
      "Philippines"
    ]
  },

  "eligibility": {
    "age": {
      "min": null,
      "max": 25,
      "raw_text": "Applicant must be no more than 25 years old."
    },

    "education": {
      "levels": [
        "incoming_first_year_college"
      ],
      "raw_text": "Applicant must be an incoming first-year college student."
    },

    "employment": {
      "statuses": [],
      "raw_text": null
    },

    "income": {
      "min": null,
      "max": 400000,
      "period": "annual",
      "scope": "household",
      "raw_text": "Household annual income must not exceed PHP 400,000."
    },

    "residency": {
      "locations": [],
      "raw_text": null
    },

    "other_requirements": [
      "Must be a Filipino citizen."
    ]
  },

  "benefits": [
    "Tuition assistance",
    "Monthly allowance"
  ],

  "requirements": [
    "Proof of enrollment",
    "Proof of household income"
  ],

  "application": {
    "start_date": null,
    "deadline": null,
    "process": "Submit the required documents through the official application portal.",
    "url": "https://example.gov.ph/apply"
  },

  "source": {
    "url": "https://example.gov.ph/program/example-scholarship",
    "last_verified_at": "2026-08-17T18:00:00+08:00"
  },

  "status": "unknown"
}
```

---

# 20. Schema Evolution

This schema is versioned because ParaSa'yo will encounter requirements that cannot yet be represented perfectly.

```text
program.v0.1.json
        ↓
Real scraped data
        ↓
Schema limitation discovered
        ↓
Document example
        ↓
Discuss with team
        ↓
Schema update
        ↓
program.v0.2.json
```

Do not add a new field for every unusual program encountered.

A new structured field should generally be considered when:

* The information appears across multiple programs
* It is important for user matching
* Representing it structurally provides clear value
* Its meaning can be consistently defined

Until then, preserve the condition using the appropriate `raw_text` or `other_requirements` field.

---

# 21. Quick Reference for Scraper Developers

```text
Unknown scalar
→ null

No extracted list items
→ []

Information not stated
→ DO NOT GUESS

Unknown deadline
→ null

Unknown provider
→ null

Unknown status
→ "unknown"

Complex eligibility
→ preserve in raw_text / other_requirements

Income amount found
→ structured value + raw_text

Age requirement found
→ structured value + raw_text

Citizenship
→ do not treat as residency

Document to submit
→ requirements

Condition applicant must satisfy
→ eligibility

Third-party article
→ useful for discovery

Official government/program page
→ preferred source for verification
```

---

# 22. Main Principle

When deciding how to represent information, prioritize:

**accuracy → traceability → structure**

over trying to fill every field.

A partially structured record that faithfully represents the source is more useful to ParaSa'yo than a completely filled record containing assumptions.
