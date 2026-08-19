const source_url = input.url;

let rules = null;
try {
    rules = typeof input.rules === 'string' ? JSON.parse(input.rules) : input.rules;
} catch(e) {
    throw new Error("Parser failed: input.rules is not a valid JSON string.");
}

const rawTitle = input.title || $('h1.entry-title, h1.post-title, h1').first().text().trim();
const pageText = $('body').text();
const pageTextLower = pageText.toLowerCase();

function buildRegex(patternStr, flags) {
    return new RegExp(patternStr, flags);
}

function containsAny(text, keywordsArray) {
    const lowerText = text.toLowerCase();
    return keywordsArray.some(kw => lowerText.includes(kw.toLowerCase()));
}

function cleanTitle(text, rulesArray) {
    let cleaned = text;
    for (const rule of rulesArray) {
        const regex = buildRegex(rule.pattern, rule.flags);
        cleaned = cleaned.replace(regex, rule.replacement);
    }
    return cleaned.replace(/\s+/g, ' ').trim();
}

function extractProvider(title, text, providersMap) {
    const titleUpper = title.toUpperCase();
    const textSnippet = text.substring(0, 500).toUpperCase();
    for (const [providerName, keywords] of Object.entries(providersMap)) {
        if (keywords.some(kw => titleUpper.includes(kw.toUpperCase()) || textSnippet.includes(kw.toUpperCase()))) {
            return providerName;
        }
    }
    return null;
}

function parseDate(text, dateRules) {
    const regex = buildRegex(dateRules.pattern, dateRules.flags);
    const match = text.match(regex);
    if (match) {
        const monthText = match[1].toLowerCase();
        const m = dateRules.months[monthText];
        const d = match[2].padStart(2, '0');
        const y = match[3];
        return `${y}-${m}-${d}`;
    }
    return null;
}

function extractAge(text, ageRules) {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    const regex = buildRegex(ageRules.pattern, ageRules.flags);
    
    for (const sentence of sentences) {
        if (containsAny(sentence, ageRules.exclusions)) continue;
        const match = sentence.match(regex);
        if (match) {
            const ageVal = parseInt(match[1] || match[2], 10);
            if (!isNaN(ageVal) && ageVal >= 10 && ageVal <= 65) {
                return { min: null, max: ageVal, raw_text: sentence.trim() };
            }
        }
    }

    return null; 
}

function extractIncome(text, incomeRules) {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    const regex = buildRegex(incomeRules.pattern, incomeRules.flags);
    
    for (const sentence of sentences) {
        if (containsAny(sentence, incomeRules.keywords)) {
            const match = sentence.match(regex);
            if (match) {
                const amount = parseFloat(match[1].replace(/,/g, ''));
                if (!isNaN(amount) && amount >= 1000) {
                    let scope = "household";
                    for (const [scopeName, scopeKeywords] of Object.entries(incomeRules.scope_mapping)) {
                        if (containsAny(sentence, scopeKeywords)) scope = scopeName;
                    }
                    let period = "annual";
                    for (const [periodName, periodKeywords] of Object.entries(incomeRules.period_mapping)) {
                        if (containsAny(sentence, periodKeywords)) period = periodName;
                    }
                    return { min: null, max: amount, period: period, scope: scope, raw_text: sentence.trim() };
                }
            }
        }
    }
    return { min: null, max: null, period: null, scope: null, raw_text: null };
}

function extractEducation(text, eduRules) {
    const levels = [];
    const lower = text.toLowerCase();
    const isCollegeRegex = buildRegex(eduRules.is_college_pattern, eduRules.flags);
    const isCollege = isCollegeRegex.test(lower);
    
    for (const [levelKey, patternStr] of Object.entries(eduRules.levels)) {
        const levelRegex = buildRegex(patternStr, eduRules.flags);
        if (levelRegex.test(lower)) {
            if (levelKey === 'senior_high_school' && isCollege) continue;
            if (!levels.includes(levelKey)) levels.push(levelKey);
        }
    }
    
    let raw_text = null;
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    const subjRegex = buildRegex(eduRules.raw_text_triggers.subject, eduRules.flags);
    const actRegex = buildRegex(eduRules.raw_text_triggers.action, eduRules.flags);
    
    for (const s of sentences) {
        if (subjRegex.test(s) && actRegex.test(s)) {
            raw_text = s.trim();
            break;
        }
    }
    return { levels: levels, raw_text: raw_text };
}

function cleanApplicationUrl(href, paramsToRemove) {
    if (!href) return null;
    try {
        const urlObj = new URL(href);
        paramsToRemove.forEach(p => urlObj.searchParams.delete(p));
        return urlObj.toString();
    } catch (e) {
        return href.split('?')[0];
    }
}

