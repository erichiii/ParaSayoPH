import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const payload = await req.json();
    const dataArray = Array.isArray(payload) ? payload : [payload];
    
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