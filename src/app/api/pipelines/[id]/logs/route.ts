import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth-options";
import { getPgClient } from "@/lib/pg";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pipelineId = id;

    const pgClient = await getPgClient();

    const pipelineCheck = await pgClient.query(
      "SELECT id FROM pipelines WHERE id = $1 AND user_id = $2 LIMIT 1",
      [pipelineId, session.user.name]
    );

    if (pipelineCheck.rows.length === 0) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    const runsResult = await pgClient.query(
      `SELECT id, pipeline_id, status, started_at, finished_at, error_message, input_data, output_data
       FROM pipeline_runs
       WHERE pipeline_id = $1
       ORDER BY started_at DESC
       LIMIT 100`,
      [pipelineId]
    );

    const runIds = runsResult.rows.map((row) => row.id);

    let stepsByRunId: Record<string, any[]> = {};

    if (runIds.length > 0) {
      const runStepsResult = await pgClient.query(
        `SELECT id, run_id, step_id, status, started_at, finished_at, error_message, input_data, output_data
         FROM pipeline_run_steps
         WHERE run_id = ANY($1::uuid[])
         ORDER BY started_at ASC`,
        [runIds]
      );

      stepsByRunId = runStepsResult.rows.reduce<Record<string, any[]>>((acc, row) => {
        const runId = row.run_id as string;
        if (!acc[runId]) {
          acc[runId] = [];
        }
        acc[runId].push(row);
        return acc;
      }, {});
    }

    const logs = runsResult.rows.map((run) => ({
      ...run,
      steps: stepsByRunId[run.id] ?? [],
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching pipeline logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
