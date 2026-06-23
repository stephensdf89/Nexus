import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

function getFacebookRedirectUri(req: NextRequest) {
  if (process.env.FACEBOOK_REDIRECT_URI) {
    return process.env.FACEBOOK_REDIRECT_URI;
  }

  return `${req.nextUrl.origin}/api/integrations/facebook/callback`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

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
    const pg = await getPgClient();
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=missing_user_id", req.url));
    }

    await pg.query(
      `INSERT INTO integrations (user_id, platform, platform_id, page_name, access_token, page_access_token, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id, platform, platform_id) 
       DO UPDATE SET access_token = $5, page_access_token = $6, updated_at = NOW()`,
      [
        userId,
        "facebook",
        platformId,
        pageName,
        tokenData.access_token,
        pageAccessToken,
      ]
    );

    // Redirect with success
    return NextResponse.redirect(new URL("/settings?tab=connected&platform=facebook&status=connected", req.url));
  } catch (error) {
    console.error("Facebook callback error:", error);
    return NextResponse.redirect(new URL("/settings?tab=connected&error=server_error", req.url));
  }
}
