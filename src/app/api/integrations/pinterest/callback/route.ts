import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

async function exchangeCodeForToken(code: string): Promise<{ access_token: string }> {
  const response = await fetch("https://api.pinterest.com/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.PINTEREST_APP_ID || "",
      client_secret: process.env.PINTEREST_APP_SECRET || "",
      redirect_uri: getPinterestRedirectUri(),
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return { access_token: data.access_token };
}

function getPinterestRedirectUri(): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.creatornexuspro.com";

  return `${baseUrl}/api/integrations/pinterest/callback`;
}

async function fetchUserProfile(accessToken: string): Promise<{
  id: string;
  username: string;
  profile_image?: string;
}> {
  const response = await fetch(
    `https://api.pinterest.com/v1/me?access_token=${accessToken}&fields=id,username,image`,
    {
      headers: { Accept: "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    username: data.username,
    profile_image: data.image?.medium?.url,
  };
}

async function ensureIntegrationsTable() {
  const pg = await getPgClient();
  await pg.query(`
    CREATE TABLE IF NOT EXISTS integrations (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      platform TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      channel_name TEXT,
      thumbnail_url TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function upsertIntegration(
  userId: string | null,
  userEmail: string | null,
  platformId: string,
  channelName: string,
  thumbnailUrl: string | null,
  accessToken: string
): Promise<void> {
  const pg = await getPgClient();

  if (userId) {
    const existing = await pg.query(
      `SELECT id FROM integrations WHERE user_id = $1 AND platform = 'pinterest'`,
      [userId]
    );

    if (existing.rows?.length > 0) {
      await pg.query(
        `UPDATE integrations 
         SET access_token = $1, channel_name = $2, thumbnail_url = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4 AND platform = 'pinterest'`,
        [accessToken, channelName, thumbnailUrl, userId]
      );
      return;
    }
  }

  if (userEmail) {
    const existing = await pg.query(
      `SELECT id FROM integrations WHERE user_email = $1 AND platform = 'pinterest'`,
      [userEmail]
    );

    if (existing.rows?.length > 0) {
      await pg.query(
        `UPDATE integrations 
         SET access_token = $1, channel_name = $2, thumbnail_url = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_email = $4 AND platform = 'pinterest'`,
        [accessToken, channelName, thumbnailUrl, userEmail]
      );
      return;
    }
  }

  await pg.query(
    `INSERT INTO integrations (user_id, user_email, platform, platform_id, channel_name, thumbnail_url, access_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, userEmail, "pinterest", platformId, channelName, thumbnailUrl, accessToken]
  );
}

function withPinterestCookies(response: NextResponse, accessToken: string): void {
  response.cookies.set("pn_access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("pn_auth_state")?.value;

    const userId = req.cookies.get("pn_user_id")?.value;
    const userEmail = req.cookies.get("pn_user_email")?.value;

    if (!code || state !== storedState) {
      return NextResponse.json(
        { error: "Invalid authorization state" },
        { status: 400 }
      );
    }

    const { access_token } = await exchangeCodeForToken(code);
    const profile = await fetchUserProfile(access_token);

    await ensureIntegrationsTable();
    await upsertIntegration(
      userId || null,
      userEmail || null,
      profile.id,
      profile.username,
      profile.profile_image || null,
      access_token
    );

    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?pinterest=connected`,
      { status: 303 }
    );

    withPinterestCookies(response, access_token);
    response.cookies.delete("pn_auth_state");
    response.cookies.delete("pn_user_id");
    response.cookies.delete("pn_user_email");

    return response;
  } catch (error) {
    console.error("Pinterest callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
