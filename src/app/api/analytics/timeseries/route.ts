import { NextRequest, NextResponse } from "next/server";
import { requireAccess } from "@/lib/serverAccess";

interface DailyMetric {
  date: string;
  views: number;
  engagement: number;
}

interface PlatformTimeseries {
  platform: string;
  data: DailyMetric[];
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAccess(req, "pro");
    const days = req.nextUrl.searchParams.get("days") || "30";

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Generate mock time series data for the last N days
    const daysNum = parseInt(days);
    const data: DailyMetric[] = [];
    const today = new Date();

    for (let i = daysNum - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Generate realistic-looking data with some variance
      const baseViews = 500 + Math.random() * 300;
      const variance = Math.sin(i / 5) * 200;
      const views = Math.floor(baseViews + variance + Math.random() * 100);

      data.push({
        date: dateStr,
        views: Math.max(0, views),
        engagement: Math.floor(views * (0.08 + Math.random() * 0.04)),
      });
    }

    const timeseries: PlatformTimeseries[] = [
      {
        platform: "YouTube",
        data: data.map((d) => ({
          ...d,
          views: Math.floor(d.views * 3.2),
          engagement: Math.floor(d.engagement * 2.2),
        })),
      },
      {
        platform: "TikTok",
        data: data.map((d) => ({
          ...d,
          views: Math.floor(d.views * 2.5),
          engagement: Math.floor(d.engagement * 2.8),
        })),
      },
      {
        platform: "Instagram",
        data: data.map((d) => ({
          ...d,
          views: Math.floor(d.views * 1.4),
          engagement: Math.floor(d.engagement * 1.1),
        })),
      },
    ];

    return NextResponse.json({
      data: timeseries,
      timeframe: `last_${days}_days`,
    });
  } catch (error) {
    console.error("Error in analytics timeseries:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics timeseries" },
      { status: 500 }
    );
  }
}


