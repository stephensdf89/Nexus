import { NextRequest, NextResponse } from "next/server";

const POSTPULSE_TOKEN_URL = "https://api.postpulse.io/oauth/token";

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

function getAppBaseUrl(req: NextRequest) {
  const configuredBase = process.env.NEXTAUTH_URL || process.env.SITE_URL || process.env.URL;
  if (configuredBase) return configuredBase.replace(/\/+$/, "");
  return req.nextUrl.origin;
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

type PostPulseTokenData = {
  platform?: string;
  account_id?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  message?: string;
};

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.POSTPULSE_CLIENT_ID;
  const clientSecret = process.env.POSTPULSE_CLIENT_SECRET;
  const redirectUri = process.env.POSTPULSE_REDIRECT;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("postpulse_env_missing");
  }

  const tokenRes = await fetch(POSTPULSE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  const data = (await tokenRes.json()) as PostPulseTokenData;

  if (!tokenRes.ok || data.error || !data.access_token) {
    const reason = data.error || data.message || `token_exchange_${tokenRes.status}`;
    throw new Error(`postpulse_token_failed:${reason}`);
  }

  return data;
}

async function upsertPostPulseIntegration(req: NextRequest, tokenData: PostPulseTokenData) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("supabase_config_missing");
  }

  const identity = await resolveIdentity(req);
  const platform = String(tokenData.platform || "postpulse").trim().toLowerCase();

  if (!isUuid(identity.userId) && !identity.email) {
    throw new Error("missing_identity");
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authKey = serviceRoleKey || identity.token;
  const apiKey = serviceRoleKey || config.anonKey;

  if (!authKey) {
    throw new Error("missing_supabase_auth");
  }

  const expiresIn = typeof tokenData.expires_in === "number" ? tokenData.expires_in : 0;
  const expiresAt = expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

  const record: Record<string, unknown> = {
    provider: "postpulse",
    platform,
    platform_id: tokenData.account_id ? String(tokenData.account_id) : null,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    expires_at: expiresAt,
    token_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  };

  const query = isUuid(identity.userId)
    ? `user_id=eq.${identity.userId}&provider=eq.postpulse&platform=eq.${encodeURIComponent(platform)}&select=id`
    : `user_email=eq.${encodeURIComponent(identity.email as string)}&provider=eq.postpulse&platform=eq.${encodeURIComponent(platform)}&select=id`;

  if (isUuid(identity.userId)) {
    record.user_id = identity.userId;
  } else if (identity.email) {
    record.user_email = identity.email;
  }

  const checkRes = await fetch(`${config.supabaseUrl}/rest/v1/integrations?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authKey}`,
      apikey: apiKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!checkRes.ok) {
    throw new Error(`integrations_lookup_failed:${checkRes.status}`);
  }

  const existing = await checkRes.json();

  if (Array.isArray(existing) && existing.length > 0 && existing[0]?.id) {
    const updateRes = await fetch(`${config.supabaseUrl}/rest/v1/integrations?id=eq.${existing[0].id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authKey}`,
        apikey: apiKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(record),
    });

    if (!updateRes.ok) {
      throw new Error(`integrations_update_failed:${updateRes.status}`);
    }
    return;
  }

  const insertRes = await fetch(`${config.supabaseUrl}/rest/v1/integrations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authKey}`,
      apikey: apiKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...record,
      created_at: new Date().toISOString(),
    }),
  });

  if (!insertRes.ok) {
    throw new Error(`integrations_insert_failed:${insertRes.status}`);
  }
}

export async function GET(req: NextRequest) {
  const appBaseUrl = getAppBaseUrl(req);
  const dashboardUrl = new URL("/dashboard", appBaseUrl);
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    dashboardUrl.searchParams.set("connected", "error");
    dashboardUrl.searchParams.set("reason", "missing_code");
    return NextResponse.redirect(dashboardUrl);
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    await upsertPostPulseIntegration(req, tokenData);

    dashboardUrl.searchParams.set("connected", "success");
    if (tokenData.platform) {
      dashboardUrl.searchParams.set("platform", String(tokenData.platform));
    }
    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    console.error("PostPulse callback error:", error);
    dashboardUrl.searchParams.set("connected", "error");
    dashboardUrl.searchParams.set("reason", "oauth_callback_failed");
    return NextResponse.redirect(dashboardUrl);
  }
}