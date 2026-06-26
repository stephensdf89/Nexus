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
          `DELETE FROM integrations WHERE user_id = $1 AND platform = 'instagram'`,
          [userId]
        );
      } else {
        await pg.query(
          `DELETE FROM integrations WHERE user_email = $1 AND platform = 'instagram'`,
          [userEmail]
        );
      }
    } catch (dbErr) {
      console.error("Database delete failed:", dbErr);
    }

    const response = NextResponse.json({
      success: true,
      message: "Instagram integration removed",
    });

    response.cookies.delete("ig_access_token");

    return response;
  } catch (error) {
    console.error("Error disconnecting Instagram:", error);
    return serverErrorResponse(error);
  }
}


