const currentDepth = input.depth || 1;
const currentPage = input.current_page || 1;
const maxPages = input.max_pages || 999;

let parsedRules = {};
try {
    parsedRules = typeof input.rules === 'string' ? JSON.parse(input.rules) : (input.rules || {});
} catch (e) {
    console.warn("Interaction warning: input.rules is not a valid JSON string.");
}

const targetDepth = parsedRules?.crawler_config?.target_depth || 3;

function buildPayload(targetUrl, targetDepthVal) {
    return {
        url: targetUrl,
        depth: targetDepthVal,
        rules: input.rules,
        max_pages: maxPages
    };
}

if (currentDepth === targetDepth) {
    console.log(`Target depth ${targetDepth} reached. Queuing for Stage 2:`, input.url);
    next_stage(buildPayload(input.url, targetDepth));
    return; 
}

if (!input.url) {
    console.error("Fatal: No target URL provided.");
    return;
}

navigate(input.url);
const data = parse();

if (data.next_page && currentPage < maxPages) {
    console.log("Next page found:", data.next_page);
    const nextPayload = buildPayload(data.next_page, currentDepth);
    nextPayload.current_page = currentPage + 1; 
    rerun_stage(nextPayload);
}

if (data.next_depth_urls && data.next_depth_urls.length > 0) {
    const nextDepth = currentDepth + 1;
    for (const url of data.next_depth_urls) {
        rerun_stage(buildPayload(url, nextDepth));
    }
} else {
    console.log(`No further URLs found at depth ${currentDepth} for:`, input.url);
}