import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { connected: false, error: "Missing user identity headers" },
        { status: 401 }
      );
    }

    let result: any = null;

    try {
      const pg = await getPgClient();

      if (userId) {
        result = await pg.query(
          `SELECT platform_id, channel_name FROM integrations 
           WHERE user_id = $1 AND platform = 'instagram'`,
          [userId]
        );
      }

      if (!result?.rows?.length && userEmail) {
        result = await pg.query(
          `SELECT platform_id, channel_name FROM integrations 
           WHERE user_email = $1 AND platform = 'instagram'`,
          [userEmail]
        );
      }
    } catch (dbErr) {
      console.error("Database query failed, checking cookies:", dbErr);
    }

    if (result?.rows?.length > 0) {
      const row = result.rows[0];
      return NextResponse.json({
        connected: true,
        platform_id: row.platform_id,
        channel_name: row.channel_name,
      });
    }

    return NextResponse.json({ connected: false });
  } catch (error) {
    console.error("Error checking Instagram status:", error);
    return NextResponse.json(
      { connected: false, error: "Failed to check status" },
      { status: 500 }
    );
  }
}
