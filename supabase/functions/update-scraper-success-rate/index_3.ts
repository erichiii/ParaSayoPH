import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const apiToken = Deno.env.get("BRIGHTDATA_API_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiToken || !supabaseUrl || !supabaseKey) {
      throw new Error("Fatal: Missing required environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: activeRuns, error: fetchError } = await supabase
      .from("scraper_health_runs")
      .select("id, brightdata_snapshot_id")
      .eq("status", "running")
      .not("brightdata_snapshot_id", "is", null);

    if (fetchError) throw fetchError;
    
    if (!activeRuns || activeRuns.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active runs require updating." }), 
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const updates = [];

    for (const run of activeRuns) {
      const logUrl = `https://api.brightdata.com/dca/log/${run.brightdata_snapshot_id}`;
      
      const bdResponse = await fetch(logUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!bdResponse.ok) {
        console.warn(`Bright Data API skipped/failed for snapshot ${run.brightdata_snapshot_id}`);
        continue; 
      }

      const bdLog = await bdResponse.json();
      
      const success = bdLog.Success ?? bdLog.success ?? 0;
      const fails = bdLog.Fails ?? bdLog.fails ?? bdLog.Errors ?? bdLog.errors ?? 0;
      const jobStatus = String(bdLog.Status ?? bdLog.status ?? "").toLowerCase();
      
      let successRate = null;
      const totalAttempts = success + fails;
      
      if (totalAttempts > 0) {
        successRate = Number(((success / totalAttempts) * 100).toFixed(2));
      } else if (jobStatus === "done" || jobStatus === "failed") {
        successRate = 0;
      }

      if (["done", "failed", "canceled", "error"].includes(jobStatus)) {
         updates.push({
          id: run.id,
          success_rate: successRate,
          status: jobStatus === "done" ? "healthy" : "failed",
          completed_at: new Date().toISOString()
        });
      }
    }

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("scraper_health_runs")
        .update({ 
          success_rate: update.success_rate,
          status: update.status,
          completed_at: update.completed_at
        })
        .eq("id", update.id);
        
      if (updateError) {
         console.error(`Failed to apply update for run ${update.id}:`, updateError.message);
      }
    }

    return new Response(
      JSON.stringify({ message: "Health runs successfully synced.", processed: updates.length }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("CRON Update Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});