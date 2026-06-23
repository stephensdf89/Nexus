import { NextRequest, NextResponse } from "next/server";

interface PlatformMetrics {
  platform: string;
  views: number;
  engagement: number;
  followers: number;
  trend: number; // percentage change
}

interface AnalyticsSummary {
  totalViews: number;
  totalEngagement: number;
  totalFollowers: number;
  platforms: PlatformMetrics[];
  timeframe: string;
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

    // Fetch Facebook analytics if connected
    let facebookMetrics: PlatformMetrics | null = null;
    try {
      const fbAnalyticsRes = await fetch(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/api/integrations/facebook/analytics`,
        {
          headers: {
            "x-user-id": userId || "",
            "x-user-email": userEmail || "",
          },
        }
      );

      if (fbAnalyticsRes.ok) {
        const fbData = await fbAnalyticsRes.json();
        if (fbData.success && fbData.metrics) {
          facebookMetrics = {
            platform: "Facebook",
            views: fbData.metrics.impressions || 0,
            engagement: fbData.metrics.engaged_users || 0,
            followers: fbData.metrics.fan_count || 0,
            trend: 12, // placeholder
          };
        }
      }
    } catch (err) {
      console.error("Error fetching Facebook analytics:", err);
    }

    // Fetch YouTube analytics if connected
    let youtubeMetrics: PlatformMetrics | null = null;
    try {
      const ytAnalyticsRes = await fetch(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/api/integrations/youtube/analytics`,
        {
          headers: {
            "x-user-id": userId || "",
            "x-user-email": userEmail || "",
          },
        }
      );

      if (ytAnalyticsRes.ok) {
        const ytData = await ytAnalyticsRes.json();
        if (ytData.success && ytData.metrics) {
          youtubeMetrics = {
            platform: "YouTube",
            views: ytData.metrics.views || 0,
            engagement: ytData.metrics.recent_engagement || 0,
            followers: ytData.metrics.subscribers || 0,
            trend: 18, // placeholder
          };
        }
      }
    } catch (err) {
      console.error("Error fetching YouTube analytics:", err);
    }

    // Mock data for other platforms (for now, these are placeholders)
    const mockPlatforms: PlatformMetrics[] = [
      {
        platform: "YouTube",
        views: 24500,
        engagement: 1840,
        followers: 12400,
        trend: 14,
      },
      {
        platform: "TikTok",
        views: 18900,
        engagement: 2340,
        followers: 8900,
        trend: 22,
      },
      {
        platform: "Instagram",
        views: 8400,
        engagement: 890,
        followers: 5600,
        trend: 8,
      },
    ];

    // Combine platforms
    const allPlatforms = [
      ...(facebookMetrics ? [facebookMetrics] : []),
      ...(youtubeMetrics ? [youtubeMetrics] : []),
      ...mockPlatforms,
    ];

    // Calculate totals
    const totalViews = allPlatforms.reduce((sum, p) => sum + p.views, 0);
    const totalEngagement = allPlatforms.reduce((sum, p) => sum + p.engagement, 0);
    const totalFollowers = allPlatforms.reduce((sum, p) => sum + p.followers, 0);

    const summary: AnalyticsSummary = {
      totalViews,
      totalEngagement,
      totalFollowers,
      platforms: allPlatforms,
      timeframe: "last_30_days",
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error in analytics summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics summary" },
      { status: 500 }
    );
  }
}
