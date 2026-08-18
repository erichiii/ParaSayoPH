const targetUrl = input.url;
const supabaseUrl = input.supabase_url;
const supabaseKey = input.supabase_anon_key;
const domain = new URL(targetUrl).hostname.replace('www.', '');

let configRules = null;

if (supabaseUrl && supabaseKey) {
    const https = require('https');
    
    const fetchRules = () => {
        return new Promise((resolve, reject) => {
            const url = new URL(`${supabaseUrl}/rest/v1/scraper_configs?source_domain=eq.${domain}&is_active=eq.true&select=rules&limit=1`);
            
            const options = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: 'GET',
                headers: {
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${supabaseKey}`
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error(`HTTP Status ${res.statusCode}`));
                    }
                });
            });
            req.on('error', (e) => reject(e));
            req.end();
        });
    };

    try {
        const data = await fetchRules();
        if (data && data.length > 0) {
            configRules = data[0].rules;
            console.log(`Successfully loaded rules for ${domain}`);
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