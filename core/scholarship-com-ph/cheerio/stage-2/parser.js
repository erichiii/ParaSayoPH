const source_url = input.url;
const pageTitle = input.title || $('h1.entry-title, h1.post-title').first().text().trim();
const pageText = $('body').text();
const pageTextUpper = pageText.toUpperCase();

const groupHeaderBlacklist = [
    'who is this', 'what is a', 'important reminder', 'before you apply', 'frequently asked', 
    'general guide', 'how to apply', 'documents you need', 'local government', 
    'scholarships that are not', 'other scholarships', 'table of contents', 'summary', 
    'conclusion', 'share this', 'scholarship guides', 'about', 'overview', 'history', 
    'qualifications', 'requirements', 'benefits', 'priority courses', 'partner schools', 
    'application deadline', 'contact details', 'final thoughts', 'reference', 'courses', 'schools'
];

const programKeywords = [
    'scholarship', 'program', 'grant', 'assistance', 'subsidy', 
    'fund', 'fellowship', 'financial help', 'tulong dunong', 'iskolar'
];

const adviceBlacklist = [
    'prepare your documents', 'check if the', 'confirm that you',
    'review the accepted', 'follow the correct', 'submit your application',
    'keep a copy', 'check your email', 'check the official', 'apply early',
    'make sure you confirm', 'check the latest announcement', 'before you submit',
    'the programs below are connected', 'these scholarships are limited to residents',
    'read the official requirements carefully', 'watch the video below'
];

const docRegex = /\b(certificate|certification|id|form|transcript|tor|card|proof|itr|tax return|indigency|clearance|recommendation|photo|picture|photograph|document|grades|diploma|birth certificate|statement of account|voter|payslip|bill|bills|report|curriculum|assessment|result|letter)\b/i;

function isAdvice(text) {
    if (!text) return false;
    return adviceBlacklist.some(phrase => text.toLowerCase().includes(phrase));
}

function isGenuineProgramTitle(text) {
    const lower = text.toLowerCase().trim();
    if (text.length < 5 || text.length > 120) return false;
    if (/^[0-9]+\.\s+/.test(text)) return true;
    if (groupHeaderBlacklist.some(phrase => lower.includes(phrase))) return false;
    return programKeywords.some(kw => lower.includes(kw));
}

function splitIntoSentences(text) {
    return text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
}

