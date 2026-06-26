import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import { requireAccess } from "@/lib/serverAccess";
import { writeAccessAuditLog } from "@/lib/serverAccess";
import {
  validateRequestBody,
  createValidationErrorResponse,
  type ValidationSchema,
} from "@/lib/requestValidation";

type AccessLevel = "user" | "pro" | "admin";

const UPDATE_MEMBER_SCHEMA: ValidationSchema = {
  userId: {
    type: "string",
    required: false,
    minLength: 1,
  },
  email: {
    type: "string",
    required: false,
    minLength: 3,
  },
  accessLevel: {
    type: "string",
    required: true,
    enum: ["user", "pro", "admin"],
  },
};

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAccess(req, "admin", "/api/admin/members");
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
    const auth = await requireAccess(req, "admin", "/api/admin/members");
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();

    // Validate request body
    const validation = validateRequestBody(body, UPDATE_MEMBER_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const userId = String(validation.data?.userId || "").trim();
    const email = String(validation.data?.email || "").trim().toLowerCase();
    const accessLevel = String(validation.data?.accessLevel || "user") as AccessLevel;

    if (!userId && !email) {
      return NextResponse.json(
        { error: "Provide either userId or email" },
        { status: 400 }
      );
    }

    if (userId === auth.user.id && auth.isOwner) {
      return NextResponse.json(
        { error: "Owner access is managed by environment settings" },
        { status: 400 }
      );
    }

    const db = await getPgClient();

    let resolvedUserId = userId;

    if (!resolvedUserId && email) {
      const userLookup = await db.query(
        `SELECT id, email
         FROM auth.users
         WHERE lower(email) = lower($1)
         LIMIT 1`,
        [email]
      );

      if (userLookup.rows.length === 0) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      resolvedUserId = String(userLookup.rows[0].id);
    }

    if (resolvedUserId === auth.user.id && auth.isOwner) {
      return NextResponse.json(
        { error: "Owner access is managed by environment settings" },
        { status: 400 }
      );
    }

    const currentRoleResult = await db.query(
      `SELECT COALESCE(access_level, 'user') AS access_level
       FROM public.user_access
       WHERE user_id = $1
       LIMIT 1`,
      [resolvedUserId]
    );
    const previousAccessLevel = String(currentRoleResult.rows[0]?.access_level || "user");

    const exists = await db.query(`SELECT id FROM auth.users WHERE id = $1 LIMIT 1`, [resolvedUserId]);
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
      [resolvedUserId, accessLevel, auth.user.id]
    );

    await writeAccessAuditLog({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email || null,
      eventType: "role_change",
      resource: "/api/admin/members",
      success: true,
      targetUserId: resolvedUserId,
      details: {
        previousAccessLevel,
        newAccessLevel: accessLevel,
        lookupEmail: email || null,
      },
    });

    return NextResponse.json({ success: true, userId: resolvedUserId, accessLevel });
  } catch (error) {
    console.error("Admin members POST failed:", error);
    return NextResponse.json({ error: "Failed to update member access" }, { status: 500 });
  }
}


