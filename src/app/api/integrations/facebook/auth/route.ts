import { NextRequest, NextResponse } from "next/server";
import { serverErrorResponse } from "@/lib/apiAuth";

const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const SAFE_FACEBOOK_SCOPES = new Set([
  "public_profile",
  "email",
  "user_posts",
  "user_friends",
  "pages_show_list",
  "pages_read_engagement",
  "read_insights",
  "business_management",
  "instagram_basic",
  "instagram_manage_insights",
]);

function getSanitizedScopes() {
  const configured = process.env.FACEBOOK_OAUTH_SCOPES || "public_profile,email";
  const sanitized = configured
    .split(",")
    .map((scope) => scope.trim())
    .filter((scope) => SAFE_FACEBOOK_SCOPES.has(scope));

  return sanitized.length > 0 ? sanitized.join(",") : "public_profile,email";
}

function getFacebookRedirectUri(req: NextRequest) {
  if (process.env.FACEBOOK_REDIRECT_URI) {
    return process.env.FACEBOOK_REDIRECT_URI;
  }

  const baseUrl = getAppBaseUrl(req);
  return `${baseUrl}/api/integrations/facebook/callback`;
}

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

function buildFacebookAuthUrl(req: NextRequest, state: string) {
  const redirectUri = getFacebookRedirectUri(req);
  const scopes = getSanitizedScopes();
  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code`;
}

function withStateCookie(response: NextResponse, state: string) {
  response.cookies.set("fb_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });
  return response;
}

function withIdentityCookies(response: NextResponse, userId?: string, email?: string) {
  if (userId) {
    response.cookies.set("fb_user_id", userId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    });
  }

  if (email) {
    response.cookies.set("fb_user_email", email, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
    });
  }

  return response;
}

export async function GET(req: NextRequest) {
  try {
    const appBaseUrl = getAppBaseUrl(req);

    if (!FACEBOOK_APP_ID) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=facebook_config_missing", appBaseUrl));
    }

    const userId = req.nextUrl.searchParams.get("uid") || undefined;
    const email = req.nextUrl.searchParams.get("email") || undefined;

    if (!userId && !email) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=unauthorized", appBaseUrl));
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = buildFacebookAuthUrl(req, state);
    const response = NextResponse.redirect(authUrl);
    withStateCookie(response, state);
    withIdentityCookies(response, userId, email);
    return response;
  } catch (error) {
    console.error("Facebook auth GET error:", error);
    return NextResponse.redirect(new URL("/settings?tab=connected&error=auth_init_failed", getAppBaseUrl(req)));
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!FACEBOOK_APP_ID) {
      return NextResponse.json({ error: "Facebook app id is not configured" }, { status: 500 });
    }

    const userId = (req.headers.get("x-user-id") || "").trim() || undefined;
    const email = (req.headers.get("x-user-email") || "").trim() || undefined;

    if (!userId && !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = buildFacebookAuthUrl(req, state);

    const response = NextResponse.json({ authUrl });
    withStateCookie(response, state);
    withIdentityCookies(response, userId, email);
    return response;
  } catch (error) {
    console.error("Facebook auth error:", error);
    return serverErrorResponse(error);
  }
}
