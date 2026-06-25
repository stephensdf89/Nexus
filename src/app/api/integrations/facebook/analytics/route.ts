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
    return { userId: headerUserId, email: headerEmail };
  }

  const config = getSupabaseConfig();
  if (!config) {
    return { userId: undefined, email: undefined };
  }

  const accessToken = getAccessTokenFromRequest(req);
  if (!accessToken) {
    return { userId: undefined, email: undefined };
  }

  const userRes = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: config.anonKey,
    },
    cache: "no-store",
  });

  if (!userRes.ok) {
    return { userId: undefined, email: undefined };
  }

  const user = await userRes.json();
  return {
    userId: user?.id as string | undefined,
    email: user?.email as string | undefined,
  };
}

async function loadFacebookIntegration(req: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return null;

  const identity = await resolveIdentity(req);
  const userId = identity.userId;
  const email = identity.email;

  if (isUuid(userId)) {
    const byUserRes = await fetch(
      `${config.supabaseUrl}/rest/v1/integrations?user_id=eq.${userId}&platform=eq.facebook&select=platform_id,page_name,access_token,page_access_token,created_at&order=created_at.desc&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${config.anonKey}`,
          apikey: config.anonKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (byUserRes.ok) {
      const data = await byUserRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }
  }

  if (email) {
    const byEmailRes = await fetch(
      `${config.supabaseUrl}/rest/v1/integrations?user_email=eq.${encodeURIComponent(email)}&platform=eq.facebook&select=platform_id,page_name,access_token,page_access_token,created_at&order=created_at.desc&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${config.anonKey}`,
          apikey: config.anonKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (byEmailRes.ok) {
      const data = await byEmailRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  const cookiePlatformId = req.cookies.get("fb_platform_id")?.value || "";
  const cookiePageName = req.cookies.get("fb_page_name")?.value || "Facebook Account";
  const cookiePageAccessToken = req.cookies.get("fb_page_access_token")?.value || "";
  const cookieAccessToken = req.cookies.get("fb_access_token")?.value || "";

  try {
    const integration = await loadFacebookIntegration(req);

    let platformId = "";
    let pageName = "Facebook Account";
    let token = "";

    if (integration) {
      platformId = String(integration.platform_id || "");
      pageName = String(integration.page_name || "Facebook Account");
      token = String(integration.page_access_token || integration.access_token || "");
    } else {
      platformId = cookiePlatformId;
      pageName = cookiePageName;
      token = cookiePageAccessToken || cookieAccessToken;
    }

    if (!platformId || !token) {
      return NextResponse.json({ connected: false, error: "Facebook not connected" }, { status: 404 });
    }

    const pageFieldsRes = await fetch(
      `https://graph.facebook.com/v18.0/${platformId}?fields=id,name,fan_count,followers_count&access_token=${encodeURIComponent(token)}`
    );
    let pageFields = await pageFieldsRes.json();

    let impressions: number | null = null;
    let engagedUsers: number | null = null;
    let warning: string | undefined;

    const insightsRes = await fetch(
      `https://graph.facebook.com/v18.0/${platformId}/insights?metric=page_impressions,page_engaged_users&period=day&access_token=${encodeURIComponent(token)}`
    );
    const insights = await insightsRes.json();

    if (insights?.data?.length) {
      for (const metric of insights.data as Array<{ name: string; values?: Array<{ value: number }> }>) {
        const value = metric.values?.[0]?.value;
        if (metric.name === "page_impressions") impressions = typeof value === "number" ? value : null;
        if (metric.name === "page_engaged_users") engagedUsers = typeof value === "number" ? value : null;
      }
    } else {
      warning = "Connected, but insights are unavailable for current token/scopes.";
    }

    if (pageFields?.error) {
      // Some object/token combinations do not expose fan_count/followers_count.
      // Retry with minimal fields so connected analytics can still render.
      const fallbackPageRes = await fetch(
        `https://graph.facebook.com/v18.0/${platformId}?fields=id,name&access_token=${encodeURIComponent(token)}`
      );
      const fallbackPage = await fallbackPageRes.json();

      if (!fallbackPage?.error) {
        pageFields = fallbackPage;
        warning = warning
          ? `${warning} Follower counts are unavailable for this connection.`
          : "Follower counts are unavailable for this connection.";
      } else {
        return NextResponse.json(
          { connected: true, warning: pageFields.error.message || "Connected, but unable to fetch page fields." },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({
      connected: true,
      page: {
        id: pageFields.id || platformId,
        name: pageFields.name || pageName,
        fanCount: typeof pageFields.fan_count === "number" ? pageFields.fan_count : null,
        followersCount: typeof pageFields.followers_count === "number" ? pageFields.followers_count : null,
      },
      insights: {
        pageImpressions: impressions,
        pageEngagedUsers: engagedUsers,
      },
      warning,
    });
  } catch (error) {
    console.error("Error fetching Facebook analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch Facebook analytics" },
      { status: 500 }
    );
  }
}
