import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPgClient } from "@/lib/pg";

export type AccessLevel = "user" | "pro" | "admin";
type AuditEventType = "access_denied" | "access_granted" | "role_change" | "owner_check_failed" | "app_settings_change";
const ACCESS_RANK: Record<AccessLevel, number> = {
  user: 0,
  pro: 1,
  admin: 2,
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars missing");
  }
  return createClient(url, key);
}

export async function getUserFromRequest(req: NextRequest) {
  const accessToken =
    req.cookies.get("sb-access-token")?.value || req.headers.get("x-supabase-auth") || null;

  if (!accessToken) return null;

  const supabase = getSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) return null;
  return user;
}

export function isOwnerIdentity(user: { id: string; email?: string | null }) {
  const ownerId = process.env.OWNER_USER_ID?.trim();
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

  if (ownerId && user.id === ownerId) return true;
  if (ownerEmail && user.email?.toLowerCase() === ownerEmail) return true;
  return false;
}

export async function getAccessLevelForUser(userId: string): Promise<AccessLevel> {
  try {
    const db = await getPgClient();
    const result = await db.query(
      `SELECT access_level
       FROM public.user_access
       WHERE user_id = $1
       LIMIT 1`,
      [userId]
    );

    const value = String(result.rows[0]?.access_level || "user") as AccessLevel;
    return value === "admin" || value === "pro" ? value : "user";
  } catch (error) {
    console.error("Access level lookup failed:", error);
    return "user";
  }
}

export async function getEffectiveAccess(user: { id: string; email?: string | null }) {
  if (isOwnerIdentity(user)) {
    return { isOwner: true, accessLevel: "admin" as AccessLevel };
  }

  const accessLevel = await getAccessLevelForUser(user.id);
  return { isOwner: false, accessLevel };
}

function normalizeAccessLevel(value: unknown): AccessLevel {
  const level = String(value || "user") as AccessLevel;
  if (level === "pro" || level === "admin") return level;
  return "user";
}

export function hasRequiredAccess(level: AccessLevel, minimum: AccessLevel) {
  return ACCESS_RANK[level] >= ACCESS_RANK[minimum];
}

export async function getEffectiveAccessByEmail(email?: string | null) {
  const normalizedEmail = email?.trim().toLowerCase();
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

  if (ownerEmail && normalizedEmail && normalizedEmail === ownerEmail) {
    return { isOwner: true, accessLevel: "admin" as AccessLevel };
  }

  if (!normalizedEmail) {
    return { isOwner: false, accessLevel: "user" as AccessLevel };
  }

  try {
    const db = await getPgClient();
    const result = await db.query(
      `SELECT COALESCE(ua.access_level, 'user') AS access_level
       FROM auth.users u
       LEFT JOIN public.user_access ua ON ua.user_id = u.id
       WHERE lower(u.email) = lower($1)
       LIMIT 1`,
      [normalizedEmail]
    );

    const accessLevel = normalizeAccessLevel(result.rows[0]?.access_level);
    return { isOwner: false, accessLevel };
  } catch (error) {
    console.error("Email access lookup failed:", error);
    return { isOwner: false, accessLevel: "user" as AccessLevel };
  }
}

export async function writeAccessAuditLog(args: {
  actorUserId?: string | null;
  actorEmail?: string | null;
  eventType: AuditEventType;
  resource?: string | null;
  requiredLevel?: AccessLevel | null;
  currentLevel?: AccessLevel | null;
  success?: boolean;
  targetUserId?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    const db = await getPgClient();
    await db.query(
      `INSERT INTO public.access_audit_logs
        (actor_user_id, actor_email, event_type, resource, required_level, current_level, success, target_user_id, details)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
      [
        args.actorUserId || null,
        args.actorEmail || null,
        args.eventType,
        args.resource || null,
        args.requiredLevel || null,
        args.currentLevel || null,
        Boolean(args.success),
        args.targetUserId || null,
        JSON.stringify(args.details || {}),
      ]
    );
  } catch (error) {
    console.error("Access audit log write failed:", error);
  }
}

export async function requireAccess(req: NextRequest, minimum: AccessLevel, resource?: string) {
  const user = await getUserFromRequest(req);
  if (!user) {
    await writeAccessAuditLog({
      actorEmail: null,
      eventType: "access_denied",
      resource: resource || req.nextUrl.pathname,
      requiredLevel: minimum,
      currentLevel: null,
      success: false,
      details: { reason: "unauthenticated", method: req.method },
    });
    return { error: "Unauthorized", status: 401 as const };
  }

  const effective = await getEffectiveAccess(user);
  if (!hasRequiredAccess(effective.accessLevel, minimum)) {
    await writeAccessAuditLog({
      actorUserId: user.id,
      actorEmail: user.email || null,
      eventType: "access_denied",
      resource: resource || req.nextUrl.pathname,
      requiredLevel: minimum,
      currentLevel: effective.accessLevel,
      success: false,
      details: { reason: "insufficient_access", method: req.method },
    });
    return { error: "Forbidden", status: 403 as const };
  }

  return { user, ...effective };
}

export async function requireAccessFromSessionUser(
  sessionUser: { email?: string | null } | null | undefined,
  minimum: AccessLevel,
  resource?: string
) {
  if (!sessionUser) {
    await writeAccessAuditLog({
      actorEmail: null,
      eventType: "access_denied",
      resource: resource || "session",
      requiredLevel: minimum,
      currentLevel: null,
      success: false,
      details: { reason: "missing_session" },
    });
    return { error: "Unauthorized", status: 401 as const };
  }

  const effective = await getEffectiveAccessByEmail(sessionUser.email);
  if (!hasRequiredAccess(effective.accessLevel, minimum)) {
    await writeAccessAuditLog({
      actorEmail: sessionUser.email || null,
      eventType: "access_denied",
      resource: resource || "session",
      requiredLevel: minimum,
      currentLevel: effective.accessLevel,
      success: false,
      details: { reason: "insufficient_access" },
    });
    return { error: "Forbidden", status: 403 as const };
  }

  return effective;
}

export async function requireOwner(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    await writeAccessAuditLog({
      actorEmail: null,
      eventType: "owner_check_failed",
      resource: req.nextUrl.pathname,
      success: false,
      details: { reason: "unauthenticated", method: req.method },
    });
    return { error: "Unauthorized", status: 401 as const };
  }

  if (!isOwnerIdentity(user)) {
    await writeAccessAuditLog({
      actorUserId: user.id,
      actorEmail: user.email || null,
      eventType: "owner_check_failed",
      resource: req.nextUrl.pathname,
      success: false,
      details: { reason: "not_owner", method: req.method },
    });
    return { error: "Forbidden", status: 403 as const };
  }

  return { user };
}
