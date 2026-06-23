import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/integrations/facebook/callback`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7);

    // Store state in session/cookie for verification
    const response = NextResponse.json({
      authUrl: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=pages_manage_metadata,pages_read_user_content,pages_manage_posts,pages_read_engagement&response_type=code`,
    });

    // Set secure cookie with state
    response.cookies.set("fb_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error("Facebook auth error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Facebook auth" },
      { status: 500 }
    );
  }
}
