import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import {
  createValidationErrorResponse,
  validateRequestBody,
  type ValidationSchema,
} from "@/lib/requestValidation";
import { serverErrorResponse } from "@/lib/apiAuth";

const FACEBOOK_DISCONNECT_SCHEMA: ValidationSchema = {
  platformId: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 255,
  },
};

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const headerEmail = (req.headers.get("x-user-email") || "").trim() || undefined;
    const headerUserId = (req.headers.get("x-user-id") || "").trim() || undefined;
    const email = headerEmail;

    if (!email && !headerUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return createValidationErrorResponse(["Invalid JSON in request body"]);
    }

    const validation = validateRequestBody(body, FACEBOOK_DISCONNECT_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const platformId = String(validation.data?.platformId || "").trim();

    if (!platformId) {
      return NextResponse.json({ error: "Missing platformId" }, { status: 400 });
    }

    // Delete the integration from database
    const pg = await getPgClient();
    let userId = headerUserId;

    if (!isUuid(userId)) {
      if (!email) {
        return NextResponse.json({ error: "Missing user identity" }, { status: 400 });
      }

      const userLookup = await pg.query(
        "SELECT id FROM auth.users WHERE email = $1 LIMIT 1",
        [email]
      );
      userId = userLookup.rows[0]?.id;
    }

    if (!isUuid(userId)) {
      return NextResponse.json({ error: "Missing user id in session" }, { status: 400 });
    }

    try {
      await pg.query(
        `DELETE FROM integrations
         WHERE user_id = $1 AND platform = 'facebook' AND platform_id = $2`,
        [userId, platformId]
      );
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "42703") {
        throw error;
      }

      await pg.query(
        `DELETE FROM integrations
         WHERE user_email = $1 AND platform = 'facebook' AND platform_id = $2`,
        [email, platformId]
      );
    }

    const response = NextResponse.json({ success: true });
    const secure = process.env.NODE_ENV === "production";
    response.cookies.set("fb_platform_id", "", { httpOnly: true, secure, sameSite: "lax", maxAge: 0 });
    response.cookies.set("fb_page_name", "", { httpOnly: true, secure, sameSite: "lax", maxAge: 0 });
    response.cookies.set("fb_access_token", "", { httpOnly: true, secure, sameSite: "lax", maxAge: 0 });
    response.cookies.set("fb_page_access_token", "", { httpOnly: true, secure, sameSite: "lax", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Error disconnecting Facebook:", error);
    return serverErrorResponse(error);
  }
}


