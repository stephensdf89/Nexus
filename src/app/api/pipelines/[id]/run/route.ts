import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth-options";
import { executePipelineById } from "@/lib/pipelineExecutor";
import { getPgClient } from "@/lib/pg";
import { requireAccessFromSessionUser } from "@/lib/serverAccess";
import {
  validateRequestBody,
  createValidationErrorResponse,
  type ValidationSchema,
} from "@/lib/requestValidation";
import { serverErrorResponse } from "@/lib/apiAuth";

const RUN_PIPELINE_SCHEMA: ValidationSchema = {
  input: {
    type: "object",
    required: false,
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const pgClient = await getPgClient();
    const accessResult = await pgClient.query(
      "SELECT id FROM pipelines WHERE id = $1 AND user_id = $2 LIMIT 1",
      [pipelineId, session.user.name]
    );

    if (accessResult.rows.length === 0) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Validate input if provided
    if (body.input !== undefined) {
      const validation = validateRequestBody({ input: body.input }, RUN_PIPELINE_SCHEMA);
      if (!validation.valid) {
        return createValidationErrorResponse(validation.errors);
      }
    }

    const input = body?.input && typeof body.input === "object" ? body.input : {};

    const result = await executePipelineById(pipelineId, input);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error running pipeline:", error);
    return serverErrorResponse(error);
  }
}
