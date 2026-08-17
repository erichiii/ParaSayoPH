navigate(input.url || "https://scholarship.com.ph/");

const data = parse();
const pageUrls = new Set();

if (data.results && data.results.length > 0) {
    for (const result of data.results) {
        if (!pageUrls.has(result.url)) {
            pageUrls.add(result.url);

            next_stage(result);
            collect(result);
        }
    }
}

if (data.next_page) {
    console.log("Next page found:", data.next_page);
    rerun_stage({ url: data.next_page });
} else {
    console.log("End of pagination reached or no next button found.");
}