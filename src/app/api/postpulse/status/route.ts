import { NextRequest, NextResponse } from "next/server";

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function decodeToken(value?: string) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;
  return { supabaseUrl, anonKey };
}

function getAccessTokenFromRequest(req: NextRequest) {
  const cookieToken = req.cookies.get("sb-access-token")?.value;
  const headerToken = req.headers.get("x-supabase-auth") || undefined;
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return decodeToken(headerToken || bearerToken || cookieToken || "");
}

async function resolveIdentity(req: NextRequest) {
  const headerUserId = req.headers.get("x-user-id") || undefined;
  const headerEmail = req.headers.get("x-user-email") || undefined;

  if (headerUserId || headerEmail) {
    return { userId: headerUserId, email: headerEmail, token: getAccessTokenFromRequest(req) };
  }

  const config = getSupabaseConfig();
  if (!config) {
    return { userId: undefined, email: undefined, token: "" };
  }

  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return { userId: undefined, email: undefined, token: "" };
  }

  const userRes = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: config.anonKey,
    },
    cache: "no-store",
  });

  if (!userRes.ok) {
    return { userId: undefined, email: undefined, token };
  }

  const user = await userRes.json();
  return {
    userId: user?.id as string | undefined,
    email: user?.email as string | undefined,
    token,
  };
}

export async function GET(req: NextRequest) {
  try {
    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json({ integrations: [] });
    }

    const identity = await resolveIdentity(req);
    if (!isUuid(identity.userId) && !identity.email) {
      return NextResponse.json({ integrations: [] });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authKey = serviceRoleKey || identity.token;
    const apiKey = serviceRoleKey || config.anonKey;

    if (!authKey) {
      return NextResponse.json({ integrations: [] });
    }

    const identityFilter = isUuid(identity.userId)
      ? `user_id=eq.${identity.userId}`
      : `user_email=eq.${encodeURIComponent(identity.email as string)}`;

    const query = `${identityFilter}&provider=eq.postpulse&select=platform,platform_id,created_at&order=created_at.desc`;
    const target = `${config.supabaseUrl}/rest/v1/integrations?${query}`;

    const res = await fetch(target, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authKey}`,
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ integrations: [] });
    }

    const data = await res.json();
    return NextResponse.json({ integrations: Array.isArray(data) ? data : [] });
  } catch (error) {
    console.error("PostPulse status error:", error);
    return NextResponse.json({ integrations: [] });
  }
}
