import { NextRequest } from "next/server";
import { requireAccess } from "@/lib/serverAccess";

interface StreamMetrics {
  timestamp: number;
  views: number;
  engagement: number;
  followers: number;
  platforms: Array<{
    platform: string;
    views: number;
    engagement: number;
    followers: number;
  }>;
}

async function fetchPlatformAnalytics(
  platformUrl: string,
  headers: Record<string, string>
): Promise<{ views: number; engagement: number; followers: number } | null> {
  try {
    const res = await fetch(platformUrl, { headers });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success || !data.metrics) return null;

    return {
      views: data.metrics.views || 0,
      engagement: data.metrics.recent_engagement || 0,
      followers: data.metrics.subscribers || 0,
    };
  } catch (err) {
    console.error(`Error fetching analytics:`, err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAccess(req, "pro");
  if ("error" in auth) {
    return new Response(auth.error, { status: auth.status });
  }

  const userId = auth.user.id;
  const userEmail = auth.user.email || "";

  const textEncoder = new TextEncoder();
  let isClosed = false;

  req.signal.addEventListener("abort", () => {
    isClosed = true;
  });

  const readable = new ReadableStream({
    async start(controller) {
      // Send connected event
      controller.enqueue(
        textEncoder.encode("event: connected\ndata: {}\n\n")
      );

      try {
        let isFirstMessage = true;

        // Send metrics periodically
        for (let i = 0; i < 120 && !isClosed; i++) {
          // Wait 30 seconds between sends (120 iterations * 30s = 60 min max)
          if (!isFirstMessage) {
            await new Promise((resolve) => setTimeout(resolve, 30000));
          }
          isFirstMessage = false;

          if (isClosed) break;

          const baseUrl =
            process.env.NEXTAUTH_URL || "https://www.creatornexuspro.com";
          const identityHeaders = {
            "x-user-id": userId,
            "x-user-email": userEmail,
          };

          const platforms = [
            { name: "facebook", url: `${baseUrl}/api/integrations/facebook/analytics` },
            { name: "youtube", url: `${baseUrl}/api/integrations/youtube/analytics` },
            { name: "tiktok", url: `${baseUrl}/api/integrations/tiktok/analytics` },
            { name: "instagram", url: `${baseUrl}/api/integrations/instagram/analytics` },
            { name: "twitter", url: `${baseUrl}/api/integrations/twitter/analytics` },
            { name: "twitch", url: `${baseUrl}/api/integrations/twitch/analytics` },
            { name: "linkedin", url: `${baseUrl}/api/integrations/linkedin/analytics` },
            { name: "pinterest", url: `${baseUrl}/api/integrations/pinterest/analytics` },
          ];

          try {
            // Fetch all platform metrics in parallel
            const results = await Promise.all(
              platforms.map(async (p) => {
                const metrics = await fetchPlatformAnalytics(p.url, identityHeaders);
                return metrics
                  ? {
                      platform: p.name,
                      views: metrics.views,
                      engagement: metrics.engagement,
                      followers: metrics.followers,
                    }
                  : null;
              })
            );

            const connectedPlatforms = results.filter((r) => r !== null);
            const totalViews = connectedPlatforms.reduce((sum, p) => sum + (p?.views || 0), 0);
            const totalEngagement = connectedPlatforms.reduce((sum, p) => sum + (p?.engagement || 0), 0);
            const totalFollowers = connectedPlatforms.reduce((sum, p) => sum + (p?.followers || 0), 0);

            const metrics: StreamMetrics = {
              timestamp: Date.now(),
              views: totalViews,
              engagement: totalEngagement,
              followers: totalFollowers,
              platforms: connectedPlatforms.filter((p) => p !== null) as StreamMetrics["platforms"],
            };

            const message = `event: metrics\ndata: ${JSON.stringify(metrics)}\n\n`;
            controller.enqueue(textEncoder.encode(message));
          } catch (error) {
            console.error("Error fetching metrics:", error);
            const errorMsg = `event: error\ndata: ${JSON.stringify({ error: "Failed to fetch metrics" })}\n\n`;
            controller.enqueue(textEncoder.encode(errorMsg));
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
