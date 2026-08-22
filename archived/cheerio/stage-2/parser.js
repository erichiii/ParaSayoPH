const source_url = input.url;
const rawTitle = input.title || $('h1.entry-title, h1.post-title, h1').first().text().trim();
const pageText = $('body').text();
const pageTextLower = pageText.toLowerCase();

function cleanTitle(text) {
    return text
        .replace(/\bMega\s+World\b/gi, 'Megaworld')
        .replace(/20\d{2}[–-]20\d{2}/g, '')
        .replace(/\b(Application Guide|Guide|Philippines|Online Form|Details|Overview)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractProvider(title, text) {
    const titleUpper = title.toUpperCase();
    const textSnippet = text.substring(0, 500).toUpperCase();
    
    if (titleUpper.includes('MEGAWORLD') || titleUpper.includes('MEGA WORLD') || textSnippet.includes('MEGAWORLD')) return 'Megaworld Foundation, Inc.';
    if (titleUpper.includes('CHED') || titleUpper.includes('COMMISSION ON HIGHER EDUCATION')) return 'Commission on Higher Education';
    if (titleUpper.includes('DOST') || titleUpper.includes('SCIENCE AND TECHNOLOGY')) return 'Department of Science and Technology';
    if (titleUpper.includes('OWWA')) return 'Overseas Workers Welfare Administration';
    if (titleUpper.includes('LANDBANK')) return 'Land Bank of the Philippines';
    if (titleUpper.includes('GSIS')) return 'Government Service Insurance System';
    
    return null;
}

function parseDate(text) {
    const months = {
        january:'01', feb:'02', february:'02', mar:'03', march:'03', apr:'04', april:'04',
        may:'05', jun:'06', june:'06', jul:'07', july:'07', aug:'08', august:'08',
        sep:'09', sept:'09', september:'09', oct:'10', october:'10', nov:'11', november:'11', dec:'12', december:'12'
    };
    const regex = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{4})/i;
    const match = text.match(regex);
    if (match) {
        const m = months[match[1].toLowerCase()];
        const d = match[2].padStart(2, '0');
        const y = match[3];
        return `${y}-${m}-${d}`;
    }
    return null;
}

function extractAge(text) {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    for (const sentence of sentences) {
        if (/%|percent|grade|average|gpa|score/i.test(sentence)) continue;
        const match = sentence.match(/(?:(?:not\s*more\s*than|no\s*more\s*than|maximum\s*of|under|below|must\s*be\s*at\s*most)\s*(\d{1,2})\s*(?:years?\s*(?:old|of\s*age)|y\/?o)|\bage\s*(?:limit\s*of|of|must\s*be\s*(?:under|below|at\s*most))?\s*(\d{1,2})\b)/i);
        if (match) {
            const ageVal = parseInt(match[1] || match[2], 10);
            if (!isNaN(ageVal) && ageVal >= 10 && ageVal <= 65) {
                return { min: null, max: ageVal, raw_text: sentence.trim() };
            }
        }
    }
    return { min: null, max: null, raw_text: null };
}

function extractIncome(text) {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    for (const sentence of sentences) {
        const hasKeyword = /(?:income|gross|salary|financial capacity|earnings)/i.test(sentence);
        const amountMatch = sentence.match(/(?:₱|PHP|Php)\s*([\d,]+(?:\.\d+)?)/i);
        if (hasKeyword && amountMatch) {
            const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
            if (!isNaN(amount) && amount >= 1000) {
                let scope = "household";
                if (/parent/i.test(sentence)) scope = "parents";
                else if (/family/i.test(sentence)) scope = "family";
                return {
                    min: null, max: amount,
                    period: /month/i.test(sentence) ? "monthly" : "annual",
                    scope: scope, raw_text: sentence.trim()
                };
            }
        }
    }
    return { min: null, max: null, period: null, scope: null, raw_text: null };
}

function extractEducation(text) {
    const levels = [];
    const lower = text.toLowerCase();
    
    const isCollege = /college|undergraduate|bachelor|degree|freshm[ae]n|sophomore|junior|senior|tertiary/i.test(lower);

    if (/freshm[ae]n|incoming first-year|incoming 1st year|first year college|1st year college/i.test(lower)) levels.push('incoming_first_year_college');
    if (/sophomore|second year|2nd year/i.test(lower)) levels.push('second_year_college');
    if (/junior|third year|3rd year/i.test(lower)) levels.push('third_year_college');
    if (/fourth year|4th year|graduating college/i.test(lower)) levels.push('fourth_year_college');

    if (/scholarship for senior high|open to (?:grade 11|grade 12|senior high students)/i.test(lower) && !isCollege) {
        if (!levels.includes('senior_high_school')) levels.push('senior_high_school');
    }
    if (/tvet|technical-vocational|tesda/i.test(lower) && !levels.includes('tvet')) levels.push('tvet');

    let raw_text = null;
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    for (const s of sentences) {
        if (/freshm[ae]n|sophomores?|juniors?|undergraduate|college|year level|degree program/i.test(s) && /cover|open|support|eligib|enrolled/i.test(s)) {
            raw_text = s.trim();
            break;
        }
    }

    return { levels: levels, raw_text: raw_text };
}

function cleanApplicationUrl(href) {
    if (!href) return null;
    try {
        const urlObj = new URL(href);
        ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(p => urlObj.searchParams.delete(p));
        return urlObj.toString();
    } catch (e) {
        return href.split('?')[0];
    }
}

const adviceBlacklist = [
    'prepare your documents', 'check if the', 'confirm that you',
    'review the accepted', 'follow the correct', 'submit your application',
    'keep a copy', 'check your email', 'apply early', 'read the official requirements',
    'watch the video below', 'guide covers', 'this guide will help'
];
function isAdvice(text) {
    return adviceBlacklist.some(p => text.toLowerCase().includes(p));
}

const contentNodes = $('.entry-content').children();
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
    const text = $(el).text().toLowerCase();
    if (href && !href.startsWith('#') && !applicationUrl) {
        if (text.includes('access application') || text.includes('apply form') || text.includes('application portal') || href.includes('/apply/form') || href.includes('forms.gle')) {
            applicationUrl = cleanApplicationUrl(href);
        }
    }
});

