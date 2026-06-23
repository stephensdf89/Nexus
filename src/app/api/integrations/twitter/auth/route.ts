import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function buildTwitterAuthUrl(): string {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = getTwitterRedirectUri();
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("hex");

  const scope = encodeURIComponent(
    "tweet.read users.read follows.read follows.write offline.access"
  );

  const authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}&code_challenge=${codeVerifier}&code_challenge_method=plain`;

  return authUrl;
}

function getTwitterRedirectUri(): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.creatornexuspro.com";

  return `${baseUrl}/api/integrations/twitter/callback`;
}

export async function GET(req: NextRequest) {
  try {
    const authUrl = buildTwitterAuthUrl();
    const state = authUrl.split("state=")[1].split("&")[0];

    const userId = req.cookies.get("supabase-auth-token")?.value;
    const userEmail = req.nextUrl.searchParams.get("email");

    const response = NextResponse.json({ authUrl });

    response.cookies.set("tw_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    if (userId) {
      response.cookies.set("tw_user_id", userId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    if (userEmail) {
      response.cookies.set("tw_user_email", userEmail, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error("Error initiating Twitter auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate authentication" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, email } = await req.json();
    const authUrl = buildTwitterAuthUrl();
    const state = authUrl.split("state=")[1].split("&")[0];

    const response = NextResponse.json({ authUrl });

    response.cookies.set("tw_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
    });

    if (uid) {
      response.cookies.set("tw_user_id", uid, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    if (email) {
      response.cookies.set("tw_user_email", email, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error("Error initiating Twitter auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate authentication" },
      { status: 500 }
    );
  }
}
