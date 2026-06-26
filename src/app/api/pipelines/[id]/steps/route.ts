import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth-options";
import { getPgClient } from "@/lib/pg";
import { requireAccessFromSessionUser } from "@/lib/serverAccess";
import {
  createValidationErrorResponse,
  validateRequestBody,
  type ValidationSchema,
} from "@/lib/requestValidation";
import { serverErrorResponse } from "@/lib/apiAuth";

const SAVE_STEPS_SCHEMA: ValidationSchema = {
  steps: {
    type: "array",
    required: true,
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let transactionStarted = false;
  let pgClient;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await requireAccessFromSessionUser(session.user, "pro");
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const { id } = await params;
    const pipelineId = String(id || "").trim();

    if (!pipelineId) {
      return createValidationErrorResponse([
        { field: "id", message: "Pipeline ID is required" },
      ]);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return createValidationErrorResponse(["Invalid JSON in request body"]);
    }

    const validation = validateRequestBody(body, SAVE_STEPS_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const steps = Array.isArray(validation.data?.steps) ? validation.data.steps : [];

    if (steps.length === 0) {
      return NextResponse.json({ error: "steps array is required" }, { status: 400 });
    }

    if (steps.length > 50) {
      return NextResponse.json({ error: "Too many steps (max 50)" }, { status: 400 });
    }

    pgClient = await getPgClient();

    const pipelineCheck = await pgClient.query(
      "SELECT id FROM pipelines WHERE id = $1 AND user_id = $2 LIMIT 1",
      [pipelineId, session.user.name]
    );

    if (pipelineCheck.rows.length === 0) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    await pgClient.query("BEGIN");
    transactionStarted = true;

    await pgClient.query("DELETE FROM pipeline_steps WHERE pipeline_id = $1", [pipelineId]);

    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];
      if (!step || typeof step !== "object") {
        await pgClient.query("ROLLBACK");
        transactionStarted = false;
        return NextResponse.json({ error: `Invalid step payload at index ${i}` }, { status: 400 });
      }

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
        transactionStarted = false;
        return NextResponse.json({ error: `Invalid step type at index ${i}` }, { status: 400 });
      }

      if (!Number.isInteger(stepOrder) || stepOrder < 1 || stepOrder > 1000) {
        await pgClient.query("ROLLBACK");
        transactionStarted = false;
        return NextResponse.json({ error: `Invalid step_order at index ${i}` }, { status: 400 });
      }

      await pgClient.query(
        `INSERT INTO pipeline_steps (pipeline_id, step_order, type, config)
         VALUES ($1, $2, $3, $4::jsonb)`,
        [pipelineId, stepOrder, type, JSON.stringify(config)]
      );
    }

    await pgClient.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json({ success: true, count: steps.length });
  } catch (error) {
    if (transactionStarted && pgClient) {
      await pgClient.query("ROLLBACK");
    }
    console.error("Error saving pipeline steps:", error);
    return serverErrorResponse(error);
  }
}

