import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const headerEmail = req.headers.get("x-user-email") || undefined;
    const headerUserId = req.headers.get("x-user-id") || undefined;
    const email = session?.user?.email || headerEmail;

    if (!email && !headerUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pg = await getPgClient();
    let userId = (session?.user as { id?: string } | undefined)?.id || headerUserId;

    if (!isUuid(userId)) {
      const userLookup = await pg.query(
        "SELECT id FROM auth.users WHERE email = $1 LIMIT 1",
        [email]
      );
      userId = userLookup.rows[0]?.id;
    }

    if (!isUuid(userId)) {
      return NextResponse.json({
        connected: false,
        pages: [],
        status: "Not Connected",
      });
    }

    let result;
    try {
      result = await pg.query(
        `SELECT platform_id, page_name, access_token, created_at
         FROM integrations
         WHERE user_id = $1 AND platform = 'facebook'
         ORDER BY created_at DESC`,
        [userId]
      );
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "42703") {
        throw error;
      }

      result = await pg.query(
        `SELECT platform_id, page_name, access_token, created_at
         FROM integrations
         WHERE user_email = $1 AND platform = 'facebook'
         ORDER BY created_at DESC`,
        [email]
      );
    }

    return NextResponse.json({
      connected: result.rows.length > 0,
      pages: result.rows,
      status: result.rows.length > 0 ? "Connected" : "Not Connected",
    });
  } catch (error) {
    console.error("Error fetching Facebook integration:", error);
    return NextResponse.json(
      { error: "Failed to fetch integration status" },
      { status: 500 }
    );
  }
}
