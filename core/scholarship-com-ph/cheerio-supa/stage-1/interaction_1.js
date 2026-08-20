const currentDepth = input.depth || 1;
const currentPage = input.current_page || 1;
const maxPages = input.max_pages || 999;

function buildPayload(targetUrl, targetDepth) {
    return {
        url: targetUrl,
        depth: targetDepth,
        rules: input.rules,
        max_pages: maxPages
    };
}

if (currentDepth === 3) {
    console.log("Queuing for Stage 2 Extraction:", input.url);
    next_stage(buildPayload(input.url, 3));
    return; 
}

navigate(input.url || "https://scholarship.com.ph/");
const data = parse();

if (currentDepth === 1) {
    if (data.next_page && currentPage < maxPages) {
        console.log("Next page found:", data.next_page);
        const nextPayload = buildPayload(data.next_page, 1);
        
        nextPayload.current_page = currentPage + 1; 
        rerun_stage(nextPayload);
    }
    
    if (data.depth_2_urls && data.depth_2_urls.length > 0) {
        for (const url of data.depth_2_urls) {
            rerun_stage(buildPayload(url, 2));
        }
    }
} 
else if (currentDepth === 2) {
    if (data.depth_3_urls && data.depth_3_urls.length > 0) {
        for (const url of data.depth_3_urls) {
            rerun_stage(buildPayload(url, 3));
        }
    }
}