let activeSection = "intro";
let descriptionParts = [];
let otherRequirements = [];
let residencyRaw = null;
let requirements = [];
let benefits = [];
let processSteps = [];
let deadline = null;
let applicationUrl = null;
let currentStepHeader = null; 

$('a').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text();
    if (href && !href.startsWith('#') && !applicationUrl) {
        if (containsAny(text, rules.dom_traversal.application_url_triggers) || 
            rules.dom_traversal.application_url_triggers.some(t => href.toLowerCase().includes(t))) {
            applicationUrl = cleanApplicationUrl(href, rules.url_cleanup_params);
        }
    }
});

function determineSection(text, triggers) {
    for (const [sectionName, keywords] of Object.entries(triggers)) {
        if (containsAny(text, keywords)) return sectionName;
    }
    if (/^step\s*\d+/i.test(text)) return "process";
    return null;
}

$('.entry-content').children().each((i, el) => {
    const tag = el.tagName.toUpperCase();
    const text = $(el).text().trim();
    const textLower = text.toLowerCase();

    if (['H2', 'H3', 'H4'].includes(tag)) {
        const matchedSection = determineSection(text, rules.dom_traversal.section_triggers);
        if (matchedSection) activeSection = matchedSection;
        
        if (activeSection === "process" && /^step\s*\d+/i.test(text)) {
            if (currentStepHeader) processSteps.push(currentStepHeader);
            currentStepHeader = text; 
        }
        return; 
    }

    if (activeSection === "ignore") return;

    if (tag === 'P') {
        if (containsAny(text, rules.blacklists.advice)) return;

        const parsedDate = parseDate(text, rules.extraction.date);
        if (parsedDate && (textLower.includes('deadline') || activeSection === "deadline")) deadline = parsedDate;

        if (activeSection === "intro") {
            if (/supports academically deserving students|provides educational assistance|aims to help/i.test(text)) {
                descriptionParts.push(text);
            }
        } else if (activeSection === "process") {
            if (currentStepHeader) {
                processSteps.push(`${currentStepHeader}\n${text}`);
                currentStepHeader = null; 
            } else if (containsAny(text, ["submit", "portal", "fill", "upload"])) {
                processSteps.push(text);
            }
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
                
                liText = /whichever is applicable|either|or|any of the following/i.test(parentText) 
                    ? `${parentText} (${childItems.join(', ')})` 
                    : `${parentText}: ${childItems.join(', ')}`;
            } else {
                liText = $(li).text().trim();
            }

            if (!liText || containsAny(liText, rules.blacklists.advice)) return;
            if ($(li).find('a').length > 0) return;

            const parsedDate = parseDate(liText, rules.extraction.date);
            if (parsedDate && (liText.toLowerCase().includes('deadline') || activeSection === "deadline")) {
                deadline = parsedDate;
                return;
            }

            if (activeSection === "benefits") {
                benefits.push(liText);
            } else if (activeSection === "qualifications") {
                if (/resident|residency|residing|township|project/i.test(liText)) residencyRaw = liText;
                else if (!/income|gross|₱|php/i.test(liText)) otherRequirements.push(liText);
            } else if (activeSection === "requirements") {
                requirements.push(liText);
            } else if (activeSection === "process") {
                processSteps.push(liText);
            }
        });
    }
});

if (currentStepHeader) processSteps.push(currentStepHeader);

const verifiedTimestamp = new Date().toISOString();
const fullBodyText = $('.entry-content').text() || pageText;

let status = "unknown";
if (containsAny(pageTextLower, rules.status_evaluation.open)) {
    if (deadline && new Date(deadline) >= new Date()) status = "open";
    else if (!deadline) status = "open";
}

const finalProgram = {
    title: cleanTitle(rawTitle, rules.cleaning.title),
    provider: extractProvider(rawTitle, pageText, rules.providers),
    category: "scholarship",
    description: descriptionParts.join(" ") || null,
    coverage: { type: "unknown", locations: [] },
    eligibility: {
        age: extractAge(fullBodyText, rules.extraction.age),
        education: extractEducation(fullBodyText, rules.extraction.education),
        employment: { statuses: [], raw_text: null },
        income: extractIncome(fullBodyText, rules.extraction.income),
        residency: { locations: [], raw_text: residencyRaw },
        other_requirements: otherRequirements
    },
    benefits: [...new Set(benefits)],
    requirements: [...new Set(requirements)],
    application: {
        start_date: null,
        deadline: deadline,
        process: processSteps.length > 0 ? processSteps.join("\n\n") : null,
        url: applicationUrl
    },
    source: { url: source_url, last_verified_at: verifiedTimestamp },
    status: status
};

return [finalProgram];