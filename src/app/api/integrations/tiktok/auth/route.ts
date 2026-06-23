import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  createValidationErrorResponse,
  validateRequestBody,
  type ValidationSchema,
} from "@/lib/requestValidation";
import { serverErrorResponse } from "@/lib/apiAuth";

const OAUTH_IDENTITY_SCHEMA: ValidationSchema = {
  uid: { type: "string", required: false, maxLength: 255 },
  email: { type: "string", required: false, maxLength: 255 },
};

function buildTikTokAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_key: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user.info.basic,video.list,user.stat.read",
    state,
  });
  return `https://www.tiktok.com/v1/oauth/authorize?${params.toString()}`;
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
    const userId = req.nextUrl.searchParams.get("uid") || req.headers.get("x-user-id");
    const userEmail = req.nextUrl.searchParams.get("email") || req.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Missing user identity" },
        { status: 401 }
      );
    }

    const clientId = process.env.TIKTOK_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "TikTok OAuth not configured" },
        { status: 500 }
      );
    }

    const redirectUri = getTikTokRedirectUri(req.headers.get("origin") || undefined);
    const state = crypto.randomBytes(32).toString("hex");

    // Store state and user info in secure cookies for callback
    const response = new NextResponse(null, {
      status: 302,
      headers: {
        Location: buildTikTokAuthUrl(clientId, redirectUri, state),
      },
    });

    response.cookies.set("tt_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
    });

    response.cookies.set("tt_user_id", userId || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
    });

    response.cookies.set("tt_user_email", userEmail || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    console.error("Error in TikTok auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate TikTok authentication" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return createValidationErrorResponse(["Invalid JSON in request body"]);
    }

    const validation = validateRequestBody(body, OAUTH_IDENTITY_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const uid = String(validation.data?.uid || "").trim();
    const email = String(validation.data?.email || "").trim();

    if (!uid && !email) {
      return NextResponse.json(
        { error: "Missing user identity" },
        { status: 401 }
      );
    }

    const clientId = process.env.TIKTOK_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "TikTok OAuth not configured" },
        { status: 500 }
      );
    }

    const redirectUri = getTikTokRedirectUri();
    const state = crypto.randomBytes(32).toString("hex");
    const authUrl = buildTikTokAuthUrl(clientId, redirectUri, state);

    return NextResponse.json({
      success: true,
      authUrl,
      state,
    });
  } catch (error) {
    console.error("Error building TikTok auth URL:", error);
    return serverErrorResponse(error);
  }
}
