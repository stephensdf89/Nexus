import { NextRequest, NextResponse } from "next/server";

import { executePipelineById } from "@/lib/pipelineExecutor";
import { getPgClient } from "@/lib/pg";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
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
    return NextResponse.json({ error: "Failed to process TikTok trigger" }, { status: 500 });
  }
}
