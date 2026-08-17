// 1. Load the page (defaults to the root domain if no input is provided)
navigate(input.url || "https://scholarship.com.ph/");

// 2. Trigger the Parser Code to evaluate the DOM and wait for the returned object
const data = parse();

// 3. Track URLs on this page to prevent duplicate queueing
const pageUrls = new Set();

// 4. Iterate through the array of results the parser handed back
if (data.results && data.results.length > 0) {
    for (const result of data.results) {
        if (!pageUrls.has(result.url)) {
            pageUrls.add(result.url);
            
            // Push the clean URL to Stage 2 for deep extraction
            next_stage(result);
            
            // Emit the record so we can visually verify it in the Preview Output tab
            collect(result);
        }
    }
}

// 5. Handle Pagination Loop
if (data.next_page) {
    console.log("Next page found:", data.next_page);
    rerun_stage({ url: data.next_page });
} else {
    console.log("End of pagination reached or no next button found.");
}