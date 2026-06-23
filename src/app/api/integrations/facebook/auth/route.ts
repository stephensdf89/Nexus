import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const SAFE_FACEBOOK_SCOPES = new Set(["public_profile", "email"]);

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

  return `${req.nextUrl.origin}/api/integrations/facebook/callback`;
}

function buildFacebookAuthUrl(req: NextRequest, state: string) {
  const redirectUri = getFacebookRedirectUri(req);
  const scopes = getSanitizedScopes();
  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code`;
}

function withStateCookie(response: NextResponse, state: string) {
  response.cookies.set("fb_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });
  return response;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = buildFacebookAuthUrl(req, state);
    const response = NextResponse.redirect(authUrl);
    return withStateCookie(response, state);
  } catch (error) {
    console.error("Facebook auth GET error:", error);
    return NextResponse.redirect(new URL("/settings?tab=connected&error=auth_init_failed", req.url));
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = buildFacebookAuthUrl(req, state);

    const response = NextResponse.json({ authUrl });
    return withStateCookie(response, state);
  } catch (error) {
    console.error("Facebook auth error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Facebook auth" },
      { status: 500 }
    );
  }
}
