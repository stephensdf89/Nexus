import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function buildYouTubeAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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
    const userId = req.nextUrl.searchParams.get("uid") || req.headers.get("x-user-id");
    const userEmail = req.nextUrl.searchParams.get("email") || req.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Missing user identity" },
        { status: 401 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth not configured" },
        { status: 500 }
      );
    }

    const redirectUri = getYouTubeRedirectUri(req.headers.get("origin") || undefined);
    const state = crypto.randomBytes(32).toString("hex");

    // Store state and user info in secure cookies for callback
    const response = new NextResponse(null, {
      status: 302,
      headers: {
        Location: buildYouTubeAuthUrl(clientId, redirectUri, state),
      },
    });

    response.cookies.set("yt_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
    });

    response.cookies.set("yt_user_id", userId || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
    });

    response.cookies.set("yt_user_email", userEmail || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    console.error("Error in YouTube auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate YouTube authentication" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, email } = await req.json();

    if (!uid && !email) {
      return NextResponse.json(
        { error: "Missing user identity" },
        { status: 401 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth not configured" },
        { status: 500 }
      );
    }

    const redirectUri = getYouTubeRedirectUri();
    const state = crypto.randomBytes(32).toString("hex");
    const authUrl = buildYouTubeAuthUrl(clientId, redirectUri, state);

    return NextResponse.json({
      success: true,
      authUrl,
      state,
    });
  } catch (error) {
    console.error("Error building YouTube auth URL:", error);
    return NextResponse.json(
      { error: "Failed to build YouTube authentication URL" },
      { status: 500 }
    );
  }
}
