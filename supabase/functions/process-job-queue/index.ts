import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const workerId = Deno.env.get("WORKER_ID") ?? "worker-default";

  await supabase.from("worker_heartbeat").upsert(
    {
      worker_id: workerId,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "worker_id" }
  );

  // Atomically claim one pending job so multiple workers do not process the same job
  const { data: claimedJobs, error: claimError } = await supabase.rpc("claim_next_job");

  if (claimError) {
    console.error("Failed to claim job:", claimError);
    return new Response("Failed to claim job", { status: 500 });
  }

  const job = Array.isArray(claimedJobs) ? claimedJobs[0] : claimedJobs;

  if (!job) {
    return new Response("No jobs", { status: 200 });
  }

  try {
    // Call your pipeline executor
    const runResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/run-pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ runId: job.run_id }),
    });

    if (!runResponse.ok) {
      const responseBody = await runResponse.text();
      throw new Error(
        `run-pipeline failed (${runResponse.status}): ${responseBody || "empty response"}`
      );
    }

    // Mark job done
    await supabase
      .from("job_queue")
      .update({ status: "done", updated_at: new Date().toISOString() })
      .eq("id", job.id);

  } catch (err) {
    const attempts = Number(job.attempts ?? 0) + 1;

    if (attempts >= job.max_attempts) {
      await supabase
        .from("job_queue")
        .update({
          status: "failed",
          attempts,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    } else {
      await supabase
        .from("job_queue")
        .update({
          status: "pending",
          attempts,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }
  }

  return new Response("OK", { status: 200 });
});