function parseDate(text) {
    const months = {
        january:'01', jan:'01', february:'02', feb:'02', march:'03', mar:'03', april:'04', apr:'04',
        may:'05', june:'06', jun:'06', july:'07', jul:'07', august:'08', aug:'08', september:'09', sept:'09', sep:'09',
        october:'10', oct:'10', november:'11', nov:'11', december:'12', dec:'12'
    };
    const regex = /(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+(\d{1,2}),?\s+(\d{4})/i;
    const match = text.match(regex);
    if(match) {
        const m = months[match[1].toLowerCase()];
        const d = match[2].padStart(2, '0');
        const y = match[3];
        return `${y}-${m}-${d}`;
    }
    return null;
}

function extractAge(text) {
    const sentences = splitIntoSentences(text);
    for (const sentence of sentences) {
        const match = sentence.match(/(?:not\s*more\s*than|no\s*more\s*than|maximum\s*of|under|below|must\s*be\s*at\s*most)\s*(\d{1,2})\s*(?:years?\s*old|y\/?o)?/i);
        if (match) {
            return { min: null, max: parseInt(match[1], 10) || null, raw_text: sentence.trim() };
        }
    }
    return { min: null, max: null, raw_text: null };
}

function extractIncome(text) {
    const sentences = splitIntoSentences(text);
    for (const sentence of sentences) {
        const hasIncomeKeyword = /(?:income|gross|salary|financial capacity|earnings)/i.test(sentence);
        const amountMatch = sentence.match(/(?:₱|PHP|Php)\s*([\d,]+(?:\.\d+)?)/i);

        if (hasIncomeKeyword && amountMatch) {
            const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
            if (!isNaN(amount) && amount >= 1000) {
                let scope = "household";
                if (/parent/i.test(sentence)) scope = "parents";
                else if (/family/i.test(sentence)) scope = "family";
                return { min: null, max: amount, period: /month/i.test(sentence) ? "monthly" : "annual", scope: scope, raw_text: sentence.trim() };
            }
        }
    }
    return { min: null, max: null, period: null, scope: null, raw_text: null };
}

function extractEducation(text) {
    const sentences = splitIntoSentences(text);
    const levels = [];
    let isolatedRawText = null;

    for (const sentence of sentences) {
        const lower = sentence.toLowerCase();
        let matched = false;

        if (lower.includes('incoming first-year college') || lower.includes('incoming college freshman') || lower.includes('freshmen')) {
            if (!levels.includes('incoming_first_year_college')) levels.push('incoming_first_year_college');
            matched = true;
        }
        if (lower.includes('grade 12') || lower.includes('senior high')) {
            if (!levels.includes('senior_high_school')) levels.push('senior_high_school');
            matched = true;
        }
        if (lower.includes('undergraduate') || lower.includes('college')) {
            if (!levels.includes('college')) levels.push('college');
            matched = true;
        }
        if (lower.includes('tvet') || lower.includes('technical-vocational')) {
            if (!levels.includes('tvet')) levels.push('tvet');
            matched = true;
        }
        if (matched && !isolatedRawText) isolatedRawText = sentence.trim();
    }
    return { levels: levels, raw_text: isolatedRawText };
}

function extractProvider(text) {
    if (!text) return null;
    const upper = text.toUpperCase();
    if (upper.includes('COMMISSION ON HIGHER EDUCATION') || upper.includes('CHED')) return 'Commission on Higher Education';
    if (upper.includes('DEPARTMENT OF SCIENCE AND TECHNOLOGY') || upper.includes('DOST')) return 'Department of Science and Technology';
    if (upper.includes('DSWD')) return 'Department of Social Welfare and Development';
    if (upper.includes('TESDA')) return 'Technical Education and Skills Development Authority';
    if (upper.includes('NCIP') || upper.includes('NATIONAL COMMISSION ON INDIGENOUS PEOPLES')) return 'National Commission on Indigenous Peoples';
    if (upper.includes('LANDBANK')) return 'Land Bank of the Philippines';
    if (upper.includes('MEGAWORLD')) return 'Megaworld Foundation';
    if (upper.includes('BFAR') || upper.includes('BUREAU OF FISHERIES')) return 'Bureau of Fisheries and Aquatic Resources';
    if (upper.includes('DAR') || upper.includes('DEPARTMENT OF AGRARIAN REFORM')) return 'Department of Agrarian Reform';
    if (upper.includes('GSIS')) return 'Government Service Insurance System';
    return null;
}

function createEmptyProgram(title, provider) {
    return {
        title: title,
        provider: provider,
        category: "scholarship",
        description: "",
        coverage: { type: "unknown", locations: [] },
        eligibility: {
            age: { min: null, max: null, raw_text: null },
            education: { levels: [], raw_text: null },
            employment: { statuses: [], raw_text: null },
            income: { min: null, max: null, period: null, scope: null, raw_text: null },
            residency: { locations: [], raw_text: null },
            other_requirements: []
        },
        benefits: [],
        requirements: [],
        application: { start_date: null, deadline: null, process: null, url: null },
        source: { url: source_url, last_verified_at: new Date().toISOString() },
        status: "unknown",
        _process_lines: []
    };
}

const programs = [];
const contentNodes = $('.entry-content').children();

let currentProgram = createEmptyProgram(pageTitle, extractProvider(pageTitle) || extractProvider($('body').text()));
let activeSection = "description";

contentNodes.each((i, el) => {
    const tag = el.tagName.toUpperCase();
    const text = $(el).text().trim();
    const textLower = text.toLowerCase();

    if (['H2', 'H3', 'H4'].includes(tag)) {
        if (isGenuineProgramTitle(text)) {
            if (currentProgram && (currentProgram.description || currentProgram.benefits.length > 0 || currentProgram.requirements.length > 0 || currentProgram.eligibility.other_requirements.length > 0)) {
                programs.push(currentProgram);
            }
            
            const cleanedTitle = text.replace(/^[0-9]+\.\s*/, '').trim();
            currentProgram = createEmptyProgram(cleanedTitle, extractProvider(text) || currentProgram.provider);
            activeSection = "description";
        } else {
            if (textLower.includes('qualification') || textLower.includes('who can apply') || textLower.includes('eligible')) activeSection = "eligibility";
            else if (textLower.includes('requirement') || textLower.includes('document')) activeSection = "requirements";
            else if (textLower.includes('benefit') || textLower.includes('coverage') || textLower.includes('privilege')) activeSection = "benefits";
            else if (textLower.includes('apply') || textLower.includes('process') || textLower.includes('procedure')) activeSection = "process";
            else if (textLower.includes('deadline')) activeSection = "deadline";
            else if (textLower.includes('course') || textLower.includes('school') || textLower.includes('contact') || textLower.includes('about') || textLower.includes('overview') || textLower.includes('history') || textLower.includes('final thoughts')) activeSection = "ignore";
        }
    } else if (currentProgram && activeSection !== "ignore") {
        
        if (tag === 'P') {
            if (isAdvice(text)) return;

            const parsedDate = parseDate(text);
            if (parsedDate && (textLower.includes('deadline') || activeSection === "deadline")) {
                currentProgram.application.deadline = parsedDate;
            }

            const ageData = extractAge(text);
            if (ageData.max !== null && currentProgram.eligibility.age.max === null) currentProgram.eligibility.age = ageData;

            const incData = extractIncome(text);
            if (incData.max !== null && currentProgram.eligibility.income.max === null) currentProgram.eligibility.income = incData;

            const eduData = extractEducation(text);
            if (eduData.levels.length > 0 && currentProgram.eligibility.education.levels.length === 0) currentProgram.eligibility.education = eduData;

            if (activeSection === "description" || activeSection === "eligibility") {
                if (!textLower.includes('view more details') && !textLower.includes('official link')) {
                    currentProgram.description += (currentProgram.description ? " " : "") + text;
                }
            } else if (activeSection === "process") {
                currentProgram._process_lines.push(text);
            }

            const href = $(el).find('a').attr('href');
            if (href && !href.startsWith('#') && (textLower.includes('apply') || textLower.includes('portal') || textLower.includes('view more details'))) {
                currentProgram.application.url = href;
            }

        } else if (tag === 'UL' || tag === 'OL') {
            $(el).find('li').each((j, li) => {
                const liText = $(li).clone().children('ul, ol').remove().end().text().trim();
                
                if (!liText || isAdvice(liText)) return;
                if ($(li).find('a').length > 0) return; 

                const parsedDate = parseDate(liText);
                if (parsedDate && (liText.toLowerCase().includes('deadline') || activeSection === "deadline")) {
                    currentProgram.application.deadline = parsedDate;
                }

                const isDocument = docRegex.test(liText);

                if (activeSection === "benefits") {
                    currentProgram.benefits.push(liText);
                } else if (activeSection === "requirements" || activeSection === "eligibility") {
                    if (isDocument) currentProgram.requirements.push(liText);
                    else currentProgram.eligibility.other_requirements.push(liText);
                } else {
                    if (isDocument) currentProgram.requirements.push(liText);
                    else currentProgram.eligibility.other_requirements.push(liText);
                }
            });
        }
    }
});

if (currentProgram && (currentProgram.description || currentProgram.benefits.length > 0 || currentProgram.requirements.length > 0 || currentProgram.eligibility.other_requirements.length > 0)) {
    programs.push(currentProgram);
}

programs.forEach(p => {
    if (p._process_lines && p._process_lines.length > 0) {
        p.application.process = p._process_lines.join("\n").substring(0, 800);
    }
    delete p._process_lines;

    if (!p.description || p.description.trim() === "") p.description = null;
    if (!p.application.process || p.application.process.trim() === "") p.application.process = null;
    if (!p.application.url || p.application.url.trim() === "") p.application.url = null;

    if (pageTextUpper.includes("FILIPINO CITIZEN") && !p.eligibility.other_requirements.includes("Must be a Filipino citizen.")) {
        p.eligibility.other_requirements.unshift("Must be a Filipino citizen.");
    }
    
    if (p.application.deadline === "Check official page") p.application.deadline = null; 
});

return programs;