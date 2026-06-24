import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { executeActionStep } from "../_shared/executeActionStep";

serve(async (req) => {
  try {
    const { runId } = await req.json();

    if (!runId) {
      return new Response("Missing runId", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load run
    const { data: run, error: runError } = await supabase
      .from("pipeline_runs")
      .select("*")
      .eq("id", runId)
      .single();

    if (runError || !run) {
      return new Response("Run not found", { status: 404 });
    }

    // Load pipeline steps
    const { data: steps, error: stepsError } = await supabase
      .from("pipeline_steps")
      .select("*")
      .eq("pipeline_id", run.pipeline_id)
      .order("step_order", { ascending: true });

    if (stepsError) {
      return new Response("Failed to load pipeline steps", { status: 500 });
    }

    const pipelineSteps = steps ?? [];

    // Mark run as running
    await supabase
      .from("pipeline_runs")
      .update({ status: "running" })
      .eq("id", runId);

    let currentData = run.input_data ?? {};

    // Execute steps
    for (const step of pipelineSteps) {
      const stepStart = new Date().toISOString();

      try {
        let result;
        const retries = Number(step.config?.retries ?? 0);
        const retry_delay = Number(step.config?.retry_delay ?? 0);

        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            result = await executeActionStep(
              step,
              { ...run, input_data: currentData, output_data: currentData },
              supabase
            );
            break;
          } catch (err) {
            if (attempt === retries) throw err;
            await new Promise((r) => setTimeout(r, retry_delay));
          }
        }

        if (result === undefined) {
          result = await executeActionStep(
            step,
            { ...run, input_data: currentData, output_data: currentData },
            supabase
          );
        }

        if (result?.output !== undefined) {
          currentData = result.output;
        } else if (result?.payload !== undefined) {
          currentData = result.payload;
        }

        await supabase.from("pipeline_run_steps").insert({
          run_id: runId,
          step_id: step.id,
          status: "success",
          input_data: step.config ?? {},
          output_data: result,
          started_at: stepStart,
          finished_at: new Date().toISOString(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown step execution error";

        await supabase.from("pipeline_run_steps").insert({
          run_id: runId,
          step_id: step.id,
          status: "failed",
          input_data: step.config ?? {},
          error_message: message,
          started_at: stepStart,
          finished_at: new Date().toISOString(),
        });

        await supabase
          .from("pipeline_runs")
          .update({
            status: "failed",
            finished_at: new Date().toISOString(),
            error_message: message,
            output_data: currentData,
          })
          .eq("id", runId);

        return new Response("Step failed", { status: 500 });
      }
    }

    // Mark run as success
    await supabase
      .from("pipeline_runs")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        output_data: currentData,
      })
      .eq("id", runId);

    return new Response("Pipeline completed", { status: 200 });
  } catch (error) {
    console.error("execute-pipeline-run failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
