import { NextRequest, NextResponse } from "next/server";

import { executePipelineById } from "@/lib/pipelineExecutor";
import { getPgClient } from "@/lib/pg";
import { createValidationErrorResponse } from "@/lib/requestValidation";
import { serverErrorResponse } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    const configuredSecret = process.env.TIKTOK_TRIGGER_SECRET;
    if (configuredSecret) {
      const providedSecret = req.headers.get("x-webhook-secret") || "";
      if (providedSecret !== configuredSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return createValidationErrorResponse([
        { field: "payload", message: "Webhook payload must be a JSON object" },
      ]);
    }

    const triggerType = "tiktok.new_follower";

    const pgClient = await getPgClient();

    const pipelinesResult = await pgClient.query(
      `SELECT DISTINCT p.id
       FROM pipelines p
       JOIN pipeline_steps s ON s.pipeline_id = p.id
       WHERE p.active = true
         AND s.type = 'trigger'
         AND s.config->>'type' = $1`,
      [triggerType]
    );

    const executions = [];

    for (const row of pipelinesResult.rows) {
      const execution = await executePipelineById(row.id, payload);
      executions.push({ pipeline_id: row.id, ...execution });
    }

    return NextResponse.json({
      trigger: triggerType,
      matched: pipelinesResult.rows.length,
      executions,
    });
  } catch (error) {
    console.error("Error executing TikTok trigger:", error);
    return serverErrorResponse(error);
  }
}


