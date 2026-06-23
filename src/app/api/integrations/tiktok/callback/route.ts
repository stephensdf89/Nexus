import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

interface TikTokProfile {
  user: {
    open_id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface TikTokUserStats {
  follower_count: number;
  following_count: number;
  video_count: number;
}

async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  open_id: string;
}> {
  const clientId = process.env.TIKTOK_CLIENT_ID;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("TikTok OAuth credentials not configured");
  }

  const response = await fetch("https://open.tiktokapis.com/v1/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    open_id: data.open_id,
  };
}

async function fetchUserInfo(accessToken: string, openId: string): Promise<TikTokProfile> {
  const response = await fetch(
    `https://open.tiktokapis.com/v1/user/info/?fields=display_name,avatar_url`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch TikTok user info");
  }

  return response.json();
}

async function fetchUserStats(accessToken: string): Promise<TikTokUserStats> {
  const response = await fetch(
    `https://open.tiktokapis.com/v1/user/stat/?fields=follower_count,following_count,video_count`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch TikTok user stats");
  }

  const data = await response.json();
  return data.user_stat;
}

async function ensureIntegrationsTable(client: Awaited<ReturnType<typeof getPgClient>>): Promise<void> {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        user_email VARCHAR,
        platform VARCHAR NOT NULL,
        platform_id VARCHAR NOT NULL,
        channel_name VARCHAR,
        thumbnail_url VARCHAR,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_integrations_user_email ON integrations(user_email);
    `);
  } catch (err) {
    console.error("Error ensuring integrations table:", err);
  }
}

async function upsertIntegration(
  client: Awaited<ReturnType<typeof getPgClient>>,
  userId: string | null,
  userEmail: string,
  platformId: string,
  channelName: string,
  thumbnail: string | undefined,
  accessToken: string,
  refreshToken: string | undefined,
  expiresIn: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  try {
    if (userId) {
      const result = await client.query(
        `UPDATE integrations 
         SET platform_id = $1, channel_name = $2, thumbnail_url = $3, 
             access_token = $4, refresh_token = $5, token_expires_at = $6, updated_at = NOW()
         WHERE user_id = $7 AND platform = 'tiktok'`,
        [platformId, channelName, thumbnail, accessToken, refreshToken, expiresAt, userId]
      );

      if (result.rowCount! > 0) {
        return;
      }
    }

    const emailResult = await client.query(
      `UPDATE integrations 
       SET platform_id = $1, channel_name = $2, thumbnail_url = $3,
           access_token = $4, refresh_token = $5, token_expires_at = $6, updated_at = NOW()
       WHERE user_email = $7 AND platform = 'tiktok'`,
      [platformId, channelName, thumbnail, accessToken, refreshToken, expiresAt, userEmail]
    );

    if (emailResult.rowCount! > 0) {
      return;
    }

    await client.query(
      `INSERT INTO integrations (user_id, user_email, platform, platform_id, channel_name, thumbnail_url, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, 'tiktok', $3, $4, $5, $6, $7, $8)`,
      [userId, userEmail, platformId, channelName, thumbnail, accessToken, refreshToken, expiresAt]
    );
  } catch (err) {
    console.error("Error upserting integration:", err);
    throw err;
  }
}

async function withTikTokCookies(
  response: NextResponse,
  channelId: string,
  channelName: string,
  thumbnail: string | undefined,
  accessToken: string,
  refreshToken: string | undefined
): Promise<void> {
  response.cookies.set("tt_channel_id", channelId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("tt_channel_name", channelName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (thumbnail) {
    response.cookies.set("tt_thumbnail", thumbnail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  response.cookies.set("tt_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (refreshToken) {
    response.cookies.set("tt_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
}

function getTikTokRedirectUri(origin?: string): string {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    origin ||
    "https://www.creatornexuspro.com";
  return `${baseUrl}/api/integrations/tiktok/callback`;
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");

    if (error) {
      const returnUrl = `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&tiktok_error=${error}`;
      return NextResponse.redirect(returnUrl);
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&tiktok_error=no_code`
      );
    }

    const storedState = req.cookies.get("tt_state")?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&tiktok_error=state_mismatch`
      );
    }

    const redirectUri = getTikTokRedirectUri(req.headers.get("origin") || undefined);
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    const userInfo = await fetchUserInfo(tokenData.access_token, tokenData.open_id);
    const userStats = await fetchUserStats(tokenData.access_token);

    const userId = req.cookies.get("tt_user_id")?.value;
    const userEmail = req.cookies.get("tt_user_email")?.value;

    try {
      const pg = await getPgClient();
      await ensureIntegrationsTable(pg);
      await upsertIntegration(
        pg,
        userId || null,
        userEmail || "",
        tokenData.open_id,
        userInfo.user.display_name,
        userInfo.user.avatar_url,
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_in
      );
    } catch (dbErr) {
      console.error("Database persistence failed, using cookies:", dbErr);
    }

    const successUrl = `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&tiktok_connected=true`;
    const response = NextResponse.redirect(successUrl);

    await withTikTokCookies(
      response,
      tokenData.open_id,
      userInfo.user.display_name,
      userInfo.user.avatar_url,
      tokenData.access_token,
      tokenData.refresh_token
    );

    return response;
  } catch (error) {
    console.error("Error in TikTok callback:", error);
    const returnUrl = `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&tiktok_error=callback_failed`;
    return NextResponse.redirect(returnUrl);
  }
}
