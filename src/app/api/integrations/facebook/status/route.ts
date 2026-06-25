import { NextRequest, NextResponse } from "next/server";

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(req: NextRequest) {
  const cookiePlatformId = req.cookies.get("fb_platform_id")?.value;
  const cookiePageName = req.cookies.get("fb_page_name")?.value;

  try {
    const headerEmail = req.headers.get("x-user-email") || undefined;
    const headerUserId = req.headers.get("x-user-id") || undefined;
    const email = headerEmail;

    // Cookie fallback: if we have the integration in cookies, return connected
    if (cookiePlatformId) {
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

    if (!email && !headerUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try REST API to fetch integration from database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
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
        `${supabaseUrl}/rest/v1/integrations?user_id=eq.${headerUserId}&platform=eq.facebook&select=platform_id,page_name,access_token,created_at`
      );
      const res = await fetch(queryUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
        },
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
        `${supabaseUrl}/rest/v1/integrations?user_email=eq.${encodeURIComponent(email)}&platform=eq.facebook&select=platform_id,page_name,access_token,created_at`
      );
      const res = await fetch(queryUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
        },
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
