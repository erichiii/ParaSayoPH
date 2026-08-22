const source_url = input.url;

let rules = {};
try {
    rules = typeof input.rules === 'string' ? JSON.parse(input.rules) : (input.rules || {});
} catch (e) {
    console.warn("Parser warning: input.rules is not a valid JSON string. Falling back to defaults.");
}

let rawTitle = input.title;
if (!rawTitle) {
    rawTitle = $('h1.entry-title').first().text().trim() || 
               $('h1.post-title').first().text().trim() || 
               $('article h1').first().text().trim() || 
               $('h1').first().text().trim();
}

const pageText = $('body').text();
const pageTextLower = pageText.toLowerCase();

if (rules?.blacklists?.pages && containsAny(pageTextLower, rules.blacklists.pages)) {
    return [];
}

function buildRegex(patternStr, flags = 'i') {
    return new RegExp(patternStr, flags);
}

function containsAny(text, keywordsArray) {
    if (!text || !keywordsArray || !Array.isArray(keywordsArray)) return false;
    const lowerText = text.toLowerCase();
    return keywordsArray.some(kw => lowerText.includes(kw.toLowerCase()));
}

function cleanTitle(text, rulesArray) {
    if (!rulesArray) return text.replace(/\s+/g, ' ').trim();
    let cleaned = text;
    for (const rule of rulesArray) {
        const regex = buildRegex(rule.pattern, rule.flags);
        cleaned = cleaned.replace(regex, rule.replacement);
    }
    return cleaned.replace(/\s+/g, ' ').trim();
}

function extractProvider(title, text, providersMap) {
    if (!providersMap) return "";
    const titleUpper = (title || "").toUpperCase();
    
    for (const [providerName, keywords] of Object.entries(providersMap)) {
        if (keywords.some(kw => titleUpper.includes(kw.toUpperCase()))) {
            return providerName;
        }
    }
    
    const textSnippet = (text || "").substring(0, 3000).toUpperCase();
    for (const [providerName, keywords] of Object.entries(providersMap)) {
        if (keywords.some(kw => textSnippet.includes(kw.toUpperCase()))) {
            return providerName;
        }
    }
    return "";
}

function parseDate(text, dateRules) {
    if (!dateRules || !dateRules.pattern) return "";
    const regex = buildRegex(dateRules.pattern, dateRules.flags);
    const match = text.match(regex);
    if (match) {
        const monthText = match[1].toLowerCase();
        const m = dateRules.months[monthText];
        const d = match[2].padStart(2, '0');
        const y = match[3];
        return `${y}-${m}-${d}`;
    }
    return "";
}

function tokenizeSentences(text) {
    if (!text) return [];
    return text.split(/\n+/).reduce((acc, line) => {
        const sentences = line.match(/[^.!?]+[.!?]+(\s|$)/g) || [line];
        return acc.concat(sentences.map(s => s.trim()).filter(s => s.length > 0));
    }, []);
}

function extractAge(text, ageRules) {
    if (!ageRules || !ageRules.pattern) return { min: -1, max: -1, raw_text: "" };
    const sentences = tokenizeSentences(text);
    const regex = buildRegex(ageRules.pattern, ageRules.flags);
    
    for (const sentence of sentences) {
        if (containsAny(sentence, ageRules.exclusions)) continue;
        const match = sentence.match(regex);
        if (match) {
            const ageVal = parseInt(match[1] || match[2] || match[3], 10);
            if (!isNaN(ageVal) && ageVal >= 10 && ageVal <= 65) {
                return { min: -1, max: ageVal, raw_text: sentence.trim() };
            }
        }
    }
    return { min: -1, max: -1, raw_text: "" };
}

function extractIncome(text, incomeRules) {
    if (!incomeRules || !incomeRules.pattern) return { min: -1, max: -1, period: "", scope: "", raw_text: "" };
    const sentences = tokenizeSentences(text);
    const regex = buildRegex(incomeRules.pattern, incomeRules.flags);
    
    for (const sentence of sentences) {
        if (containsAny(sentence, incomeRules.keywords)) {
            const match = sentence.match(regex);
            if (match) {
                const amount = parseFloat(match[1].replace(/,/g, ''));
                if (!isNaN(amount) && amount >= 1000) {
                    let scope = "";
                    for (const [scopeName, scopeKeywords] of Object.entries(incomeRules.scope_mapping || {})) {
                        if (containsAny(sentence, scopeKeywords)) scope = scopeName;
                    }
                    
                    let period = "annual";
                    if (containsAny(sentence, incomeRules.period_mapping?.annual)) {
                        period = "annual";
                    } else if (containsAny(sentence, incomeRules.period_mapping?.monthly)) {
                        period = "monthly";
                    }

                    return { min: -1, max: amount, period: period, scope: scope, raw_text: sentence.trim() };
                }
            }
        }
    }
    return { min: -1, max: -1, period: "", scope: "", raw_text: "" };
}

