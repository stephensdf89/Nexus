import { NextRequest, NextResponse } from "next/server";

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;
  return { supabaseUrl, anonKey };
}

function decodeToken(value?: string) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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

async function getPostPulseAccessToken(req: NextRequest, platform?: string) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("supabase_config_missing");
  }

  const identity = await resolveIdentity(req);
  if (!isUuid(identity.userId) && !identity.email) {
    throw new Error("missing_identity");
  }

  const normalizedPlatform = platform ? platform.trim().toLowerCase() : "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authKey = serviceRoleKey || identity.token;
  const apiKey = serviceRoleKey || config.anonKey;

  if (!authKey) {
    throw new Error("missing_supabase_auth");
  }

  const identityFilter = isUuid(identity.userId)
    ? `user_id=eq.${identity.userId}`
    : `user_email=eq.${encodeURIComponent(identity.email as string)}`;
  const platformFilter = normalizedPlatform ? `&platform=eq.${encodeURIComponent(normalizedPlatform)}` : "";

  const query = `${identityFilter}&provider=eq.postpulse${platformFilter}&select=access_token,created_at&order=created_at.desc&limit=1`;

  const res = await fetch(`${config.supabaseUrl}/rest/v1/integrations?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authKey}`,
      apikey: apiKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`integrations_lookup_failed:${res.status}`);
  }

  const data = await res.json();
  const token = Array.isArray(data) && data.length > 0 ? data[0]?.access_token : null;

  if (!token) {
    throw new Error("postpulse_token_not_found");
  }

  return String(token);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;
    const normalizedPostId = String(postId || "").trim();
    const platform = req.nextUrl.searchParams.get("platform") || undefined;

    if (!normalizedPostId) {
      return NextResponse.json({ error: "Missing required path parameter: postId" }, { status: 400 });
    }

    const accessToken = await getPostPulseAccessToken(req, platform);
    const analyticsRes = await fetch(`https://api.postpulse.io/analytics/${encodeURIComponent(normalizedPostId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const contentType = analyticsRes.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await analyticsRes.json()
      : { message: await analyticsRes.text() };

    if (!analyticsRes.ok) {
      return NextResponse.json(
        {
          error: "PostPulse analytics request failed",
          details: data,
        },
        { status: analyticsRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PostPulse analytics error:", error);
    const message = (error as { message?: string })?.message || "analytics_failed";

    if (message === "postpulse_token_not_found") {
      return NextResponse.json(
        { error: "PostPulse not connected for this user/platform" },
        { status: 404 }
      );
    }

    if (message === "missing_identity") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}