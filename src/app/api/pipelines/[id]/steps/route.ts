import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth-options";
import { getPgClient } from "@/lib/pg";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pipelineId = id;

    const body = await req.json();
    const steps = Array.isArray(body?.steps) ? body.steps : [];

    if (steps.length === 0) {
      return NextResponse.json({ error: "steps array is required" }, { status: 400 });
    }

    const pgClient = await getPgClient();

    const pipelineCheck = await pgClient.query(
      "SELECT id FROM pipelines WHERE id = $1 AND user_id = $2 LIMIT 1",
      [pipelineId, session.user.name]
    );

    if (pipelineCheck.rows.length === 0) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    await pgClient.query("BEGIN");

    await pgClient.query("DELETE FROM pipeline_steps WHERE pipeline_id = $1", [pipelineId]);

    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];
      const type = String(step?.type ?? "").trim();
      const config =
        step?.config && typeof step.config === "object" ? step.config : {};
      const stepOrder = Number.isInteger(step?.step_order)
        ? step.step_order
        : Number.isInteger(step?.order)
        ? step.order
        : i + 1;

      if (!["trigger", "condition", "action"].includes(type)) {
        await pgClient.query("ROLLBACK");
        return NextResponse.json({ error: `Invalid step type at index ${i}` }, { status: 400 });
      }

      await pgClient.query(
        `INSERT INTO pipeline_steps (pipeline_id, step_order, type, config)
         VALUES ($1, $2, $3, $4::jsonb)`,
        [pipelineId, stepOrder, type, JSON.stringify(config)]
      );
    }

    await pgClient.query("COMMIT");

    return NextResponse.json({ success: true, count: steps.length });
  } catch (error) {
    const pgClient = await getPgClient();
    await pgClient.query("ROLLBACK");
    console.error("Error saving pipeline steps:", error);
    return NextResponse.json({ error: "Failed to save steps" }, { status: 500 });
  }
}
