import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    let mode = "delta";
    try {
      const body = await req.json();
      if (body.mode) mode = body.mode;
    } catch (e) {
      console.warn("No JSON body provided, defaulting to delta mode.");
    }
    
    const maxPages = mode === "full" ? 999 : 2;
    const apiToken = Deno.env.get("BRIGHTDATA_API_TOKEN");
    const collectorId = Deno.env.get("COLLECTOR_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiToken || !collectorId || !supabaseUrl || !supabaseKey) {
      throw new Error("Fatal: Missing required environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: configs, error: dbError } = await supabase
      .from("scraper_configs")
      .select("source_domain, rules")
      .eq("is_active", true);

    if (dbError) throw new Error(`Database error: ${dbError.message}`);
    
    if (!configs || configs.length === 0) {
       return new Response(
         JSON.stringify({ message: "No active scraper configurations found. Skipping trigger." }), 
         { status: 200, headers: { "Content-Type": "application/json" } }
       );
    }

    const payloads = configs.map((config) => {
      const startUrl = config.rules?.crawler_config?.start_url || `https://${config.source_domain}/`;
      
      return {
        url: startUrl,
        depth: 1,
        max_pages: maxPages,
        rules: JSON.stringify(config.rules)
      };
    });

    const triggerUrl = `https://api.brightdata.com/dca/trigger?collector=${collectorId}&queue_next=1&override_incompatible_schema=1`;
    
    const response = await fetch(triggerUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payloads)
    });

    const bdData = await response.json();

    if (!response.ok) {
       throw new Error(`Bright Data API Error: ${JSON.stringify(bdData)}`);
    }

    return new Response(JSON.stringify({
       success: true,
       mode: mode,
       triggered_domains: configs.map(c => c.source_domain),
       brightdata_response: bdData
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Trigger Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});