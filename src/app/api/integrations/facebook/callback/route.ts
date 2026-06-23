import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getFacebookRedirectUri(req: NextRequest) {
  if (process.env.FACEBOOK_REDIRECT_URI) {
    return process.env.FACEBOOK_REDIRECT_URI;
  }

  return `${req.nextUrl.origin}/api/integrations/facebook/callback`;
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

  await pg.query(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_uid_platform ON integrations (user_id, platform, platform_id) WHERE user_id IS NOT NULL"
  );
  await pg.query(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_uemail_platform ON integrations (user_email, platform, platform_id) WHERE user_email IS NOT NULL"
  );

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
      await pg.query(
        `INSERT INTO integrations (user_id, platform, platform_id, page_name, access_token, page_access_token, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id, platform, platform_id)
         DO UPDATE SET access_token = $5, page_access_token = $6, updated_at = NOW()`,
        [userId, "facebook", platformId, pageName, accessToken, pageAccessToken]
      );
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

  await pg.query(
    `INSERT INTO integrations (user_email, platform, platform_id, page_name, access_token, page_access_token, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_email, platform, platform_id)
     DO UPDATE SET access_token = $5, page_access_token = $6, updated_at = NOW()`,
    [email, "facebook", platformId, pageName, accessToken, pageAccessToken]
  );
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
    const sessionEmail = session?.user?.email;
    const cookieUserId = req.cookies.get("fb_user_id")?.value;
    const cookieEmail = req.cookies.get("fb_user_email")?.value;
    const email = sessionEmail || cookieEmail;

    // Get code and state from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Verify state matches cookie
    const storedState = req.cookies.get("fb_oauth_state")?.value;
    if (!state || state !== storedState) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=state_mismatch", req.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=no_code", req.url));
    }

    const redirectUri = getFacebookRedirectUri(req);

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Facebook token error:", tokenData.error);
      return NextResponse.redirect(new URL("/settings?tab=connected&error=token_failed", req.url));
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

    if (Array.isArray(pagesData.data) && pagesData.data.length > 0) {
      const page = pagesData.data[0];
      platformId = page.id;
      pageName = page.name;
      pageAccessToken = page.access_token || null;
    } else {
      const meResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name&access_token=${tokenData.access_token}`
      );
      const meData = await meResponse.json();

      if (!meData?.id) {
        return NextResponse.redirect(new URL("/settings?tab=connected&error=no_profile", req.url));
      }

      platformId = meData.id;
      pageName = meData.name || "Facebook Account";
    }

    // Store integration in database
    const pg = await ensureIntegrationsTable();
    let userId = sessionUserId || cookieUserId;

    if (!isUuid(userId)) {
      if (!email) {
        return NextResponse.redirect(new URL("/settings?tab=connected&error=missing_identity", req.url));
      }

      const userLookup = await pg.query(
        "SELECT id FROM auth.users WHERE email = $1 LIMIT 1",
        [email]
      );
      userId = userLookup.rows[0]?.id;
    }

    if (!isUuid(userId)) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=missing_user_id", req.url));
    }

    await upsertIntegration(pg, {
      userId,
      email,
      platformId,
      pageName,
      accessToken: tokenData.access_token,
      pageAccessToken,
    });

    // Redirect with success
    return NextResponse.redirect(new URL("/settings?tab=connected&platform=facebook&status=connected", req.url));
  } catch (error) {
    console.error("Facebook callback error:", error);
    const code = (error as { code?: string }).code;
    const reason = code === "42P01"
      ? "table_missing"
      : code === "42703"
        ? "schema_mismatch"
        : "callback_failed";
    return NextResponse.redirect(new URL(`/settings?tab=connected&error=server_error&reason=${reason}`, req.url));
  }
}
