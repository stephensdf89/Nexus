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

    // Fetch TikTok analytics if connected
    let tiktokMetrics: PlatformMetrics | null = null;
    try {
      const ttAnalyticsRes = await fetch(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/api/integrations/tiktok/analytics`,
        {
          headers: {
            "x-user-id": userId || "",
            "x-user-email": userEmail || "",
          },
        }
      );

      if (ttAnalyticsRes.ok) {
        const ttData = await ttAnalyticsRes.json();
        if (ttData.success && ttData.metrics) {
          tiktokMetrics = {
            platform: "TikTok",
            views: ttData.metrics.views || 0,
            engagement: ttData.metrics.recent_engagement || 0,
            followers: ttData.metrics.subscribers || 0,
            trend: 22, // placeholder
          };
        }
      }
    } catch (err) {
      console.error("Error fetching TikTok analytics:", err);
    }

    // Fetch Instagram analytics if connected
    let instagramMetrics: PlatformMetrics | null = null;
    try {
      const igAnalyticsRes = await fetch(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/api/integrations/instagram/analytics`,
        {
          headers: {
            "x-user-id": userId || "",
            "x-user-email": userEmail || "",
          },
        }
      );

      if (igAnalyticsRes.ok) {
        const igData = await igAnalyticsRes.json();
        if (igData.success && igData.metrics) {
          instagramMetrics = {
            platform: "Instagram",
            views: igData.metrics.views || 0,
            engagement: igData.metrics.recent_engagement || 0,
            followers: igData.metrics.subscribers || 0,
            trend: 15, // placeholder
          };
        }
      }
    } catch (err) {
      console.error("Error fetching Instagram analytics:", err);
    }

    // Fetch Twitter analytics if connected
    let twitterMetrics: PlatformMetrics | null = null;
    try {
      const twAnalyticsRes = await fetch(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/api/integrations/twitter/analytics`,
        {
          headers: {
            "x-user-id": userId || "",
            "x-user-email": userEmail || "",
          },
        }
      );

      if (twAnalyticsRes.ok) {
        const twData = await twAnalyticsRes.json();
        if (twData.success && twData.metrics) {
          twitterMetrics = {
            platform: "Twitter",
            views: twData.metrics.views || 0,
            engagement: twData.metrics.recent_engagement || 0,
            followers: twData.metrics.subscribers || 0,
            trend: 12, // placeholder
          };
        }
      }
    } catch (err) {
      console.error("Error fetching Twitter analytics:", err);
    }

    // Fetch Twitch analytics if connected
    let twitchMetrics: PlatformMetrics | null = null;
    try {
      const tcnAnalyticsRes = await fetch(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/api/integrations/twitch/analytics`,
        {
          headers: {
            "x-user-id": userId || "",
            "x-user-email": userEmail || "",
          },
        }
      );

      if (tcnAnalyticsRes.ok) {
        const tcnData = await tcnAnalyticsRes.json();
        if (tcnData.success && tcnData.metrics) {
          twitchMetrics = {
            platform: "Twitch",
            views: tcnData.metrics.views || 0,
            engagement: tcnData.metrics.recent_engagement || 0,
            followers: tcnData.metrics.subscribers || 0,
            trend: 28, // placeholder
          };
        }
      }
    } catch (err) {
      console.error("Error fetching Twitch analytics:", err);
    }

    // Fetch LinkedIn analytics if connected
    let linkedinMetrics: PlatformMetrics | null = null;
    try {
      const liAnalyticsRes = await fetch(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/api/integrations/linkedin/analytics`,
        {
          headers: {
            "x-user-id": userId || "",
            "x-user-email": userEmail || "",
          },
        }
      );

      if (liAnalyticsRes.ok) {
        const liData = await liAnalyticsRes.json();
        if (liData.success && liData.metrics) {
          linkedinMetrics = {
            platform: "LinkedIn",
            views: liData.metrics.views || 0,
            engagement: liData.metrics.recent_engagement || 0,
            followers: liData.metrics.subscribers || 0,
            trend: 8, // placeholder
          };
        }
      }
    } catch (err) {
      console.error("Error fetching LinkedIn analytics:", err);
    }

    // Fetch Pinterest analytics if connected
    let pinterestMetrics: PlatformMetrics | null = null;
    try {
      const pnAnalyticsRes = await fetch(
        `${process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com"}/api/integrations/pinterest/analytics`,
        {
          headers: {
            "x-user-id": userId || "",
            "x-user-email": userEmail || "",
          },
        }
      );

      if (pnAnalyticsRes.ok) {
        const pnData = await pnAnalyticsRes.json();
        if (pnData.success && pnData.metrics) {
          pinterestMetrics = {
            platform: "Pinterest",
            views: pnData.metrics.views || 0,
            engagement: pnData.metrics.recent_engagement || 0,
            followers: pnData.metrics.subscribers || 0,
            trend: 19, // placeholder
          };
        }
      }
    } catch (err) {
      console.error("Error fetching Pinterest analytics:", err);
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
      ...(tiktokMetrics ? [tiktokMetrics] : []),
      ...(instagramMetrics ? [instagramMetrics] : []),
      ...(twitterMetrics ? [twitterMetrics] : []),
      ...(twitchMetrics ? [twitchMetrics] : []),
      ...(linkedinMetrics ? [linkedinMetrics] : []),
      ...(pinterestMetrics ? [pinterestMetrics] : []),
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
