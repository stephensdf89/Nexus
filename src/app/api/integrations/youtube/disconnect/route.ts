import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Missing user identity headers" },
        { status: 401 }
      );
    }

    // Try to delete from database
    try {
      const pg = await getPgClient();

      if (userId) {
        await pg.query(
          `DELETE FROM integrations WHERE user_id = $1 AND platform = 'youtube'`,
          [userId]
        );
      } else {
        await pg.query(
          `DELETE FROM integrations WHERE user_email = $1 AND platform = 'youtube'`,
          [userEmail]
        );
      }
    } catch (dbErr) {
      console.error("Database delete failed:", dbErr);
    }

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: "YouTube integration removed",
    });

    response.cookies.delete("yt_channel_id");
    response.cookies.delete("yt_channel_name");
    response.cookies.delete("yt_thumbnail");
    response.cookies.delete("yt_access_token");
    response.cookies.delete("yt_refresh_token");

    return response;
  } catch (error) {
    console.error("Error disconnecting YouTube:", error);
    return NextResponse.json(
      { error: "Failed to disconnect YouTube" },
      { status: 500 }
    );
  }
}
