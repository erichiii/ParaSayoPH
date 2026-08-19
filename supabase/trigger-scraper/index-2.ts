import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import rulesConfig from "./rules.json" with { type: "json" };

serve(async (req) => {
  const { mode } = await req.json(); 
  const maxPages = mode === "delta" ? 2 : 999; 
  const apiToken = Deno.env.get("BRIGHTDATA_API_TOKEN");
  const collectorId = Deno.env.get("COLLECTOR_ID");
  const triggerUrl = `https://api.brightdata.com/dca/trigger?collector=${collectorId}&queue_next=1`;

  const payload = [{
    url: "https://scholarship.com.ph/",
    depth: 1,
    max_pages: maxPages,
    rules: JSON.stringify(rulesConfig)
  }];

  const response = await fetch(triggerUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return new Response(JSON.stringify(await response.json()), { status: response.status });
});