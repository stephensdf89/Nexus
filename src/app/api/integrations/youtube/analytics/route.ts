import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

interface YouTubeMetrics {
  viewCount: number;
  subscribers: number;
  videoCount: number;
  totalEngagement: number; // likes + comments (approximate)
}

async function fetchChannelStats(
  channelId: string,
  accessToken: string
): Promise<YouTubeMetrics> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error("Channel not found");
    }

    const stats = data.items[0].statistics;
    return {
      viewCount: parseInt(stats.viewCount || "0"),
      subscribers: parseInt(stats.subscriberCount || "0"),
      videoCount: parseInt(stats.videoCount || "0"),
      totalEngagement: 0, // Will be calculated from recent videos
    };
  } catch (error) {
    console.error("Error fetching YouTube channel stats:", error);
    throw error;
  }
}

async function fetchRecentVideosEngagement(
  channelId: string,
  accessToken: string
): Promise<number> {
  try {
    // Get recent uploads
    const uploadsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!uploadsResponse.ok) {
      return 0;
    }

    const uploadsData = await uploadsResponse.json();
    const uploadsPlaylistId =
      uploadsData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return 0;
    }

    // Get recent videos
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=10`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!videosResponse.ok) {
      return 0;
    }

    const videosData = await videosResponse.json();
    const videoIds = videosData.items
      ?.map((item: any) => item.contentDetails.videoId)
      .join(",");

    if (!videoIds) {
      return 0;
    }

    // Get stats for these videos
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!statsResponse.ok) {
      return 0;
    }

    const statsData = await statsResponse.json();
    let totalEngagement = 0;

    statsData.items?.forEach((item: any) => {
      const stats = item.statistics;
      totalEngagement +=
        parseInt(stats.likeCount || "0") +
        parseInt(stats.commentCount || "0");
    });

    return totalEngagement;
  } catch (error) {
    console.error("Error fetching recent videos engagement:", error);
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

    let channelId: string | null = null;
    let accessToken: string | null = null;

    // Try database first
    try {
      const pg = await getPgClient();
      let result: any = null;

      if (userId) {
        result = await pg.query(
          `SELECT platform_id, access_token FROM integrations 
           WHERE user_id = $1 AND platform = 'youtube'`,
          [userId]
        );
      }

      if (!result?.rows?.length && userEmail) {
        result = await pg.query(
          `SELECT platform_id, access_token FROM integrations 
           WHERE user_email = $1 AND platform = 'youtube'`,
          [userEmail]
        );
      }

      if (result?.rows?.length > 0) {
        channelId = result.rows[0].platform_id;
        accessToken = result.rows[0].access_token;
      }
    } catch (dbErr) {
      console.error("Database query failed, checking cookies:", dbErr);
    }

    // Fall back to cookies
    if (!channelId) {
      channelId = req.cookies.get("yt_channel_id")?.value || null;
    }
    if (!accessToken) {
      accessToken = req.cookies.get("yt_access_token")?.value || null;
    }

    if (!channelId || !accessToken) {
      return NextResponse.json(
        { success: false, error: "YouTube not connected" },
        { status: 404 }
      );
    }

    // Fetch analytics
    const channelStats = await fetchChannelStats(channelId, accessToken);
    const recentEngagement = await fetchRecentVideosEngagement(
      channelId,
      accessToken
    );

    return NextResponse.json({
      success: true,
      metrics: {
        views: channelStats.viewCount,
        subscribers: channelStats.subscribers,
        videos: channelStats.videoCount,
        recent_engagement: recentEngagement,
        impressions: Math.floor(channelStats.viewCount * 0.7), // Estimate
        engaged_users: Math.floor(recentEngagement * 0.3), // Estimate
      },
    });
  } catch (error) {
    console.error("Error fetching YouTube analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch YouTube analytics" },
      { status: 500 }
    );
  }
}