function extractEducation(text, eduRules) {
    if (!eduRules || !eduRules.levels) return { levels: [], raw_text: "" };
    const levels = [];
    const lower = text.toLowerCase();
    const isCollegeRegex = buildRegex(eduRules.is_college_pattern || 'college', eduRules.flags || 'i');
    const isCollege = isCollegeRegex.test(lower);
    
    for (const [levelKey, patternStr] of Object.entries(eduRules.levels)) {
        const levelRegex = buildRegex(patternStr, eduRules.flags || 'i');
        if (levelRegex.test(lower)) {
            if (levelKey === 'senior_high_school' && isCollege) continue;
            if (!levels.includes(levelKey)) levels.push(levelKey);
        }
    }
    
    let raw_text = "";
    const sentences = tokenizeSentences(text);
    const subjRegex = buildRegex(eduRules.raw_text_triggers?.subject || 'college', eduRules.flags || 'i');
    const actRegex = buildRegex(eduRules.raw_text_triggers?.action || 'open', eduRules.flags || 'i');
    
    for (const s of sentences) {
        if (subjRegex.test(s) && actRegex.test(s)) {
            raw_text = s.trim();
            break;
        }
    }
    return { levels: levels, raw_text: raw_text };
}

function extractCoverage(text, coverageRules) {
    const locations = [];
    if (!coverageRules) return { type: "unknown", locations: [] };
    
    if (coverageRules.locations) {
        for (const loc of coverageRules.locations) {
            const regex = new RegExp(`\\b${loc}\\b`, 'i');
            if (regex.test(text)) {
                locations.push(loc);
            }
        }
    }
    
    let type = "unknown";
    if (locations.length > 0) {
        type = "provincial";
    } else if (containsAny(text, coverageRules.nationwide_keywords || ["nationwide", "philippines"])) {
        type = "nationwide";
        locations.push("Philippines");
    }
    return { type: type, locations: [...new Set(locations)] };
}

function extractFieldsFromText(text, fieldsRules, extractedCategories, extractedPrograms) {
    if (!text || !fieldsRules) return false;
    let foundAny = false;

    for (const [category, programs] of Object.entries(fieldsRules)) {
        let categoryMatched = false;
        for (const [program, patterns] of Object.entries(programs)) {
            for (const patternStr of patterns) {
                const regex = buildRegex(patternStr, 'i');
                if (regex.test(text)) {
                    extractedPrograms.add(program);
                    categoryMatched = true;
                    foundAny = true;
                }
            }
        }
        if (categoryMatched) extractedCategories.add(category);
    }
    return foundAny;
}

function cleanApplicationUrl(href, paramsToRemove) {
    if (!href) return "";
    try {
        const urlObj = new URL(href);
        if (paramsToRemove) paramsToRemove.forEach(p => urlObj.searchParams.delete(p));
        return urlObj.toString();
    } catch (e) {
        return href.split('?')[0];
    }
}

const contentWrapperClass = rules?.dom_traversal?.content_wrapper || '.entry-content';

const stepPattern = rules?.dom_traversal?.step_pattern || '^step\\s*\\d+';
const residencyTriggers = rules?.extraction?.residency?.raw_triggers || 'resident|residency|residing|township|project';
const incomeExclusions = rules?.extraction?.other_requirements?.income_exclusions || 'income|gross|₱|php|\\$';
const introTriggers = rules?.dom_traversal?.intro_triggers || 'supports academically deserving students|provides educational assistance|aims to help';
const nestedListKeywords = rules?.dom_traversal?.nested_list_keywords || 'whichever is applicable|either|or|any of the following';
const mixedConditions = rules?.extraction?.other_requirements?.mixed_conditions || 'grade|gpa|average|citizen|moral|health|exam|score';
const deadlineKeywords = rules?.dom_traversal?.section_triggers?.deadline || ["deadline", "timeline", "application period", "schedule"];
const processKeywords = rules?.dom_traversal?.process_action_keywords || ["submit", "portal", "fill", "upload"];
const fieldsRules = rules?.extraction?.fields_of_study || {};
const coverageConfig = rules?.extraction?.coverage || { locations: [], nationwide_keywords: ["nationwide", "philippines"] };

