import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<{
  access_token: string;
  refresh_token?: string;
  user_id: string;
}> {
  const response = await fetch("https://twitter.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITTER_CLIENT_ID || "",
      client_secret: process.env.TWITTER_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: getTwitterRedirectUri(),
      code_verifier: codeVerifier,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user_id: data.data?.id || "",
  };
}

function getTwitterRedirectUri(): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.creatornexuspro.com";

  return `${baseUrl}/api/integrations/twitter/callback`;
}

async function fetchUserProfile(accessToken: string): Promise<{
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}> {
  const response = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.data.id,
    username: data.data.username,
    name: data.data.name,
    profile_image_url: data.data.profile_image_url,
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
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  const pg = await getPgClient();

  if (userId) {
    const existing = await pg.query(
      `SELECT id FROM integrations WHERE user_id = $1 AND platform = 'twitter'`,
      [userId]
    );

    if (existing.rows?.length > 0) {
      await pg.query(
        `UPDATE integrations 
         SET access_token = $1, refresh_token = $2, channel_name = $3, thumbnail_url = $4, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5 AND platform = 'twitter'`,
        [accessToken, refreshToken || null, channelName, thumbnailUrl, userId]
      );
      return;
    }
  }

  if (userEmail) {
    const existing = await pg.query(
      `SELECT id FROM integrations WHERE user_email = $1 AND platform = 'twitter'`,
      [userEmail]
    );

    if (existing.rows?.length > 0) {
      await pg.query(
        `UPDATE integrations 
         SET access_token = $1, refresh_token = $2, channel_name = $3, thumbnail_url = $4, updated_at = CURRENT_TIMESTAMP
         WHERE user_email = $5 AND platform = 'twitter'`,
        [accessToken, refreshToken || null, channelName, thumbnailUrl, userEmail]
      );
      return;
    }
  }

  await pg.query(
    `INSERT INTO integrations (user_id, user_email, platform, platform_id, channel_name, thumbnail_url, access_token, refresh_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, userEmail, "twitter", platformId, channelName, thumbnailUrl, accessToken, refreshToken || null]
  );
}

function withTwitterCookies(response: NextResponse, accessToken: string, refreshToken?: string): void {
  response.cookies.set("tw_access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  if (refreshToken) {
    response.cookies.set("tw_refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("tw_auth_state")?.value;

    const userId = req.cookies.get("tw_user_id")?.value;
    const userEmail = req.cookies.get("tw_user_email")?.value;

    if (!code || state !== storedState) {
      return NextResponse.json(
        { error: "Invalid authorization state" },
        { status: 400 }
      );
    }

    const codeVerifier = req.nextUrl.searchParams.get("code_verifier") || "";
    const { access_token, refresh_token, user_id: twitterUserId } =
      await exchangeCodeForToken(code, codeVerifier);

    const profile = await fetchUserProfile(access_token);

    await ensureIntegrationsTable();
    await upsertIntegration(
      userId || null,
      userEmail || null,
      profile.id,
      profile.username,
      profile.profile_image_url || null,
      access_token,
      refresh_token
    );

    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?twitter=connected`,
      { status: 303 }
    );

    withTwitterCookies(response, access_token, refresh_token);
    response.cookies.delete("tw_auth_state");
    response.cookies.delete("tw_user_id");
    response.cookies.delete("tw_user_email");

    return response;
  } catch (error) {
    console.error("Twitter callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}


