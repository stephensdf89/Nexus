import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

async function exchangeCodeForToken(
  code: string
): Promise<{ access_token: string; user_id: string }> {
  const response = await fetch("https://graph.instagram.com/v18.0/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID || "",
      client_secret: process.env.INSTAGRAM_APP_SECRET || "",
      grant_type: "authorization_code",
      redirect_uri: getInstagramRedirectUri(),
      code,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    user_id: data.user_id,
  };
}

function getInstagramRedirectUri(): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.creatornexuspro.com";

  return `${baseUrl}/api/integrations/instagram/callback`;
}

async function fetchUserProfile(
  accessToken: string,
  instagramUserId: string
): Promise<{ username: string; profile_picture_url?: string; biography?: string }> {
  const response = await fetch(
    `https://graph.instagram.com/v18.0/${instagramUserId}?fields=username,profile_picture_url,biography&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    username: data.username,
    profile_picture_url: data.profile_picture_url,
    biography: data.biography,
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
      `SELECT id FROM integrations WHERE user_id = $1 AND platform = 'instagram'`,
      [userId]
    );

    if (existing.rows?.length > 0) {
      await pg.query(
        `UPDATE integrations 
         SET access_token = $1, channel_name = $2, thumbnail_url = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4 AND platform = 'instagram'`,
        [accessToken, channelName, thumbnailUrl, userId]
      );
      return;
    }
  }

  if (userEmail) {
    const existing = await pg.query(
      `SELECT id FROM integrations WHERE user_email = $1 AND platform = 'instagram'`,
      [userEmail]
    );

    if (existing.rows?.length > 0) {
      await pg.query(
        `UPDATE integrations 
         SET access_token = $1, channel_name = $2, thumbnail_url = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_email = $4 AND platform = 'instagram'`,
        [accessToken, channelName, thumbnailUrl, userEmail]
      );
      return;
    }
  }

  await pg.query(
    `INSERT INTO integrations (user_id, user_email, platform, platform_id, channel_name, thumbnail_url, access_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, userEmail, "instagram", platformId, channelName, thumbnailUrl, accessToken]
  );
}

function withInstagramCookies(response: NextResponse, accessToken: string): void {
  response.cookies.set("ig_access_token", accessToken, {
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
    const storedState = req.cookies.get("ig_auth_state")?.value;

    const userId = req.cookies.get("ig_user_id")?.value;
    const userEmail = req.cookies.get("ig_user_email")?.value;

    if (!code || state !== storedState) {
      return NextResponse.json(
        { error: "Invalid authorization state" },
        { status: 400 }
      );
    }

    const { access_token, user_id: instagramUserId } =
      await exchangeCodeForToken(code);
    const profile = await fetchUserProfile(access_token, instagramUserId);

    await ensureIntegrationsTable();
    await upsertIntegration(
      userId || null,
      userEmail || null,
      instagramUserId,
      profile.username,
      profile.profile_picture_url || null,
      access_token
    );

    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?instagram=connected`,
      { status: 303 }
    );

    withInstagramCookies(response, access_token);
    response.cookies.delete("ig_auth_state");
    response.cookies.delete("ig_user_id");
    response.cookies.delete("ig_user_email");

    return response;
  } catch (error) {
    console.error("Instagram callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}


