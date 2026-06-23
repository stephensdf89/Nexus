import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import { serverErrorResponse } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    const userId = (req.headers.get("x-user-id") || "").trim();
    const userEmail = (req.headers.get("x-user-email") || "").trim();

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Missing user identity headers" },
        { status: 401 }
      );
    }

    try {
      const pg = await getPgClient();

      if (userId) {
        await pg.query(
          `DELETE FROM integrations WHERE user_id = $1 AND platform = 'twitch'`,
          [userId]
        );
      } else {
        await pg.query(
          `DELETE FROM integrations WHERE user_email = $1 AND platform = 'twitch'`,
          [userEmail]
        );
      }
    } catch (dbErr) {
      console.error("Database delete failed:", dbErr);
    }

    const response = NextResponse.json({
      success: true,
      message: "Twitch integration removed",
    });

    response.cookies.delete("tcn_access_token");

    return response;
  } catch (error) {
    console.error("Error disconnecting Twitch:", error);
    return serverErrorResponse(error);
  }
}
