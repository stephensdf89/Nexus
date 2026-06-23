import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

interface TikTokMetrics {
  videoCount: number;
  followerCount: number;
  followingCount: number;
}

async function fetchUserMetrics(accessToken: string): Promise<TikTokMetrics> {
  try {
    const response = await fetch(
      `https://open.tiktokapis.com/v1/user/stat/?fields=follower_count,following_count,video_count`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.statusText}`);
    }

    const data = await response.json();
    const stats = data.user_stat;

    return {
      videoCount: stats.video_count || 0,
      followerCount: stats.follower_count || 0,
      followingCount: stats.following_count || 0,
    };
  } catch (error) {
    console.error("Error fetching TikTok metrics:", error);
    throw error;
  }
}

async function fetchVideoMetrics(accessToken: string): Promise<number> {
  try {
    const response = await fetch(
      `https://open.tiktokapis.com/v1/video/list/?fields=id,create_time,view_count,like_count,comment_count,share_count`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    let totalEngagement = 0;

    data.data?.videos?.forEach((video: any) => {
      totalEngagement +=
        (video.like_count || 0) + (video.comment_count || 0) + (video.share_count || 0);
    });

    return totalEngagement;
  } catch (error) {
    console.error("Error fetching TikTok video metrics:", error);
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
           WHERE user_id = $1 AND platform = 'tiktok'`,
          [userId]
        );
      }

      if (!result?.rows?.length && userEmail) {
        result = await pg.query(
          `SELECT access_token FROM integrations 
           WHERE user_email = $1 AND platform = 'tiktok'`,
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
      accessToken = req.cookies.get("tt_access_token")?.value || null;
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "TikTok not connected" },
        { status: 404 }
      );
    }

    const userMetrics = await fetchUserMetrics(accessToken);
    const videoEngagement = await fetchVideoMetrics(accessToken);

    return NextResponse.json({
      success: true,
      metrics: {
        views: Math.floor(userMetrics.followerCount * 50), // Estimate based on followers
        subscribers: userMetrics.followerCount,
        videos: userMetrics.videoCount,
        recent_engagement: videoEngagement,
        impressions: Math.floor(userMetrics.followerCount * 80), // Estimate
        engaged_users: Math.floor(videoEngagement * 0.2), // Estimate
      },
    });
  } catch (error) {
    console.error("Error fetching TikTok analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch TikTok analytics" },
      { status: 500 }
    );
  }
}
