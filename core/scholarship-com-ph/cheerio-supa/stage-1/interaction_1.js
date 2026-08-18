const currentDepth = input.depth || 1;

function buildPayload(targetUrl, targetDepth) {
    return {
        url: targetUrl,
        depth: targetDepth,
        supabase_url: input.supabase_url,
        supabase_anon_key: input.supabase_anon_key,
        rules: input.rules
    };
}

if (currentDepth === 3) {
    console.log("Queuing for Stage 2 Extraction:", input.url);
    next_stage({ 
        url: input.url,
        supabase_url: input.supabase_url,
        supabase_anon_key: input.supabase_anon_key,
        rules: input.rules
    });
    return;
}

navigate(input.url || "https://scholarship.com.ph/");
const data = parse();

if (currentDepth === 1) {
    if (data.next_page) {
        console.log("Next page found:", data.next_page);
        rerun_stage(buildPayload(data.next_page, 1));
    }

    if (data.category_urls && data.category_urls.length > 0) {
        for (const url of data.category_urls) {
            rerun_stage(buildPayload(url, 2));
        }
    }

    if (data.article_urls && data.article_urls.length > 0) {
        for (const url of data.article_urls) {
            rerun_stage(buildPayload(url, 3));
        }
    }
} 
else if (currentDepth === 2) {
    if (data.next_page) {
        console.log("Next category page found:", data.next_page);
        rerun_stage(buildPayload(data.next_page, 2));
    }

    if (data.article_urls && data.article_urls.length > 0) {
        for (const url of data.article_urls) {
            rerun_stage(buildPayload(url, 3));
        }
    }
}