import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import { requireOwner } from "@/lib/serverAccess";
import { writeAccessAuditLog } from "@/lib/serverAccess";

type AccessLevel = "user" | "pro" | "admin";

function normalizeAccessLevel(value: unknown): AccessLevel {
  const role = String(value || "user").toLowerCase();
  if (role === "pro" || role === "admin") return role;
  return "user";
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireOwner(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = await getPgClient();

    const result = await db.query(
      `SELECT
         u.id,
         u.email,
         u.created_at,
         COALESCE(ua.access_level, 'user') AS access_level
       FROM auth.users u
       LEFT JOIN public.user_access ua ON ua.user_id = u.id
       ORDER BY u.created_at DESC
       LIMIT 200`
    );

    return NextResponse.json({
      members: result.rows,
      ownerEmail: auth.user.email || null,
      ownerId: auth.user.id,
    });
  } catch (error) {
    console.error("Admin members GET failed:", error);
    return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireOwner(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const userId = String(body?.userId || "").trim();
    const accessLevel = normalizeAccessLevel(body?.accessLevel);

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (userId === auth.user.id) {
      return NextResponse.json({ error: "Owner access is managed by environment settings" }, { status: 400 });
    }

    const db = await getPgClient();

    const currentRoleResult = await db.query(
      `SELECT COALESCE(access_level, 'user') AS access_level
       FROM public.user_access
       WHERE user_id = $1
       LIMIT 1`,
      [userId]
    );
    const previousAccessLevel = String(currentRoleResult.rows[0]?.access_level || "user");

    const exists = await db.query(`SELECT id FROM auth.users WHERE id = $1 LIMIT 1`, [userId]);
    if (exists.rows.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await db.query(
      `INSERT INTO public.user_access (user_id, access_level, granted_by, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         access_level = EXCLUDED.access_level,
         granted_by = EXCLUDED.granted_by,
         updated_at = NOW()`,
      [userId, accessLevel, auth.user.id]
    );

    await writeAccessAuditLog({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email || null,
      eventType: "role_change",
      resource: "/api/admin/members",
      success: true,
      targetUserId: userId,
      details: {
        previousAccessLevel,
        newAccessLevel: accessLevel,
      },
    });

    return NextResponse.json({ success: true, userId, accessLevel });
  } catch (error) {
    console.error("Admin members POST failed:", error);
    return NextResponse.json({ error: "Failed to update member access" }, { status: 500 });
  }
}
