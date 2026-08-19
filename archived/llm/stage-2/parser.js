const sourceUrl = input.url;
const currentTimestamp = new Date().toISOString();
const rawText = $('.entry-content').length ? $('.entry-content').text() : $('body').text();
const cleanText = rawText.replace(/\s+/g, ' ').trim();

if (!cleanText) {
    return [];
}

const systemPrompt = `
You are an expert data extraction engine for the ParaSa'yo public assistance database.
Your task is to analyze the provided unstructured web text and extract ALL individual scholarship, financial assistance, or training programs found within it.

Return the data as a JSON object containing a "programs" array. If the text is a listicle featuring 5 programs, return 5 objects in the array. If it is a single program, return 1 object.

STRICT BEHAVIORAL GUIDELINES:
1. NULL VALUES: Do not guess. If a scalar value (date, age, income) is unknown, you MUST use null. Never use placeholder strings like "Check official page".
2. EMPTY LISTS: If a list has no extracted items, return an empty array [] rather than null.
3. CATEGORY ENUMS: The "category" field MUST be one of: "scholarship", "financial_assistance", "medical_assistance", "crisis_assistance", "disaster_assistance", "transportation_assistance", "burial_assistance", "ofw_assistance", "training", or "other".
4. STATUS ENUMS: The "status" field MUST be one of: "open", "ongoing", "upcoming", "closed", or "unknown"[cite: 8]. Default to "unknown".
5. REQUIREMENTS VS ELIGIBILITY: 
   - The 'requirements' array is STRICTLY for documentary materials submitted by the applicant (e.g., "Valid ID", "Birth Certificate", "Proof of Income", "ITR", "Payslip")[cite: 8].
   - Conditions the applicant must satisfy (e.g., "Must be a Filipino citizen", "Must belong to an indigent family", "Must have an 85% average") MUST go into 'eligibility.other_requirements'[cite: 8].
6. RAW TEXT CONTEXT: Always preserve the original sentence defining an eligibility condition in the 'raw_text' field[cite: 8].
7. IGNORE ADVICE: Strip out generic reading advice (e.g., "Prepare documents early", "Check your email", "Read requirements carefully")[cite: 8].
8. DATES: Format all discovered dates strictly as YYYY-MM-DD[cite: 8].
9. FALSE TITLES: Do not treat meta-headings (e.g., "Important Reminders", "About the Foundation", "Local Government Scholarships", "References") as program titles[cite: 8].
`;

const parasayoSchema = {
    type: "object",
    properties: {
        programs: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Official name of the program" },
                    provider: { type: ["string", "null"], description: "Agency responsible, null if unknown" },
                    category: { type: "string" },
                    description: { type: ["string", "null"], description: "Short explanation of the program" },
                    coverage: {
                        type: "object",
                        properties: {
                            type: { type: "string", enum: ["nationwide", "regional", "provincial", "city", "municipal", "district", "unknown"] },
                            locations: { type: "array", items: { type: "string" } }
                        },
                        required: ["type", "locations"]
                    },
                    eligibility: {
                        type: "object",
                        properties: {
                            age: {
                                type: "object",
                                properties: {
                                    min: { type: ["integer", "null"] },
                                    max: { type: ["integer", "null"] },
                                    raw_text: { type: ["string", "null"] }
                                },
                                required: ["min", "max", "raw_text"]
                            },
                            education: {
                                type: "object",
                                properties: {
                                    levels: { type: "array", items: { type: "string" } },
                                    raw_text: { type: ["string", "null"] }
                                },
                                required: ["levels", "raw_text"]
                            },
                            employment: {
                                type: "object",
                                properties: {
                                    statuses: { type: "array", items: { type: "string" } },
                                    raw_text: { type: ["string", "null"] }
                                },
                                required: ["statuses", "raw_text"]
                            },
                            income: {
                                type: "object",
                                properties: {
                                    min: { type: ["number", "null"] },
                                    max: { type: ["number", "null"] },
                                    period: { type: ["string", "null"], enum: ["monthly", "annual", "null"] },
                                    scope: { type: ["string", "null"] },
                                    raw_text: { type: ["string", "null"] }
                                },
                                required: ["min", "max", "period", "scope", "raw_text"]
                            },
                            residency: {
                                type: "object",
                                properties: {
                                    locations: { type: "array", items: { type: "string" } },
                                    raw_text: { type: ["string", "null"] }
                                },
                                required: ["locations", "raw_text"]
                            },
                            other_requirements: { type: "array", items: { type: "string" } }
                        },
                        required: ["age", "education", "employment", "income", "residency", "other_requirements"]
                    },
                    benefits: { type: "array", items: { type: "string" } },
                    requirements: { type: "array", items: { type: "string" } },
                    application: {
                        type: "object",
                        properties: {
                            start_date: { type: ["string", "null"] },
                            deadline: { type: ["string", "null"] },
                            process: { type: ["string", "null"] },
                            url: { type: ["string", "null"] }
                        },
                        required: ["start_date", "deadline", "process", "url"]
                    },
                    status: { type: "string", enum: ["open", "ongoing", "upcoming", "closed", "unknown"] }
                },
                required: ["title", "provider", "category", "description", "coverage", "eligibility", "benefits", "requirements", "application", "status"]
            }
        }
    },
    required: ["programs"]
};

const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE', 
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'gpt-4o-mini', 
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Extract data from this text:\n\n${cleanText}` }
        ],
        response_format: { 
            type: "json_schema", 
            json_schema: {
                name: "parasayo_programs",
                schema: parasayoSchema,
                strict: true
            }
        },
        temperature: 0.1
    })
});

const aiData = await response.json();

let finalPrograms = [];
try {
    const parsedPayload = JSON.parse(aiData.choices[0].message.content);
    finalPrograms = parsedPayload.programs || [];
} catch (e) {
    console.error("Failed to parse LLM response:", e);
    return [];
}

finalPrograms.forEach(program => {
    program.source = {
        url: sourceUrl,
        last_verified_at: currentTimestamp
    };
});

return finalPrograms;