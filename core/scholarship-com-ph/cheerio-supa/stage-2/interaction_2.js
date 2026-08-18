const targetUrl = input.url;
const supabaseUrl = input.supabase_url;
const supabaseKey = input.supabase_anon_key;
const domain = new URL(targetUrl).hostname.replace('www.', '');

let configRules = null;

if (supabaseUrl && supabaseKey) {
    const endpoint = `${supabaseUrl}/rest/v1/scraper_configs?source_domain=eq.${domain}&is_active=eq.true&select=rules&limit=1`;
    
    try {
        const response = await fetch(endpoint, {
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                configRules = data[0].rules;
            }
        } else {
            console.error(`Failed to fetch rules for ${domain}: ${response.status}`);
        }
    } catch (e) {
        console.error(`Network error fetching rules for ${domain}:`, e.message);
    }
}

if (!configRules) {
    console.error(`Skipping ${targetUrl}: No active configuration rules found.`);
    return;
}

navigate(targetUrl);

const results = parse({ 
    url: targetUrl, 
    title: input.title, 
    rules: configRules 
});

const programs = Array.isArray(results) ? results : (results ? [results] : []);
const validPrograms = programs.filter(p => 
    p && p.title && typeof p.title === 'string' && p.title.trim().length > 0
);

if (validPrograms.length > 0) {
    collect(validPrograms);
} else {
    console.log("No valid canonical programs extracted from:", targetUrl);
}