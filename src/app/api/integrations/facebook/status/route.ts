import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pg = await getPgClient();
    const result = await pg.query(
      `SELECT platform_id, page_name, access_token, created_at 
       FROM integrations 
       WHERE user_email = $1 AND platform = 'facebook'
       ORDER BY created_at DESC`,
      [session.user.email]
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
