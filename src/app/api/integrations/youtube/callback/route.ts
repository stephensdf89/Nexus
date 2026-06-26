import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

interface YouTubeProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface YouTubeChannel {
  id: string;
  title: string;
  thumbnail?: string;
}

async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
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
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

async function fetchUserProfile(accessToken: string): Promise<YouTubeProfile> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data = await response.json();
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

async function fetchYouTubeChannel(accessToken: string): Promise<YouTubeChannel> {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch YouTube channel");
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("No YouTube channel found");
  }

  const channel = data.items[0];
  return {
    id: channel.id,
    title: channel.snippet.title,
    thumbnail: channel.snippet.thumbnails.default?.url,
  };
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
    // Try UPDATE first if user_id is available
    if (userId) {
      const result = await client.query(
        `UPDATE integrations 
         SET platform_id = $1, channel_name = $2, thumbnail_url = $3, 
             access_token = $4, refresh_token = $5, token_expires_at = $6, updated_at = NOW()
         WHERE user_id = $7 AND platform = 'youtube'`,
        [platformId, channelName, thumbnail, accessToken, refreshToken, expiresAt, userId]
      );

      if (result.rowCount! > 0) {
        return;
      }
    }

    // Try UPDATE with email
    const emailResult = await client.query(
      `UPDATE integrations 
       SET platform_id = $1, channel_name = $2, thumbnail_url = $3,
           access_token = $4, refresh_token = $5, token_expires_at = $6, updated_at = NOW()
       WHERE user_email = $7 AND platform = 'youtube'`,
      [platformId, channelName, thumbnail, accessToken, refreshToken, expiresAt, userEmail]
    );

    if (emailResult.rowCount! > 0) {
      return;
    }

    // INSERT if no existing record
    await client.query(
      `INSERT INTO integrations (user_id, user_email, platform, platform_id, channel_name, thumbnail_url, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, 'youtube', $3, $4, $5, $6, $7, $8)`,
      [userId, userEmail, platformId, channelName, thumbnail, accessToken, refreshToken, expiresAt]
    );
  } catch (err) {
    console.error("Error upserting integration:", err);
    throw err;
  }
}

async function withYouTubeCookies(
  response: NextResponse,
  channelId: string,
  channelName: string,
  thumbnail: string | undefined,
  accessToken: string,
  refreshToken: string | undefined
): Promise<void> {
  response.cookies.set("yt_channel_id", channelId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  response.cookies.set("yt_channel_name", channelName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (thumbnail) {
    response.cookies.set("yt_thumbnail", thumbnail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  response.cookies.set("yt_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (refreshToken) {
    response.cookies.set("yt_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year for refresh token
    });
  }
}

function getYouTubeRedirectUri(origin?: string): string {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    origin ||
    "https://www.creatornexuspro.com";
  return `${baseUrl}/api/integrations/youtube/callback`;
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");

    // Check for errors from Google
    if (error) {
      const returnUrl = `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&youtube_error=${error}`;
      return NextResponse.redirect(returnUrl);
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&youtube_error=no_code`
      );
    }

    // Verify state
    const storedState = req.cookies.get("yt_state")?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&youtube_error=state_mismatch`
      );
    }

    // Exchange code for token
    const redirectUri = getYouTubeRedirectUri(req.headers.get("origin") || undefined);
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // Fetch user profile
    const profile = await fetchUserProfile(tokenData.access_token);

    // Fetch YouTube channel
    const channel = await fetchYouTubeChannel(tokenData.access_token);

    // Get user info from cookies
    const userId = req.cookies.get("yt_user_id")?.value;
    const userEmail = req.cookies.get("yt_user_email")?.value;

    // Store in database (best-effort)
    try {
      const pg = await getPgClient();
      await ensureIntegrationsTable(pg);
      await upsertIntegration(
        pg,
        userId || null,
        userEmail || profile.email,
        channel.id,
        channel.title,
        channel.thumbnail,
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_in
      );
    } catch (dbErr) {
      console.error("Database persistence failed, using cookies:", dbErr);
    }

    // Create response
    const successUrl = `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&youtube_connected=true`;
    const response = NextResponse.redirect(successUrl);

    // Set cookies as fallback
    await withYouTubeCookies(
      response,
      channel.id,
      channel.title,
      channel.thumbnail,
      tokenData.access_token,
      tokenData.refresh_token
    );

    return response;
  } catch (error) {
    console.error("Error in YouTube callback:", error);
    const returnUrl = `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/settings?tab=platforms&youtube_error=callback_failed`;
    return NextResponse.redirect(returnUrl);
  }
}


