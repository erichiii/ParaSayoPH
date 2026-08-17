const rawText = $('.entry-content').text() || $('body').text();
const cleanText = rawText.replace(/\s+/g, ' ').trim();
const sourceUrl = input.url;
const currentTimestamp = new Date().toISOString();

const programSchema = [{
    "title": "string (Required: Official name of the program)",
    "provider": "string | null (Agency responsible, null if unknown)",
    "category": "string (Must be lowercase snake_case e.g., 'scholarship', 'financial_assistance', 'training')",
    "description": "string | null",
    "coverage": {
        "type": "string (Allowed: nationwide, regional, provincial, city, municipal, district, unknown)",
        "locations": ["string"]
    },
    "eligibility": {
        "age": {
            "min": "integer | null",
            "max": "integer | null",
            "raw_text": "string | null"
        },
        "education": {
            "levels": ["string (e.g., incoming_first_year_college, senior_high_school, college, tvet)"],
            "raw_text": "string | null"
        },
        "employment": {
            "statuses": ["string"],
            "raw_text": "string | null"
        },
        "income": {
            "min": "number | null",
            "max": "number | null",
            "period": "string | null (e.g., annual, monthly)",
            "scope": "string | null (e.g., household, parents, individual)",
            "raw_text": "string | null"
        },
        "residency": {
            "locations": ["string"],
            "raw_text": "string | null"
        },
        "other_requirements": ["string (Any criteria the applicant must satisfy that does not fit above)"]
    },
    "benefits": ["string (Actual assistance, financial support, services)"],
    "requirements": ["string (ONLY documentary materials the applicant must submit, e.g., 'Valid ID', 'Proof of Income')"],
    "application": {
        "start_date": "string | null (YYYY-MM-DD format)",
        "deadline": "string | null (YYYY-MM-DD format)",
        "process": "string | null (Instructions on how to apply)",
        "url": "string | null (Direct application link if found)"
    },
    "source": {
        "url": "string (Use the injected sourceUrl)",
        "last_verified_at": "string (Use the injected currentTimestamp)"
    },
    "status": "string (Allowed: open, ongoing, upcoming, closed, unknown)"
}];

const systemPrompt = `
You are a strict data extraction agent for the ParaSa'yo database. Your job is to extract all scholarship and public assistance programs from the provided text into a JSON array.

CRITICAL RULES:
1. Do not guess missing information. If a scalar value is not explicitly stated, use null.
2. If a list has no items, use an empty array [][cite: 8].
3. Never use placeholder strings for dates or scalars (e.g., do NOT output "Check official page" for a deadline). Output null instead[cite: 8].
4. The 'requirements' array is STRICTLY for documentary materials the applicant must submit (e.g., 'Certificate of Indigency', 'Valid ID'). Do not put general advice or applicant conditions here[cite: 8].
5. Conditions the applicant must satisfy (e.g., 'Must be a Filipino citizen', 'Must have an 85% GPA') belong in 'eligibility.other_requirements', NOT 'requirements'[cite: 8].
6. Always preserve the original context for eligibility fields in the 'raw_text' property[cite: 8].
7. Extract explicit numeric income limits and age requirements into their respective min/max fields[cite: 8].
8. Convert all dates to 'YYYY-MM-DD' format[cite: 8].
9. If multiple distinct programs are listed in the text, separate them into distinct objects within the JSON array[cite: 8].
`;

const extractedData = ai.extract(cleanText, {
    schema: programSchema,
    prompt: systemPrompt
});

if (Array.isArray(extractedData)) {
    extractedData.forEach(program => {
        if (program.source) {
            program.source.url = sourceUrl;
            program.source.last_verified_at = currentTimestamp;
        }
    });
}

return extractedData;