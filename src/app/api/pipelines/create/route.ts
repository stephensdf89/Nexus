import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import { requireAccessFromSessionUser } from "@/lib/serverAccess";
import {
  validateRequestBody,
  createValidationErrorResponse,
  type ValidationSchema,
} from "@/lib/requestValidation";
import { requireSession, serverErrorResponse } from "@/lib/apiAuth";

const CREATE_PIPELINE_SCHEMA: ValidationSchema = {
  name: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 255,
  },
  description: {
    type: "string",
    required: false,
    maxLength: 1000,
  },
  active: {
    type: "boolean",
    required: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireSession(req);
    if ("error" in sessionResult) {
      return sessionResult.error;
    }

    const { user } = sessionResult;

    const access = await requireAccessFromSessionUser(
      { name: user.userId, email: user.email } as any,
      "pro"
    );
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return createValidationErrorResponse(["Invalid JSON in request body"]);
    }

    const validation = validateRequestBody(body, CREATE_PIPELINE_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const name = String(validation.data?.name || "").trim();
    const description = validation.data?.description ? String(validation.data.description).trim() : null;
    const active = validation.data?.active !== false;

    if (!name) {
      return createValidationErrorResponse([
        { field: "name", message: "Pipeline name cannot be empty" },
      ]);
    }

    const pgClient = await getPgClient();

    const result = await pgClient.query(
      `INSERT INTO pipelines (user_id, name, description, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, user_id, name, description, active, created_at, updated_at`,
      [user.userId, name, description, active]
    );

    return NextResponse.json({ pipeline: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating pipeline:", error);
    return serverErrorResponse(error);
  }
}
