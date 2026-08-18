const currentDepth = input.depth || 1;
navigate(input.url || "https://scholarship.com.ph/");

const data = parse();

if (currentDepth === 1) {
    if (data.next_page) {
        console.log("Next page found:", data.next_page);
        rerun_stage({ url: data.next_page, depth: 1 });
    }

    if (data.depth_2_urls && data.depth_2_urls.length > 0) {
        for (const url of data.depth_2_urls) {
            rerun_stage({ url: url, depth: 2 });
        }
    }
} 
else if (currentDepth === 2) {
    if (data.extraction_urls && data.extraction_urls.length > 0) {
        for (const url of data.extraction_urls) {
            console.log("Queuing for Stage 2 Extraction:", url);
            next_stage({ url: url });
        }
    }
}