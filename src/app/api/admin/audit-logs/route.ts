import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import { requireOwner } from "@/lib/serverAccess";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireOwner(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = await getPgClient();
    const limitParam = Number.parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(200, limitParam)) : 50;

    const result = await db.query(
      `SELECT id, actor_user_id, actor_email, event_type, resource, required_level, current_level, success, target_user_id, details, created_at
       FROM public.access_audit_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({ logs: result.rows });
  } catch (error) {
    console.error("Admin audit logs GET failed:", error);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
