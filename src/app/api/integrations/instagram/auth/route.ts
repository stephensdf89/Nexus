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

function buildInstagramAuthUrl(): string {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = getInstagramRedirectUri();
  const state = crypto.randomBytes(16).toString("hex");

  const scope = "user_profile,user_media";

  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;

  return authUrl;
}

function getInstagramRedirectUri(): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.creatornexuspro.com";

  return `${baseUrl}/api/integrations/instagram/callback`;
}

export async function GET(req: NextRequest) {
  try {
    const authUrl = buildInstagramAuthUrl();
    const state = authUrl.split("state=")[1];

    const userId = req.cookies.get("supabase-auth-token")?.value;
    const userEmail = req.nextUrl.searchParams.get("email");

    const response = NextResponse.json({ authUrl });

    response.cookies.set("ig_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    if (userId) {
      response.cookies.set("ig_user_id", userId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    if (userEmail) {
      response.cookies.set("ig_user_email", userEmail, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error("Error initiating Instagram auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate authentication" },
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
      return NextResponse.json({ error: "Missing user identity" }, { status: 401 });
    }

    const authUrl = buildInstagramAuthUrl();
    const state = authUrl.split("state=")[1];

    const response = NextResponse.json({ authUrl });

    response.cookies.set("ig_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
    });

    if (uid) {
      response.cookies.set("ig_user_id", uid, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    if (email) {
      response.cookies.set("ig_user_email", email, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error("Error initiating Instagram auth:", error);
    return serverErrorResponse(error);
  }
}


