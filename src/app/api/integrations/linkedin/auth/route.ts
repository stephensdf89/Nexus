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

function buildLinkedInAuthUrl(): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = getLinkedInRedirectUri();
  const state = crypto.randomBytes(16).toString("hex");

  const scope = encodeURIComponent("r_basicprofile r_emailaddress w_member_social");

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

  return authUrl;
}

function getLinkedInRedirectUri(): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.creatornexuspro.com";

  return `${baseUrl}/api/integrations/linkedin/callback`;
}

export async function GET(req: NextRequest) {
  try {
    const authUrl = buildLinkedInAuthUrl();
    const state = authUrl.split("state=")[1];

    const userId = req.cookies.get("supabase-auth-token")?.value;
    const userEmail = req.nextUrl.searchParams.get("email");

    const response = NextResponse.json({ authUrl });

    response.cookies.set("li_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    if (userId) {
      response.cookies.set("li_user_id", userId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    if (userEmail) {
      response.cookies.set("li_user_email", userEmail, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error("Error initiating LinkedIn auth:", error);
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

    const authUrl = buildLinkedInAuthUrl();
    const state = authUrl.split("state=")[1];

    const response = NextResponse.json({ authUrl });

    response.cookies.set("li_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
    });

    if (uid) {
      response.cookies.set("li_user_id", uid, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    if (email) {
      response.cookies.set("li_user_email", email, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error("Error initiating LinkedIn auth:", error);
    return serverErrorResponse(error);
  }
}


