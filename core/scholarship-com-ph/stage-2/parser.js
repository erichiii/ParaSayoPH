const source_url = input.url;
const pageTitle = input.title || $('h1.entry-title, h1.post-title').first().text().trim();
const pageText = $('body').text();
const pageTextUpper = pageText.toUpperCase();

const groupHeaderBlacklist = [
    'who is this', 'what is a', 'important reminder', 'before you apply',
    'frequently asked', 'general guide', 'how to apply', 'documents you need',
    'local government and public', 'scholarships that are not', 'other scholarships',
    'table of contents', 'summary', 'conclusion', 'share this'
];

const programKeywords = [
    'scholarship', 'program', 'grant', 'assistance', 'subsidy', 
    'fund', 'fellowship', 'financial help', 'tulong dunong', 'iskolar'
];

const adviceBlacklist = [
    'prepare your documents', 'check if the', 'confirm that you',
    'review the accepted', 'follow the correct', 'submit your application',
    'keep a copy', 'check your email', 'check the official', 'apply early',
    'make sure you confirm', 'check the latest announcement'
];

const docKeywords = [
    'certificate', 'certification', 'id', 'form', 'transcript', 'tor',
    'card', 'proof', 'itr', 'tax return', 'indigency', 'clearance',
    'recommendation', 'photo', 'picture', 'document', 'grades', 'diploma',
    'birth certificate', 'statement of account', 'voter'
];

function isAdvice(text) {
    const lower = text.toLowerCase();
    return adviceBlacklist.some(phrase => lower.includes(phrase));
}

function isGenuineProgramTitle(text) {
    const lower = text.toLowerCase().trim();
    if (text.length < 5 || text.length > 120) return false;
    if (groupHeaderBlacklist.some(phrase => lower.includes(phrase))) return false;
    return programKeywords.some(kw => lower.includes(kw));
}

