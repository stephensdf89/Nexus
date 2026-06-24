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

  const CACHE_TTL_MS = 60 * 1000;

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
        const cacheKey = `analytics-cache-${user.id}`;
        if (typeof window !== "undefined") {
          const raw = window.sessionStorage.getItem(cacheKey);
          if (raw) {
            try {
              const cached = JSON.parse(raw) as {
                ts: number;
                summary: AnalyticsSummary;
                timeseries: PlatformTimeseries[];
              };

              if (Date.now() - cached.ts < CACHE_TTL_MS) {
                setSummary(cached.summary);
                setTimeseries(cached.timeseries);
                setLoading(false);
                return;
              }
            } catch {
              // Ignore malformed cache and proceed with network fetch.
            }
          }
        }

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

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              ts: Date.now(),
              summary: summaryData,
              timeseries: timeseriesData.data,
            })
          );
        }
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
