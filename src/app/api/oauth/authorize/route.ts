import { NextRequest, NextResponse } from "next/server";

const POSTPULSE_AUTHORIZE_URL = "https://api.postpulse.io/oauth/authorize";

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform");

  if (!platform) {
    return NextResponse.json({ error: "Missing required query parameter: platform" }, { status: 400 });
  }

  const clientId = process.env.POSTPULSE_CLIENT_ID;
  const redirectUri = process.env.POSTPULSE_REDIRECT;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "PostPulse OAuth environment is not configured" },
      { status: 500 }
    );
  }

  const redirect = new URL(POSTPULSE_AUTHORIZE_URL);
  redirect.searchParams.set("client_id", clientId);
  redirect.searchParams.set("platform", platform);
  redirect.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(redirect.toString());
}