contentNodes.each((i, el) => {
    const tag = el.tagName.toUpperCase();
    const text = $(el).text().trim();
    const textLower = text.toLowerCase();

    if (['H2', 'H3', 'H4'].includes(tag)) {
        if (textLower.includes('qualification') || textLower.includes('eligible')) activeSection = "qualifications";
        else if (textLower.includes('requirement') || textLower.includes('document')) activeSection = "requirements";
        else if (textLower.includes('benefit')) activeSection = "benefits";
        else if (textLower.includes('how to apply') || textLower.includes('process') || textLower.includes('step') || /^step\s*\d+/i.test(text)) {
            activeSection = "process";
        }
        else if (textLower.includes('priority course') || textLower.includes('partner school') || textLower.includes('contact') || textLower.includes('about') || textLower.includes('final thoughts') || textLower.includes('reference')) activeSection = "ignore";
        
        if (activeSection === "process" && /^step\s*\d+/i.test(text)) {
            if (currentStepHeader) processSteps.push(currentStepHeader);
            currentStepHeader = text; 
        }
        return; 
    }

    if (activeSection === "ignore") return;

    if (tag === 'P') {
        if (isAdvice(text)) return;

        const parsedDate = parseDate(text);
        if (parsedDate && (textLower.includes('deadline') || activeSection === "deadline")) deadline = parsedDate;

        if (activeSection === "intro") {
            if (/supports academically deserving students/i.test(text) || /provides educational assistance/i.test(text) || /aims to help/i.test(text)) {
                descriptionParts.push(text);
            }
        } else if (activeSection === "process") {
            if (currentStepHeader) {
                processSteps.push(`${currentStepHeader}\n${text}`);
                currentStepHeader = null; 
            } else if (/submit|portal|fill|upload/i.test(text)) {
                processSteps.push(text);
            }
        }
    } else if (tag === 'UL' || tag === 'OL') {
        $(el).children('li').each((j, li) => {
            const nestedList = $(li).children('ul, ol');
            let liText;
            
            if (nestedList.length > 0) {
                const parentText = $(li).clone().children('ul, ol').remove().end().text().trim().replace(/:$/, '');
                const childItems = [];
                nestedList.find('li').each((k, childLi) => childItems.push($(childLi).text().trim()));
                
                if (/whichever is applicable|either|or|any of the following/i.test(parentText)) {
                    liText = `${parentText} (${childItems.join(', ')})`;
                } else {
                    liText = `${parentText}: ${childItems.join(', ')}`;
                }
            } else {
                liText = $(li).text().trim();
            }

            if (!liText || isAdvice(liText)) return;
            if ($(li).find('a').length > 0) return;

            const parsedDate = parseDate(liText);
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
if (pageTextLower.includes("applications ... are now open") || pageTextLower.includes("are now open") || pageTextLower.includes("accepting applications")) {
    if (deadline && new Date(deadline) >= new Date()) status = "open";
    else if (!deadline) status = "open";
}

const finalProgram = {
    title: cleanTitle(rawTitle),
    provider: extractProvider(rawTitle, pageText),
    category: "scholarship",
    description: descriptionParts.join(" ") || null,
    coverage: { type: "unknown", locations: [] },
    eligibility: {
        age: extractAge(fullBodyText),
        education: extractEducation(fullBodyText),
        employment: { statuses: [], raw_text: null },
        income: extractIncome(fullBodyText),
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