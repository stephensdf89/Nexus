import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function buildPinterestAuthUrl(): string {
  const clientId = process.env.PINTEREST_APP_ID;
  const redirectUri = getPinterestRedirectUri();
  const state = crypto.randomBytes(16).toString("hex");

  const scope = encodeURIComponent("boards:read,pins:read,user_accounts:read");

  const authUrl = `https://api.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;

  return authUrl;
}

function getPinterestRedirectUri(): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.creatornexuspro.com";

  return `${baseUrl}/api/integrations/pinterest/callback`;
}

export async function GET(req: NextRequest) {
  try {
    const authUrl = buildPinterestAuthUrl();
    const state = authUrl.split("state=")[1];

    const userId = req.cookies.get("supabase-auth-token")?.value;
    const userEmail = req.nextUrl.searchParams.get("email");

    const response = NextResponse.json({ authUrl });

    response.cookies.set("pn_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    if (userId) {
      response.cookies.set("pn_user_id", userId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    if (userEmail) {
      response.cookies.set("pn_user_email", userEmail, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error("Error initiating Pinterest auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate authentication" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, email } = await req.json();
    const authUrl = buildPinterestAuthUrl();
    const state = authUrl.split("state=")[1];

    const response = NextResponse.json({ authUrl });

    response.cookies.set("pn_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
    });

    if (uid) {
      response.cookies.set("pn_user_id", uid, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    if (email) {
      response.cookies.set("pn_user_email", email, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error("Error initiating Pinterest auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate authentication" },
      { status: 500 }
    );
  }
}
