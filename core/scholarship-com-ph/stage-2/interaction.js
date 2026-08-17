navigate(input.url);

const results = parse();
const programs = Array.isArray(results) ? results : [results];
const validPrograms = programs.filter(p => p && p.title);

if (validPrograms.length > 0) {
    collect(validPrograms);
} else {
    console.log("No valid programs found to collect.");
}