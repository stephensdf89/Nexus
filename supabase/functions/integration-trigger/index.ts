import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider");

  if (!provider) {
    return new Response("Missing provider", { status: 400 });
  }

  const body = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find all triggers for this provider
  const { data: triggers, error } = await supabase
    .from("integration_triggers")
    .select("*")
    .eq("provider", provider)
    .eq("active", true);

  if (error) {
    console.error("Failed to load integration triggers:", error);
    return new Response("Failed to load triggers", { status: 500 });
  }

  const activeTriggers = triggers ?? [];

  // For each trigger, start a pipeline run
  for (const trigger of activeTriggers) {
    const { error: insertError } = await supabase.from("pipeline_runs").insert({
      pipeline_id: trigger.pipeline_id,
      status: "pending",
      started_at: new Date().toISOString(),
      input_data: body,
      output_data: {},
    });

    if (insertError) {
      console.error("Failed to create pipeline run:", insertError);
    }
  }

  return new Response("OK", { status: 200 });
});