function extractIncome(text) {
    const incomeRegex = /(?:parents[’']?\s*(?:combined\s*)?annual\s*income|family\s*income|household\s*income|income\s*limit|income\s*cap|income\s*not\s*exceeding|income\s*must\s*not\s*exceed)[^\.\n]*?(?:₱|PHP|Php)?\s*([\d,]+(?:\.\d+)?)/i;
    const match = text.match(incomeRegex);
    
    if (match) {
        const numericStr = match[1].replace(/,/g, '');
        const amount = parseFloat(numericStr);
        
        let scope = "household";
        if (/parent/i.test(match[0])) scope = "parents";
        else if (/family/i.test(match[0])) scope = "family";

        let period = "annual";
        if (/month/i.test(match[0])) period = "monthly";

        return {
            min: null,
            max: isNaN(amount) ? null : amount,
            period: period,
            scope: scope,
            raw_text: match[0].trim()
        };
    }

    return { min: null, max: null, period: null, scope: null, raw_text: null };
}

function extractEducation(text) {
    const lower = text.toLowerCase();
    const levels = [];

    if (lower.includes('incoming first-year college') || lower.includes('incoming college freshman') || lower.includes('freshmen')) {
        levels.push('incoming_first_year_college');
    } else if (lower.includes('grade 12') || lower.includes('senior high')) {
        levels.push('senior_high_school');
    } else if (lower.includes('undergraduate') || lower.includes('college')) {
        levels.push('college');
    } else if (lower.includes('tvet') || lower.includes('technical-vocational')) {
        levels.push('tvet');
    }

    return {
        levels: levels,
        raw_text: levels.length > 0 ? text.trim().substring(0, 300) : null
    };
}

function extractProvider(text) {
    const upper = text.toUpperCase();
    if (upper.includes('COMMISSION ON HIGHER EDUCATION') || upper.includes('CHED')) return 'Commission on Higher Education';
    if (upper.includes('DEPARTMENT OF SCIENCE AND TECHNOLOGY') || upper.includes('DOST')) return 'Department of Science and Technology';
    if (upper.includes('DSWD')) return 'Department of Social Welfare and Development';
    if (upper.includes('TESDA')) return 'Technical Education and Skills Development Authority';
    if (upper.includes('NCIP') || upper.includes('NATIONAL COMMISSION ON INDIGENOUS PEOPLES')) return 'National Commission on Indigenous Peoples';
    if (upper.includes('LANDBANK')) return 'Land Bank of the Philippines';
    if (upper.includes('MEGAWORLD')) return 'Megaworld Foundation';
    return null;
}

const programs = [];
const contentNodes = $('.entry-content').children();

let isListicle = false;
contentNodes.each((i, el) => {
    if (['H2', 'H3', 'H4'].includes(el.tagName.toUpperCase()) && isGenuineProgramTitle($(el).text())) {
        isListicle = true;
    }
});

if (isListicle) {
    let currentProgram = null;
    let activeSection = "description";

    contentNodes.each((i, el) => {
        const tag = el.tagName.toUpperCase();
        const text = $(el).text().trim();
        const textLower = text.toLowerCase();

        if (['H2', 'H3', 'H4'].includes(tag)) {
            if (isGenuineProgramTitle(text)) {
                if (currentProgram) programs.push(currentProgram);

                const cleanedTitle = text.replace(/^[0-9]+\.\s*/, '').trim();
                const detectedProvider = extractProvider(text) || extractProvider(pageTitle);

                currentProgram = {
                    title: cleanedTitle,
                    provider: detectedProvider,
                    category: "scholarship",
                    description: "",
                    coverage: {
                        type: textLower.includes("province") ? "provincial" : (pageTextUpper.includes("NATIONWIDE") ? "nationwide" : "unknown"),
                        locations: []
                    },
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
                    application: {
                        start_date: null,
                        deadline: null,
                        process: null,
                        url: null
                    },
                    source: {
                        url: source_url,
                        last_verified_at: new Date().toISOString()
                    },
                    status: "unknown",
                    _process_lines: []
                };
                activeSection = "description";

            } else {
                if (textLower.includes('requirement') || textLower.includes('qualification')) activeSection = "requirements";
                else if (textLower.includes('benefit') || textLower.includes('coverage') || textLower.includes('privilege')) activeSection = "benefits";
                else if (textLower.includes('apply') || textLower.includes('process') || textLower.includes('procedure')) activeSection = "process";
            }

        } else if (currentProgram) {
            if (tag === 'P') {
                if (isAdvice(text)) return;

                const incomeData = extractIncome(text);
                if (incomeData.max !== null && currentProgram.eligibility.income.max === null) {
                    currentProgram.eligibility.income = incomeData;
                }

                const eduData = extractEducation(text);
                if (eduData.levels.length > 0 && currentProgram.eligibility.education.levels.length === 0) {
                    currentProgram.eligibility.education = eduData;
                }

                if (activeSection === "description") {
                    if (!textLower.includes('view more details') && !textLower.includes('official link')) {
                        currentProgram.description += (currentProgram.description ? " " : "") + text;
                    }
                } else if (activeSection === "process") {
                    currentProgram._process_lines.push(text);
                }

                const linkTag = $(el).find('a');
                const href = linkTag.attr('href');
                if (href && !href.startsWith('#') && (textLower.includes('apply') || textLower.includes('portal') || textLower.includes('view more details'))) {
                    if (!currentProgram.application.url) currentProgram.application.url = href;
                }

            } else if (tag === 'UL' || tag === 'OL') {
                $(el).find('li').each((j, li) => {
                    const liText = $(li).text().trim();
                    if (!liText || isAdvice(liText)) return;

                    const isDocument = docKeywords.some(kw => liText.toLowerCase().includes(kw));

                    if (activeSection === "benefits") {
                        currentProgram.benefits.push(liText);
                    } else {
                        if (isDocument) {
                            currentProgram.requirements.push(liText);
                        } else {
                            currentProgram.eligibility.other_requirements.push(liText);
                        }
                    }
                });
            }
        }
    });

    if (currentProgram) programs.push(currentProgram);

} else {
    const singleIncome = extractIncome(pageText);
    const singleEducation = extractEducation(pageText);
    const singleProvider = extractProvider(pageTitle) || extractProvider(pageText);
    const singleRequirements = [];
    const singleOtherEligibility = [];
    const singleBenefits = [];
    let applicationUrl = null;

    $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().toLowerCase();
        if (href && !href.startsWith('#') && (text.includes('apply') || text.includes('register') || text.includes('portal'))) {
            if (!applicationUrl) applicationUrl = href;
        }
    });

    $('ul, ol').each((i, list) => {
        $(list).find('li').each((j, li) => {
            const liText = $(li).text().trim();
            if (!liText || isAdvice(liText)) return;

            const isDocument = docKeywords.some(kw => liText.toLowerCase().includes(kw));
            if (isDocument) singleRequirements.push(liText);
            else singleOtherEligibility.push(liText);
        });
    });

    programs.push({
        title: pageTitle.replace(/^[0-9]+\.\s*/, '').trim(),
        provider: singleProvider,
        category: "scholarship",
        description: input.excerpt || $('.entry-content p').first().text().trim() || null,
        coverage: {
            type: pageTextUpper.includes("NATIONWIDE") ? "nationwide" : "unknown",
            locations: pageTextUpper.includes("NATIONWIDE") ? ["Philippines"] : []
        },
        eligibility: {
            age: { min: null, max: null, raw_text: null },
            education: singleEducation,
            employment: { statuses: [], raw_text: null },
            income: singleIncome,
            residency: { locations: [], raw_text: null },
            other_requirements: singleOtherEligibility
        },
        benefits: singleBenefits,
        requirements: singleRequirements,
        application: {
            start_date: null,
            deadline: null,
            process: null,
            url: applicationUrl
        },
        source: {
            url: source_url,
            last_verified_at: new Date().toISOString()
        },
        status: "unknown"
    });
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
});

return programs;