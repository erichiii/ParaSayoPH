import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const payload = await req.json();
    const dataArray = Array.isArray(payload) ? payload : [payload];
    
    if (dataArray.length === 0 || !dataArray[0].source) {
       return new Response(
         JSON.stringify({ message: "Webhook test successful." }),
         { headers: { "Content-Type": "application/json" }, status: 200 }
       );
    }

    const runMetrics: Record<string, number> = {};
    for (const item of dataArray) {
      if (item.input && item.input._run_id) {
        const rId = String(item.input._run_id);
        runMetrics[rId] = (runMetrics[rId] || 0) + 1;
      }
    }

    const cleanData = dataArray.map((item) => {
      if (item.input) delete item.input;
      if (item.source && item.source.url) item.source_url = item.source.url;
      return item;
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.rpc("upsert_scraped_scholarships", { 
      payload: cleanData 
    });

    if (error) throw error;

    for (const [runId, count] of Object.entries(runMetrics)) {
      const { error: healthError } = await supabase.rpc("increment_health_metrics", {
        p_run_id: parseInt(runId, 10),
        p_extracted: count
      });
      
      if (healthError) {
        console.error(`Health metric update failed for run ${runId}:`, healthError.message);
      }
    }

    return new Response(
      JSON.stringify({ message: "Successfully ingested data via RPC." }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});