const residencyRegex = buildRegex(residencyTriggers, 'i');
const incomeExclusionsRegex = buildRegex(incomeExclusions, 'i');
const introTriggersRegex = buildRegex(introTriggers, 'i');
const nestedListRegex = buildRegex(nestedListKeywords, 'i');
const mixedConditionsRegex = buildRegex(mixedConditions, 'i');

let activeSection = "intro";
let descriptionParts = [];
let otherRequirements = [];
let residencyRaw = "";
let requirements = [];
let benefits = [];
let processSteps = [];
let fieldsRawTextParts = [];
let fieldsCategories = new Set();
let fieldsPrograms = new Set();
let deadline = "";
let applicationUrl = "";
let currentStepHeader = null; 

$('a').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text();
    const urlTriggers = rules?.dom_traversal?.application_url_triggers || ["access application", "/apply/form"];
    
    if (href && !href.startsWith('#') && !applicationUrl) {
        if (containsAny(text, urlTriggers) || urlTriggers.some(t => href.toLowerCase().includes(t))) {
            applicationUrl = cleanApplicationUrl(href, rules?.url_cleanup_params || []);
        }
    }
});

function determineSection(text, triggers, stepPatternStr) {
    if (triggers) {
        for (const [sectionName, keywords] of Object.entries(triggers)) {
            if (containsAny(text, keywords)) return sectionName;
        }
    }
    const stepRegex = buildRegex(stepPatternStr, 'i');
    if (stepRegex.test(text)) return "process";
    return null;
}

$(contentWrapperClass).children().each((i, el) => {
    const tag = el.tagName.toUpperCase();
    const text = $(el).text().trim();

    if (['H2', 'H3', 'H4'].includes(tag)) {
        const sectionTriggers = rules?.dom_traversal?.section_triggers || {};
        const matchedSection = determineSection(text, sectionTriggers, stepPattern);
        if (matchedSection) activeSection = matchedSection;
        
        const stepRegex = buildRegex(stepPattern, 'i');
        if (activeSection === "process" && stepRegex.test(text)) {
            if (currentStepHeader) processSteps.push(currentStepHeader);
            currentStepHeader = text; 
        }
        return; 
    }

    if (activeSection === "ignore") return;

    if (tag === 'P') {
        if (containsAny(text, rules?.blacklists?.advice || [])) return;

        const parsedDate = parseDate(text, rules?.extraction?.date);
        if (parsedDate && (activeSection === "deadline" || containsAny(text, deadlineKeywords))) {
            deadline = parsedDate;
        }

        if (activeSection === "intro") {
            if (introTriggersRegex.test(text)) {
                descriptionParts.push(text);
            }
        } else if (activeSection === "process") {
            if (currentStepHeader) {
                processSteps.push(`${currentStepHeader}\n${text}`);
                currentStepHeader = null; 
            } else if (containsAny(text, processKeywords)) {
                processSteps.push(text);
            }
        } else if (activeSection === "fields") {
            fieldsRawTextParts.push(text);
            extractFieldsFromText(text, fieldsRules, fieldsCategories, fieldsPrograms);
        }
    } 
    else if (tag === 'UL' || tag === 'OL') {
        $(el).children('li').each((j, li) => {
            const nestedList = $(li).children('ul, ol');
            let liText;
            
            if (nestedList.length > 0) {
                const parentText = $(li).clone().children('ul, ol').remove().end().text().trim().replace(/:$/, '');
                const childItems = [];
                nestedList.find('li').each((k, childLi) => childItems.push($(childLi).text().trim()));
                
                liText = nestedListRegex.test(parentText) 
                    ? `${parentText} (${childItems.join(', ')})` 
                    : `${parentText}: ${childItems.join(', ')}`;
            } else {
                liText = $(li).text().trim();
            }

            if (!liText || containsAny(liText, rules?.blacklists?.advice || [])) return;
            if ($(li).find('a').length > 0) return;

            const parsedDate = parseDate(liText, rules?.extraction?.date);
            if (parsedDate && (activeSection === "deadline" || containsAny(liText, deadlineKeywords))) {
                deadline = parsedDate;
                return;
            }

            if (activeSection === "benefits") {
                benefits.push(liText);
            } else if (activeSection === "qualifications") {
                if (residencyRegex.test(liText)) residencyRaw = liText;
                else if (!incomeExclusionsRegex.test(liText)) otherRequirements.push(liText);
            } else if (activeSection === "requirements") {
                requirements.push(liText);
            } else if (activeSection === "fields") {
                fieldsRawTextParts.push(liText);
                extractFieldsFromText(liText, fieldsRules, fieldsCategories, fieldsPrograms);
            } else if (activeSection === "process") {
                processSteps.push(liText);
            }
        });
    }
    else if (tag === 'TABLE') {
        $(el).find('tr').each((j, tr) => {
            const cells = $(tr).find('th, td').map((k, td) => $(td).text().trim()).get().filter(Boolean);
            if (cells.length === 0) return;
            const rowText = cells.join(': ');
            if (containsAny(rowText, rules?.blacklists?.advice || [])) return;

            const parsedDate = parseDate(rowText, rules?.extraction?.date);
            if (parsedDate && (activeSection === "deadline" || containsAny(rowText, deadlineKeywords))) {
                deadline = parsedDate;
                return;
            }

            if (activeSection === "benefits") {
                benefits.push(rowText);
            } else if (activeSection === "requirements") {
                requirements.push(rowText);
            } else if (activeSection === "fields") {
                fieldsRawTextParts.push(rowText);
                extractFieldsFromText(rowText, fieldsRules, fieldsCategories, fieldsPrograms);
            }
        });
    }
});

