import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

interface InstagramMetrics {
  followers: number;
  following: number;
  media_count: number;
  engagement: number;
}

async function fetchUserMetrics(
  accessToken: string,
  instagramUserId: string
): Promise<InstagramMetrics> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${instagramUserId}?fields=followers_count,follows_count,media_count&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      followers: data.followers_count || 0,
      following: data.follows_count || 0,
      media_count: data.media_count || 0,
      engagement: 0, // Will be calculated from media metrics
    };
  } catch (error) {
    console.error("Error fetching Instagram metrics:", error);
    throw error;
  }
}

async function fetchMediaEngagement(
  accessToken: string,
  instagramUserId: string
): Promise<number> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${instagramUserId}/media?fields=like_count,comments_count&access_token=${accessToken}`
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    let totalEngagement = 0;

    data.data?.forEach((media: any) => {
      totalEngagement +=
        (media.like_count || 0) + (media.comments_count || 0);
    });

    return totalEngagement;
  } catch (error) {
    console.error("Error fetching Instagram media engagement:", error);
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
    let platformId: string | null = null;

    try {
      const pg = await getPgClient();
      let result: any = null;

      if (userId) {
        result = await pg.query(
          `SELECT access_token, platform_id FROM integrations 
           WHERE user_id = $1 AND platform = 'instagram'`,
          [userId]
        );
      }

      if (!result?.rows?.length && userEmail) {
        result = await pg.query(
          `SELECT access_token, platform_id FROM integrations 
           WHERE user_email = $1 AND platform = 'instagram'`,
          [userEmail]
        );
      }

      if (result?.rows?.length > 0) {
        accessToken = result.rows[0].access_token;
        platformId = result.rows[0].platform_id;
      }
    } catch (dbErr) {
      console.error("Database query failed, checking cookies:", dbErr);
    }

    if (!accessToken) {
      accessToken = req.cookies.get("ig_access_token")?.value || null;
    }

    if (!accessToken || !platformId) {
      return NextResponse.json(
        { success: false, error: "Instagram not connected" },
        { status: 404 }
      );
    }

    const userMetrics = await fetchUserMetrics(accessToken, platformId);
    const mediaEngagement = await fetchMediaEngagement(accessToken, platformId);

    return NextResponse.json({
      success: true,
      metrics: {
        views: Math.floor(userMetrics.followers * 15), // Estimate based on followers
        subscribers: userMetrics.followers,
        videos: userMetrics.media_count,
        recent_engagement: mediaEngagement,
        impressions: Math.floor(userMetrics.followers * 40), // Estimate
        engaged_users: Math.floor(mediaEngagement * 0.15), // Estimate
      },
    });
  } catch (error) {
    console.error("Error fetching Instagram analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Instagram analytics" },
      { status: 500 }
    );
  }
}


