"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import AccessLevelGate from "@/components/AccessLevelGate";
import RealtimeAnalyticsWidget from "@/components/RealtimeAnalyticsWidget";
import AdvancedAnalyticsDashboard from "@/components/AdvancedAnalyticsDashboard";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  ViewsOverTimeChart,
  EngagementOverTimeChart,
  PlatformBreakdownChart,
} from "@/components/AnalyticsCharts";

export default function AnalyticsPage() {
  const { summary, timeseries, loading, error } = useAnalytics();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400 text-sm">Loading analytics...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 text-sm mb-2">Error loading analytics</p>
            <p className="text-gray-400 text-xs">{error}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const engagementRate = summary
    ? ((summary.totalEngagement / summary.totalViews) * 100).toFixed(1)
    : "0";

  return (
    <AppShell>
      <AccessLevelGate
        minimum="pro"
        blockedTitle="Analytics requires Pro access"
        blockedDescription="Ask the account owner to upgrade your member access from the dashboard."
      >
      <section className="space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-cyan-100">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time performance metrics across all platforms
          </p>
        </div>

        {/* REAL-TIME ANALYTICS WIDGET */}
        <RealtimeAnalyticsWidget />

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
            <p className="text-sm text-cyan-100/75">Total Views</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">
              {summary ? formatNumber(summary.totalViews) : "0"}
            </p>
            <p className="text-xs text-cyan-300/70 mt-2">+14% vs last period</p>
          </article>

          <article className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
            <p className="text-sm text-cyan-100/75">Engagement Rate</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">
              {engagementRate}%
            </p>
            <p className="text-xs text-cyan-300/70 mt-2">+2% vs last period</p>
          </article>

          <article className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
            <p className="text-sm text-cyan-100/75">Total Followers</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">
              {summary ? formatNumber(summary.totalFollowers) : "0"}
            </p>
            <p className="text-xs text-cyan-300/70 mt-2">+8% vs last period</p>
          </article>
        </div>

        {/* TIMEFRAME SELECTOR */}
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedTimeframe(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTimeframe === period
                  ? "bg-cyan-500/30 border border-cyan-400 text-cyan-100"
                  : "bg-slate-900/50 border border-cyan-400/20 text-gray-400 hover:border-cyan-400/40"
              }`}
            >
              {period === "7d" ? "Last 7 days" : period === "30d" ? "Last 30 days" : "Last 90 days"}
            </button>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Views Over Time */}
          <article className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4">
              Views Over Time
            </h2>
            {timeseries ? (
              <ViewsOverTimeChart timeseries={timeseries} />
            ) : (
              <div className="text-gray-500 text-sm py-8 text-center">
                No data available
              </div>
            )}
          </article>

          {/* Engagement Over Time */}
          <article className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4">
              Engagement Over Time
            </h2>
            {timeseries ? (
              <EngagementOverTimeChart timeseries={timeseries} />
            ) : (
              <div className="text-gray-500 text-sm py-8 text-center">
                No data available
              </div>
            )}
          </article>

          {/* Platform Breakdown */}
          <article className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10 lg:col-span-2">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4">
              Platform Breakdown
            </h2>
            {summary ? (
              <div className="grid gap-8 lg:grid-cols-2">
                <PlatformBreakdownChart platforms={summary.platforms} />
                <div className="space-y-3">
                  {summary.platforms.map((platform) => (
                    <div
                      key={platform.platform}
                      className="bg-slate-950/50 border border-cyan-400/20 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-cyan-100">
                          {platform.platform}
                        </span>
                        <span className="text-xs text-cyan-300/70">
                          {platform.trend > 0 ? "+" : ""}
                          {platform.trend}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Views: {formatNumber(platform.views)}</p>
                        <p>Engagement: {formatNumber(platform.engagement)}</p>
                        <p>Followers: {formatNumber(platform.followers)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-8 text-center">
                No data available
              </div>
            )}
          </article>
        </div>

        {/* ADVANCED ANALYTICS DASHBOARD */}
        <article className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
          <h2 className="text-lg font-semibold text-cyan-100 mb-4">
            Advanced Analytics
          </h2>
          <AdvancedAnalyticsDashboard />
        </article>
      </section>
      </AccessLevelGate>
    </AppShell>
  );
}