import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

function getAppBaseUrl(req: NextRequest) {
  const configuredBase =
    process.env.FACEBOOK_APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.SITE_URL ||
    process.env.URL;

  if (configuredBase) {
    return configuredBase.replace(/\/+$/, "");
  }

  return req.nextUrl.origin;
}

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getFacebookRedirectUri(req: NextRequest) {
  if (process.env.FACEBOOK_REDIRECT_URI) {
    return process.env.FACEBOOK_REDIRECT_URI;
  }

  return `${getAppBaseUrl(req)}/api/integrations/facebook/callback`;
}

function withFacebookCookies(
  response: NextResponse,
  payload: {
    platformId: string;
    pageName: string;
    accessToken: string;
    pageAccessToken: string | null;
  }
) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("fb_platform_id", payload.platformId, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set("fb_page_name", payload.pageName, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set("fb_access_token", payload.accessToken, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set("fb_page_access_token", payload.pageAccessToken || "", {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

async function ensureIntegrationsTable() {
  const pg = await getPgClient();
  await pg.query(`
    CREATE TABLE IF NOT EXISTS integrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      user_email VARCHAR,
      platform VARCHAR NOT NULL,
      platform_id VARCHAR NOT NULL,
      page_name VARCHAR,
      access_token TEXT NOT NULL,
      page_access_token TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  return pg;
}

async function upsertIntegration(
  pg: Awaited<ReturnType<typeof getPgClient>>,
  params: {
    userId?: string;
    email?: string;
    platformId: string;
    pageName: string;
    accessToken: string;
    pageAccessToken: string | null;
  }
) {
  const { userId, email, platformId, pageName, accessToken, pageAccessToken } = params;

  if (isUuid(userId)) {
    try {
      const updateByUserId = await pg.query(
        `UPDATE integrations
         SET page_name = $4, access_token = $5, page_access_token = $6, updated_at = NOW()
         WHERE user_id = $1 AND platform = $2 AND platform_id = $3`,
        [userId, "facebook", platformId, pageName, accessToken, pageAccessToken]
      );

      if (updateByUserId.rowCount === 0) {
        await pg.query(
          `INSERT INTO integrations (user_id, platform, platform_id, page_name, access_token, page_access_token, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [userId, "facebook", platformId, pageName, accessToken, pageAccessToken]
        );
      }
      return;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "42703") {
        throw error;
      }
    }
  }

  if (!email) {
    throw new Error("missing_identity_for_fallback");
  }

  const updateByEmail = await pg.query(
    `UPDATE integrations
     SET page_name = $4, access_token = $5, page_access_token = $6, updated_at = NOW()
     WHERE user_email = $1 AND platform = $2 AND platform_id = $3`,
    [email, "facebook", platformId, pageName, accessToken, pageAccessToken]
  );

  if (updateByEmail.rowCount === 0) {
    await pg.query(
      `INSERT INTO integrations (user_email, platform, platform_id, page_name, access_token, page_access_token, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [email, "facebook", platformId, pageName, accessToken, pageAccessToken]
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const appBaseUrl = getAppBaseUrl(req);

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=facebook_config_missing", appBaseUrl));
    }

    const cookieUserId = req.cookies.get("fb_user_id")?.value;
    const cookieEmail = req.cookies.get("fb_user_email")?.value;
    const email = cookieEmail;

    // Get code and state from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Verify state matches cookie
    const storedState = req.cookies.get("fb_oauth_state")?.value;
    if (!state || state !== storedState) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=state_mismatch", appBaseUrl));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=no_code", appBaseUrl));
    }

    const redirectUri = getFacebookRedirectUri(req);

    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
    tokenUrl.searchParams.set("client_secret", FACEBOOK_APP_SECRET);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      console.error("Facebook token error:", tokenData.error);
      const reason = tokenData?.error?.code || tokenResponse.status || "unknown";
      const message = encodeURIComponent(String(tokenData?.error?.message || tokenResponse.statusText || "token_exchange_failed"));
      return NextResponse.redirect(
        new URL(`/settings?tab=connected&error=token_failed&reason=${reason}&message=${message}`, appBaseUrl)
      );
    }

    // Try to fetch pages when page scopes are granted.
    // If page scopes are unavailable, fall back to basic profile so connect still works.
    let platformId = "";
    let pageName = "";
    let pageAccessToken: string | null = null;

    const pagesResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${tokenData.access_token}`
    );
    const pagesData = await pagesResponse.json();

    if (Array.isArray(pagesData?.data) && pagesData.data.length > 0) {
      platformId = String(pagesData.data[0]?.id || "");
      pageName = String(pagesData.data[0]?.name || "Facebook Page");
      pageAccessToken = pagesData.data[0]?.access_token ? String(pagesData.data[0].access_token) : null;
    } else {
      const meResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name&access_token=${encodeURIComponent(tokenData.access_token)}`
      );
      const meData = await meResponse.json();
      platformId = String(meData?.id || "");
      pageName = String(meData?.name || "Facebook Account");
    }
    // Store integration in database
    const pg = await ensureIntegrationsTable();
    let userId = cookieUserId;

    if (!isUuid(userId)) {
      if (!email) {
        return NextResponse.redirect(new URL("/settings?tab=connected&error=missing_identity", appBaseUrl));
      }

      const userLookup = await pg.query(
        "SELECT id FROM auth.users WHERE email = $1 LIMIT 1",
        [email]
      );
      userId = userLookup.rows[0]?.id;
    }

    if (!isUuid(userId) && !email) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=missing_identity", appBaseUrl));
    }

    let storageWarning = "";
    try {
      await upsertIntegration(pg, {
        userId,
        email,
        platformId,
        pageName,
        accessToken: tokenData.access_token,
        pageAccessToken,
      });
    } catch (storageError) {
      console.error("Facebook callback storage warning:", storageError);
      storageWarning = "&warning=storage_fallback";
    }

    // Redirect with success and store secure cookie fallback for analytics/status.
    const response = NextResponse.redirect(
      new URL(`/settings?tab=connected&platform=facebook&status=connected${storageWarning}`, appBaseUrl)
    );
    withFacebookCookies(response, {
      platformId,
      pageName,
      accessToken: tokenData.access_token,
      pageAccessToken,
    });
    return response;
  } catch (error) {
    console.error("Facebook callback error:", error);
    const code = (error as { code?: string }).code;
    const reason = code === "42P01"
      ? "table_missing"
      : code === "42703"
        ? "schema_mismatch"
        : "callback_failed";
    return NextResponse.redirect(new URL(`/settings?tab=connected&error=server_error&reason=${reason}`, getAppBaseUrl(req)));
  }
}
