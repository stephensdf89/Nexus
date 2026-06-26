import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Missing user identity headers" },
        { status: 401 }
      );
    }

    // Try database first
    try {
      const pg = await getPgClient();

      // Try user_id first
      if (userId) {
        const result = await pg.query(
          `SELECT platform_id, channel_name, thumbnail_url, token_expires_at FROM integrations 
           WHERE user_id = $1 AND platform = 'youtube'`,
          [userId]
        );

        if (result.rows.length > 0) {
          const row = result.rows[0];
          return NextResponse.json({
            connected: true,
            platform_id: row.platform_id,
            channel_name: row.channel_name,
            thumbnail_url: row.thumbnail_url,
            expires_at: row.token_expires_at,
            source: "database",
          });
        }
      }

      // Try email as fallback
      const emailResult = await pg.query(
        `SELECT platform_id, channel_name, thumbnail_url, token_expires_at FROM integrations 
         WHERE user_email = $1 AND platform = 'youtube'`,
        [userEmail]
      );

      if (emailResult.rows.length > 0) {
        const row = emailResult.rows[0];
        return NextResponse.json({
          connected: true,
          platform_id: row.platform_id,
          channel_name: row.channel_name,
          thumbnail_url: row.thumbnail_url,
          expires_at: row.token_expires_at,
          source: "database",
        });
      }
    } catch (dbErr: any) {
      // Column not found or other error - fall through to cookies
      console.error("Database query failed, checking cookies:", dbErr.message);
    }

    // Fall back to cookies
    const channelId = req.cookies.get("yt_channel_id")?.value;
    const channelName = req.cookies.get("yt_channel_name")?.value;
    const thumbnail = req.cookies.get("yt_thumbnail")?.value;

    if (channelId) {
      return NextResponse.json({
        connected: true,
        platform_id: channelId,
        channel_name: channelName,
        thumbnail_url: thumbnail,
        source: "cookies",
      });
    }

    return NextResponse.json({ connected: false });
  } catch (error) {
    console.error("Error checking YouTube connection status:", error);
    return NextResponse.json(
      { error: "Failed to check YouTube connection status" },
      { status: 500 }
    );
  }
}