if (currentStepHeader) processSteps.push(currentStepHeader);

const verifiedTimestamp = new Date().toISOString();
const fullBodyText = $(contentWrapperClass).text() || pageText; 

let status = "unknown";
const openStatusTriggers = rules?.status_evaluation?.open || ["applications ... are now open", "are now open", "accepting applications"];
const closedStatusTriggers = rules?.status_evaluation?.closed || ["already closed", "deadline has passed", "applications are now closed"];

if (containsAny(pageTextLower, closedStatusTriggers)) {
    status = "closed";
} else if (containsAny(pageTextLower, openStatusTriggers)) {
    status = "open";
}

if (deadline) {
    const dlDate = new Date(deadline);
    dlDate.setHours(23, 59, 59, 999);
    if (!isNaN(dlDate.getTime())) {
        if (new Date() > dlDate) {
            status = "closed";
        } else if (status !== "closed") {
            status = "open";
        }
    }
}

const finalOtherRequirements = [];
for (const req of otherRequirements) {
    const hasField = extractFieldsFromText(req, fieldsRules, fieldsCategories, fieldsPrograms);
    const hasMixedConditions = mixedConditionsRegex.test(req);

    if (hasField) {
        if (!fieldsRawTextParts.includes(req)) {
            fieldsRawTextParts.push(req);
        }
        if (hasMixedConditions) {
            finalOtherRequirements.push(req);
        }
    } else {
        finalOtherRequirements.push(req);
    }
}

const finalFieldsRawText = fieldsRawTextParts.length > 0 ? [...new Set(fieldsRawTextParts)].join("\n\n") : "";

function determineCategory(text, url, title, mappingRules) {
    if (!mappingRules) return "scholarship";
    
    const cleanUrl = (url || "").replace(/-/g, ' ');
    const targetString = ((title || "") + " " + cleanUrl + " " + (text || "")).toLowerCase();
    
    if (mappingRules.keywords) {
        for (const [categoryName, keywords] of Object.entries(mappingRules.keywords)) {
            if (keywords && keywords.length > 0 && keywords.some(kw => targetString.includes(kw.toLowerCase()))) {
                return categoryName;
            }
        }
    }
    return mappingRules.default || "other";
}

const finalProgram = {
    title: cleanTitle(rawTitle, rules?.cleaning?.title) || "",
    provider: extractProvider(rawTitle, fullBodyText, rules?.providers) || "",
    category: determineCategory(fullBodyText, source_url, rawTitle, rules?.category_mapping), 
    description: descriptionParts.join(" ") || "",
    coverage: extractCoverage(fullBodyText, coverageConfig),
    eligibility: {
        age: extractAge(fullBodyText, rules?.extraction?.age),
        education: extractEducation(fullBodyText, rules?.extraction?.education),
        employment: { statuses: [], raw_text: "" },
        income: extractIncome(fullBodyText, rules?.extraction?.income),
        residency: { locations: [], raw_text: residencyRaw },
        fields: {
            categories: [...fieldsCategories],
            programs: [...fieldsPrograms],
            raw_text: finalFieldsRawText
        },
        other_requirements: finalOtherRequirements
    },
    benefits: [...new Set(benefits)],
    requirements: [...new Set(requirements)],
    application: {
        start_date: "",
        deadline: deadline ? deadline : "",
        process: processSteps.length > 0 ? processSteps.join("\n\n") : "",
        url: applicationUrl || ""
    },
    source: { 
        url: source_url || "", 
        last_verified_at: verifiedTimestamp 
    },
    status: status
};

return [finalProgram];