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

export async function GET(req: NextRequest) {
  const cookiePlatformId = req.cookies.get("fb_platform_id")?.value;
  const cookiePageName = req.cookies.get("fb_page_name")?.value;

  console.log("Facebook status check", {
    hasCookiePlatformId: !!cookiePlatformId,
    allCookies: req.headers.get("cookie"),
  });

  try {
    const { userId: headerUserId, email } = await resolveIdentity(req);

    // Cookie fallback: if we have the integration in cookies, return connected
    if (cookiePlatformId) {
      console.log("Returning connected from cookies");
      return NextResponse.json({
        connected: true,
        pages: [
          {
            platform_id: cookiePlatformId,
            page_name: cookiePageName || "Facebook Account",
            created_at: new Date().toISOString(),
          },
        ],
        status: "Connected",
      });
    }

    console.log("No cookies found, trying DB lookup", { email, headerUserId });

    if (!email && !headerUserId) {
      return NextResponse.json({ connected: false, pages: [], status: "Not Connected" });
    }

    // Try REST API to fetch integration from database
    const config = getSupabaseConfig();

    if (!config) {
      // Fallback to cookies if DB unavailable
      return NextResponse.json({
        connected: !!cookiePlatformId,
        pages: cookiePlatformId
          ? [
              {
                platform_id: cookiePlatformId,
                page_name: cookiePageName || "Facebook Account",
                created_at: new Date().toISOString(),
              },
            ]
          : [],
        status: cookiePlatformId ? "Connected" : "Not Connected",
      });
    }

    // Query by user_id if available
    if (isUuid(headerUserId)) {
      const queryUrl = new URL(
        `${config.supabaseUrl}/rest/v1/integrations?user_id=eq.${headerUserId}&platform=eq.facebook&select=platform_id,page_name,access_token,created_at`
      );
      const res = await fetch(queryUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.anonKey}`,
          apikey: config.anonKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json({
          connected: true,
          pages: data,
          status: "Connected",
        });
      }
    }

    // Query by email if user_id didn't work
    if (email) {
      const queryUrl = new URL(
        `${config.supabaseUrl}/rest/v1/integrations?user_email=eq.${encodeURIComponent(email)}&platform=eq.facebook&select=platform_id,page_name,access_token,created_at`
      );
      const res = await fetch(queryUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.anonKey}`,
          apikey: config.anonKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json({
          connected: true,
          pages: data,
          status: "Connected",
        });
      }
    }

    // Not found in DB, but return connected if we have cookies
    return NextResponse.json({
      connected: false,
      pages: [],
      status: "Not Connected",
    });
  } catch (error) {
    console.error("Facebook status error:", error);
    // Fallback to cookies on error
    return NextResponse.json({
      connected: !!cookiePlatformId,
      pages: cookiePlatformId
        ? [
            {
              platform_id: cookiePlatformId,
              page_name: cookiePageName || "Facebook Account",
              created_at: new Date().toISOString(),
            },
          ]
        : [],
      status: cookiePlatformId ? "Connected (cache)" : "Error",
    });
  }
}


