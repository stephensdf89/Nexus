import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

interface TwitterMetrics {
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

async function fetchUserMetrics(
  accessToken: string
): Promise<TwitterMetrics["public_metrics"]> {
  try {
    const response = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=public_metrics",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.public_metrics;
  } catch (error) {
    console.error("Error fetching Twitter metrics:", error);
    throw error;
  }
}

async function fetchRecentTweets(accessToken: string): Promise<number> {
  try {
    const response = await fetch(
      "https://api.twitter.com/2/users/me/tweets?max_results=100&tweet.fields=public_metrics",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    let totalEngagement = 0;

    data.data?.forEach((tweet: any) => {
      totalEngagement +=
        (tweet.public_metrics.like_count || 0) +
        (tweet.public_metrics.retweet_count || 0) +
        (tweet.public_metrics.reply_count || 0);
    });

    return totalEngagement;
  } catch (error) {
    console.error("Error fetching Twitter engagement metrics:", error);
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
           WHERE user_id = $1 AND platform = 'twitter'`,
          [userId]
        );
      }

      if (!result?.rows?.length && userEmail) {
        result = await pg.query(
          `SELECT access_token FROM integrations 
           WHERE user_email = $1 AND platform = 'twitter'`,
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
      accessToken = req.cookies.get("tw_access_token")?.value || null;
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Twitter not connected" },
        { status: 404 }
      );
    }

    const userMetrics = await fetchUserMetrics(accessToken);
    const tweetEngagement = await fetchRecentTweets(accessToken);

    return NextResponse.json({
      success: true,
      metrics: {
        views: Math.floor(userMetrics.followers_count * 8), // Estimate based on followers
        subscribers: userMetrics.followers_count,
        videos: userMetrics.tweet_count,
        recent_engagement: tweetEngagement,
        impressions: Math.floor(userMetrics.followers_count * 25), // Estimate
        engaged_users: Math.floor(tweetEngagement * 0.1), // Estimate
      },
    });
  } catch (error) {
    console.error("Error fetching Twitter analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Twitter analytics" },
      { status: 500 }
    );
  }
}


