"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/AuthContext";

export interface PlatformMetrics {
  platform: string;
  views: number;
  engagement: number;
  followers: number;
  trend: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalEngagement: number;
  totalFollowers: number;
  platforms: PlatformMetrics[];
  timeframe: string;
}

export interface DailyMetric {
  date: string;
  views: number;
  engagement: number;
}

export interface PlatformTimeseries {
  platform: string;
  data: DailyMetric[];
}

export const useAnalytics = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const authContext = useUser();
  const user = authContext?.user;

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeseries, setTimeseries] = useState<PlatformTimeseries[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !enabled) {
      setSummary(null);
      setTimeseries(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch summary
        const summaryRes = await fetch("/api/analytics/summary");

        if (!summaryRes.ok) {
          if (summaryRes.status === 403) {
            throw new Error("Pro access required for analytics");
          }
          throw new Error("Failed to fetch analytics summary");
        }

        const summaryData = await summaryRes.json();
        setSummary(summaryData);

        // Fetch timeseries (default 30 days)
        const timeseriesRes = await fetch("/api/analytics/timeseries?days=30");

        if (!timeseriesRes.ok) {
          if (timeseriesRes.status === 403) {
            throw new Error("Pro access required for analytics");
          }
          throw new Error("Failed to fetch analytics timeseries");
        }

        const timeseriesData = await timeseriesRes.json();
        setTimeseries(timeseriesData.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, enabled]);

  return { summary, timeseries, loading, error };
};
