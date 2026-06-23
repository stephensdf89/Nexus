import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pg = await getPgClient();
    let userId = (session.user as { id?: string }).id;

    if (!isUuid(userId)) {
      const userLookup = await pg.query(
        "SELECT id FROM auth.users WHERE email = $1 LIMIT 1",
        [session.user.email]
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

    const result = await pg.query(
      `SELECT platform_id, page_name, access_token, created_at 
       FROM integrations 
       WHERE user_id = $1 AND platform = 'facebook'
       ORDER BY created_at DESC`,
      [userId]
    );

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
