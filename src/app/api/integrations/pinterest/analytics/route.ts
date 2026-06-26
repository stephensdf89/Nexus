import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

interface PinterestMetrics {
  followers: number;
  following: number;
  pins: number;
}

async function fetchUserMetrics(
  accessToken: string
): Promise<PinterestMetrics> {
  try {
    const response = await fetch(
      `https://api.pinterest.com/v1/me?access_token=${accessToken}&fields=id,counts`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Pinterest API error: ${response.statusText}`);
    }

    const data = await response.json();
    const counts = data.counts || {};

    return {
      followers: counts.follower_count || 0,
      following: counts.following_count || 0,
      pins: counts.pin_count || 0,
    };
  } catch (error) {
    console.error("Error fetching Pinterest metrics:", error);
    throw error;
  }
}

async function fetchBoardMetrics(
  accessToken: string
): Promise<number> {
  try {
    const response = await fetch(
      `https://api.pinterest.com/v1/me/boards?access_token=${accessToken}&fields=id,name&limit=100`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.data?.length || 0;
  } catch (error) {
    console.error("Error fetching Pinterest board metrics:", error);
    return 0;
  }
}

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

    let accessToken: string | null = null;

    try {
      const pg = await getPgClient();
      let result: any = null;

      if (userId) {
        result = await pg.query(
          `SELECT access_token FROM integrations 
           WHERE user_id = $1 AND platform = 'pinterest'`,
          [userId]
        );
      }

      if (!result?.rows?.length && userEmail) {
        result = await pg.query(
          `SELECT access_token FROM integrations 
           WHERE user_email = $1 AND platform = 'pinterest'`,
          [userEmail]
        );
      }

      if (result?.rows?.length > 0) {
        accessToken = result.rows[0].access_token;
      }
    } catch (dbErr) {
      console.error("Database query failed, checking cookies:", dbErr);
    }

    if (!accessToken) {
      accessToken = req.cookies.get("pn_access_token")?.value || null;
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Pinterest not connected" },
        { status: 404 }
      );
    }

    const userMetrics = await fetchUserMetrics(accessToken);
    const boardCount = await fetchBoardMetrics(accessToken);

    return NextResponse.json({
      success: true,
      metrics: {
        views: Math.floor(userMetrics.followers * 10), // Estimate based on followers
        subscribers: userMetrics.followers,
        videos: userMetrics.pins,
        recent_engagement: Math.floor(userMetrics.pins * 0.2), // Estimate
        impressions: Math.floor(userMetrics.followers * 30), // Estimate
        engaged_users: Math.floor(userMetrics.followers * 0.08), // Estimate
      },
    });
  } catch (error) {
    console.error("Error fetching Pinterest analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Pinterest analytics" },
      { status: 500 }
    );
  }
}


