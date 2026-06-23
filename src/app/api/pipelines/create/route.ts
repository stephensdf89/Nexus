import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth-options";
import { getPgClient } from "@/lib/pg";
import { requireAccessFromSessionUser } from "@/lib/serverAccess";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await requireAccessFromSessionUser(session.user, "pro");
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const active = body?.active !== false;

    if (!name) {
      return NextResponse.json({ error: "Pipeline name is required" }, { status: 400 });
    }

    const pgClient = await getPgClient();

    const result = await pgClient.query(
      `INSERT INTO pipelines (user_id, name, description, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, user_id, name, description, active, created_at, updated_at`,
      [session.user.name, name, description || null, active]
    );

    return NextResponse.json({ pipeline: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating pipeline:", error);
    return NextResponse.json({ error: "Failed to create pipeline" }, { status: 500 });
  }
}
