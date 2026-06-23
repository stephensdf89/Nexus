import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveUserId(email: string, sessionUserId?: string) {
  const pg = await getPgClient();

  if (isUuid(sessionUserId)) {
    return { pg, userId: sessionUserId };
  }

  const userLookup = await pg.query(
    "SELECT id FROM auth.users WHERE email = $1 LIMIT 1",
    [email]
  );

  return { pg, userId: userLookup.rows[0]?.id as string | undefined };
}

export async function GET(req: NextRequest) {
  const cookiePlatformId = req.cookies.get("fb_platform_id")?.value || "";
  const cookiePageName = req.cookies.get("fb_page_name")?.value || "Facebook Account";
  const cookiePageAccessToken = req.cookies.get("fb_page_access_token")?.value || "";
  const cookieAccessToken = req.cookies.get("fb_access_token")?.value || "";

  try {
    const headerEmail = req.headers.get("x-user-email") || undefined;
    const headerUserId = req.headers.get("x-user-id") || undefined;
    const email = headerEmail;
    const userIdFromSession = headerUserId;

    if (!email && !userIdFromSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pg, userId } = await resolveUserId(
      email || "",
      userIdFromSession
    );

    if (!isUuid(userId)) {
      return NextResponse.json({ error: "Missing user id in session" }, { status: 400 });
    }

    let integration;
    try {
      integration = await pg.query(
        `SELECT platform_id, page_name, access_token, page_access_token
         FROM integrations
         WHERE user_id = $1 AND platform = 'facebook'
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "42703") {
        throw error;
      }

      integration = await pg.query(
        `SELECT platform_id, page_name, access_token, page_access_token
         FROM integrations
         WHERE user_email = $1 AND platform = 'facebook'
         ORDER BY created_at DESC
         LIMIT 1`,
        [email]
      );
    }

    let platformId = "";
    let pageName = "Facebook Account";
    let token = "";

    if (integration.rows.length > 0) {
      const row = integration.rows[0] as {
        platform_id: string;
        page_name: string;
        access_token: string;
        page_access_token: string | null;
      };
      platformId = row.platform_id;
      pageName = row.page_name;
      token = row.page_access_token || row.access_token;
    } else {
      platformId = req.cookies.get("fb_platform_id")?.value || "";
      pageName = req.cookies.get("fb_page_name")?.value || "Facebook Account";
      const cookiePageAccessToken = req.cookies.get("fb_page_access_token")?.value || "";
      const cookieAccessToken = req.cookies.get("fb_access_token")?.value || "";
      token = cookiePageAccessToken || cookieAccessToken;
    }

    if (!platformId || !token) {
      return NextResponse.json({ connected: false, error: "Facebook not connected" }, { status: 404 });
    }

    const pageFieldsRes = await fetch(
      `https://graph.facebook.com/v18.0/${platformId}?fields=id,name,fan_count,followers_count&access_token=${encodeURIComponent(token)}`
    );
    const pageFields = await pageFieldsRes.json();

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
      return NextResponse.json(
        { connected: true, warning: pageFields.error.message || "Connected, but unable to fetch page fields." },
        { status: 200 }
      );
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

    const platformId = cookiePlatformId;
    const token = cookiePageAccessToken || cookieAccessToken;

    if (!platformId || !token) {
      return NextResponse.json(
        { error: "Failed to fetch Facebook analytics" },
        { status: 500 }
      );
    }

    try {
      const pageFieldsRes = await fetch(
        `https://graph.facebook.com/v18.0/${platformId}?fields=id,name,fan_count,followers_count&access_token=${encodeURIComponent(token)}`
      );
      const pageFields = await pageFieldsRes.json();

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
        return NextResponse.json(
          { connected: true, warning: pageFields.error.message || "Connected, but unable to fetch page fields." },
          { status: 200 }
        );
      }

      return NextResponse.json({
        connected: true,
        page: {
          id: pageFields.id || platformId,
          name: pageFields.name || cookiePageName,
          fanCount: typeof pageFields.fan_count === "number" ? pageFields.fan_count : null,
          followersCount: typeof pageFields.followers_count === "number" ? pageFields.followers_count : null,
        },
        insights: {
          pageImpressions: impressions,
          pageEngagedUsers: engagedUsers,
        },
        warning,
      });
    } catch (cookieFallbackError) {
      console.error("Cookie fallback analytics error:", cookieFallbackError);
      return NextResponse.json(
        { error: "Failed to fetch Facebook analytics" },
        { status: 500 }
      );
    }
  }
}
