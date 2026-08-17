// 1. Navigate to the detail URL
navigate(input.url);

// 2. Trigger the parser (which returns an array of schemas)
const results = parse();

// 3. Ensure we are working with an array
const programs = Array.isArray(results) ? results : [results];

// 4. Filter out any empty or null programs that slipped through
const validPrograms = programs.filter(p => p && p.title);

if (validPrograms.length > 0) {
    // Collect the entire array at once to prevent the rate-limit error
    collect(validPrograms);
} else {
    console.log("No valid programs found to collect.");
}