import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

interface TwitchMetrics {
  followers: number;
  views: number;
  created_at: string;
}

async function fetchChannelMetrics(
  accessToken: string,
  userId: string
): Promise<TwitchMetrics> {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID || "",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitch API error: ${response.statusText}`);
    }

    const data = await response.json();
    const channel = data.data[0];

    return {
      followers: 0, // Will fetch separately
      views: channel.views || 0,
      created_at: channel.created_at,
    };
  } catch (error) {
    console.error("Error fetching Twitch channel metrics:", error);
    throw error;
  }
}

async function fetchFollowers(
  accessToken: string,
  broadcasterId: string
): Promise<number> {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}&first=1`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID || "",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.total || 0;
  } catch (error) {
    console.error("Error fetching Twitch followers:", error);
    return 0;
  }
}

async function fetchStreamMetrics(
  accessToken: string,
  userId: string
): Promise<number> {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${userId}&first=10`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID || "",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.data?.length || 0;
  } catch (error) {
    console.error("Error fetching Twitch stream metrics:", error);
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
           WHERE user_id = $1 AND platform = 'twitch'`,
          [userId]
        );
      }

      if (!result?.rows?.length && userEmail) {
        result = await pg.query(
          `SELECT access_token, platform_id FROM integrations 
           WHERE user_email = $1 AND platform = 'twitch'`,
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
      accessToken = req.cookies.get("tcn_access_token")?.value || null;
    }

    if (!accessToken || !platformId) {
      return NextResponse.json(
        { success: false, error: "Twitch not connected" },
        { status: 404 }
      );
    }

    const channelMetrics = await fetchChannelMetrics(accessToken, platformId);
    const followers = await fetchFollowers(accessToken, platformId);
    const streams = await fetchStreamMetrics(accessToken, platformId);

    return NextResponse.json({
      success: true,
      metrics: {
        views: channelMetrics.views,
        subscribers: followers,
        videos: streams,
        recent_engagement: Math.floor(followers * 0.05), // Estimate
        impressions: Math.floor(channelMetrics.views * 0.3), // Estimate
        engaged_users: Math.floor(followers * 0.1), // Estimate
      },
    });
  } catch (error) {
    console.error("Error fetching Twitch analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Twitch analytics" },
      { status: 500 }
    );
  }
}
