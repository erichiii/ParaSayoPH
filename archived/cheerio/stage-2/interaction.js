navigate(input.url);

const results = parse();
const programs = Array.isArray(results) ? results : (results ? [results] : []);
const validPrograms = programs.filter(p => p && p.title && typeof p.title === 'string' && p.title.trim().length > 0);

if (validPrograms.length > 0) {
    collect(validPrograms);
} else {
    console.log("No valid canonical programs extracted from:", input.url);
}