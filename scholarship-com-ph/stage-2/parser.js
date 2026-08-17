const source_url = input.url;
const pageTitle = input.title || $('h1.entry-title, h1.post-title').first().text().trim();
const globalCategory = input.category || "Scholarship";

// Stop words that indicate a header is just an article section, not a program
const sectionKeywords = ['who is this', 'what is a', 'reminder', 'important', 'requirement', 'qualification', 'benefit', 'privilege', 'coverage', 'allowance', 'process', 'procedure', 'how to apply', 'deadline', 'overview', 'about', 'note', 'document'];

// Positive words that strongly indicate an actual program title
const programKeywords = ['scholarship', 'program', 'grant', 'assistance', 'subsidy', 'fund'];

function isProgramTitle(text) {
    const lower = text.toLowerCase();
    
    // 1. Reject if it contains section-style keywords
    if (sectionKeywords.some(kw => lower.includes(kw))) return false;
    
    // 2. Accept if it contains strong program keywords and is a reasonable length
    if (text.length > 10 && programKeywords.some(kw => lower.includes(kw))) return true;
    
    // 3. Reject anything else
    return false;
}

const programs = [];
const contentNodes = $('.entry-content').children(); 

// Detect if listicle
let isListicle = false;
contentNodes.each((i, el) => {
    if (['H2', 'H3'].includes(el.tagName.toUpperCase()) && isProgramTitle($(el).text())) {
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

        if (['H2', 'H3'].includes(tag)) {
            if (isProgramTitle(text)) {
                
                if (currentProgram) programs.push(currentProgram);
                
                let prov = "Unknown / General";
                if (textLower.includes('ched')) prov = 'CHED';
                else if (textLower.includes('dost')) prov = 'DOST';
                else if (textLower.includes('dswd')) prov = 'DSWD';
                else if (textLower.includes('tesda')) prov = 'TESDA';

                currentProgram = {
                    title: text.replace(/^[0-9]+\.\s*/, ''), // Strips leading numbers like "1. " from titles
                    provider: prov,
                    category: globalCategory,
                    description: "",
                    coverage: { type: "regional", locations: [] },
                    eligibility: { age_min: null, age_max: null, education_levels: "Various", employment_status: "Student", income_requirement: null, residency_requirement: "Filipino Citizen", other_requirements: "See requirements array" },
                    benefits: [], requirements: [], application_start: null, deadline: "Check official page", source_url: source_url, application_process: [], application_url: null, last_verified_at: new Date().toISOString(), status: "available"
                };
                activeSection = "description"; 
                
            } else {
                if (textLower.includes('requirement') || textLower.includes('qualification')) activeSection = "requirements";
                else if (textLower.includes('benefit') || textLower.includes('coverage')) activeSection = "benefits";
                else if (textLower.includes('apply') || textLower.includes('process')) activeSection = "process";
            }
        } else if (currentProgram) {
            if (tag === 'P') {
                if (activeSection === "description") currentProgram.description += (currentProgram.description ? " " : "") + text;
                else if (activeSection === "process") currentProgram.application_process.push(text);
                
                const href = $(el).find('a').attr('href');
                if (href && (textLower.includes('apply') || textLower.includes('portal'))) currentProgram.application_url = href;
            } else if (tag === 'UL' || tag === 'OL') {
                $(el).find('li').each((j, li) => {
                    if (activeSection === "benefits") currentProgram.benefits.push($(li).text().trim());
                    else currentProgram.requirements.push($(li).text().trim());
                });
            }
        }
    });
    
    if (currentProgram) programs.push(currentProgram);

    programs.forEach(p => {
        p.application_process = p.application_process.join("\n").substring(0, 800);
        if (!p.description) p.description = "See source for details.";
    });

} else {
    // Single page logic remains the same (omitted for brevity, but keep your previous single-page fallback here)
    // ...
}

return programs;