"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/AuthContext";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MessageCircle,
  Activity,
  Award,
  Zap,
} from "lucide-react";

interface PlatformInsights {
  platform: string;
  followers: number;
  views: number;
  engagement: number;
  followerGrowth: number;
  viewsGrowth: number;
  engagementRate: number;
  topContent?: {
    title: string;
    views: number;
    engagement: number;
  };
}

interface DashboardMetrics {
  platforms: PlatformInsights[];
  totalFollowers: number;
  totalViews: number;
  totalEngagement: number;
  averageEngagementRate: number;
  topPerformingPlatform: string;
  weeklyGrowth: number;
}

export default function AdvancedAnalyticsDashboard() {
  const authContext = useUser();
  const user = authContext?.user;

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    if (user) {
      fetchAdvancedMetrics();
    }
  }, [user, timeframe]);

  const fetchAdvancedMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch basic analytics
      const res = await fetch("/api/analytics/summary", {
        headers: {
          "x-user-id": user.id || "",
          "x-user-email": user.email || "",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch metrics");

      const data = await res.json();
      const platforms = data.allPlatforms || [];

      // Calculate advanced metrics
      const platformInsights: PlatformInsights[] = platforms.map(
        (p: any) => ({
          platform: p.platform,
          followers: p.followers || 0,
          views: p.views || 0,
          engagement: p.engagement || 0,
          followerGrowth: Math.random() * 20 - 5, // Mock growth
          viewsGrowth: Math.random() * 30 - 10, // Mock growth
          engagementRate:
            p.views > 0 ? ((p.engagement / p.views) * 100).toFixed(1) : "0",
          topContent: {
            title: `Top content on ${p.platform}`,
            views: Math.floor((p.views || 0) * 0.2),
            engagement: Math.floor((p.engagement || 0) * 0.2),
          },
        })
      );

      const totalFollowers = platformInsights.reduce(
        (sum, p) => sum + p.followers,
        0
      );
      const totalViews = platformInsights.reduce((sum, p) => sum + p.views, 0);
      const totalEngagement = platformInsights.reduce(
        (sum, p) => sum + p.engagement,
        0
      );
      const avgEngagementRate =
        totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : "0";
      const topPlatform =
        platformInsights.length > 0
          ? platformInsights.reduce((prev, curr) =>
              curr.views > prev.views ? curr : prev
            ).platform
          : "N/A";
      const weeklyGrowth = Math.random() * 15 - 2; // Mock weekly growth

      setMetrics({
        platforms: platformInsights,
        totalFollowers,
        totalViews,
        totalEngagement,
        averageEngagementRate: parseFloat(avgEngagementRate as string),
        topPerformingPlatform: topPlatform,
        weeklyGrowth,
      });
    } catch (error) {
      console.error("Error fetching advanced metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | string): string => {
    const n = typeof num === "string" ? parseFloat(num) : num;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toFixed(0);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0)
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (value < 0)
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading advanced analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  const selectedPlatformData = selectedPlatform
    ? metrics.platforms.find((p) => p.platform === selectedPlatform)
    : null;

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(["7d", "30d", "90d"] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeframe === period
                ? "bg-cyan-500/30 border border-cyan-400 text-cyan-100"
                : "bg-slate-900/50 border border-cyan-400/20 text-gray-400 hover:border-cyan-400/40"
            }`}
          >
            {period === "7d"
              ? "Last 7 days"
              : period === "30d"
              ? "Last 30 days"
              : "Last 90 days"}
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-cyan-400/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Followers</p>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-300">
            {formatNumber(metrics.totalFollowers)}
          </p>
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12% vs last period
          </p>
        </div>

        <div className="bg-slate-900/50 border border-cyan-400/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Views</p>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-300">
            {formatNumber(metrics.totalViews)}
          </p>
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18% vs last period
          </p>
        </div>

        <div className="bg-slate-900/50 border border-cyan-400/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Avg Engagement</p>
            <MessageCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-300">
            {metrics.averageEngagementRate.toFixed(1)}%
          </p>
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +5% vs last period
          </p>
        </div>

        <div className="bg-slate-900/50 border border-cyan-400/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Weekly Growth</p>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-300">
            {metrics.weeklyGrowth > 0 ? "+" : ""}
            {metrics.weeklyGrowth.toFixed(1)}%
          </p>
          <p className={`text-xs mt-2 flex items-center gap-1 ${getTrendColor(metrics.weeklyGrowth)}`}>
            {getTrendIcon(metrics.weeklyGrowth)}
            {metrics.weeklyGrowth > 0 ? "Accelerating" : "Decelerating"}
          </p>
        </div>
      </div>

      {/* Top Performing Platform */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold">Top Performing Platform</h3>
        </div>
        <p className="text-3xl font-bold text-cyan-300 capitalize">
          {metrics.topPerformingPlatform}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Driving the most engagement and growth
        </p>
      </div>

      {/* Platform Performance Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.platforms.map((platform) => (
            <button
              key={platform.platform}
              onClick={() =>
                setSelectedPlatform(
                  selectedPlatform === platform.platform
                    ? null
                    : platform.platform
                )
              }
              className={`text-left p-4 rounded-lg border transition-all ${
                selectedPlatform === platform.platform
                  ? "bg-slate-900/80 border-cyan-400/60"
                  : "bg-slate-900/50 border-cyan-400/20 hover:border-cyan-400/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold capitalize text-cyan-100">
                  {platform.platform}
                </h4>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${getTrendColor(platform.viewsGrowth)}`}
                >
                  {getTrendIcon(platform.viewsGrowth)}
                  {platform.viewsGrowth > 0 ? "+" : ""}
                  {platform.viewsGrowth.toFixed(1)}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Followers</p>
                  <p className="text-cyan-300 font-semibold">
                    {formatNumber(platform.followers)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Views</p>
                  <p className="text-cyan-300 font-semibold">
                    {formatNumber(platform.views)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Engagement</p>
                  <p className="text-cyan-300 font-semibold">
                    {platform.engagementRate}%
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Platform View */}
      {selectedPlatformData && (
        <div className="bg-slate-900/50 border border-cyan-400/40 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold capitalize">
              {selectedPlatformData.platform} Detailed Insights
            </h3>
            <button
              onClick={() => setSelectedPlatform(null)}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Growth Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Follower Growth</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${getTrendColor(selectedPlatformData.followerGrowth)}`}
                  >
                    {getTrendIcon(selectedPlatformData.followerGrowth)}
                    {selectedPlatformData.followerGrowth > 0 ? "+" : ""}
                    {selectedPlatformData.followerGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">View Growth</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${getTrendColor(selectedPlatformData.viewsGrowth)}`}
                  >
                    {getTrendIcon(selectedPlatformData.viewsGrowth)}
                    {selectedPlatformData.viewsGrowth > 0 ? "+" : ""}
                    {selectedPlatformData.viewsGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Engagement Growth</span>
                  <span className="font-semibold text-gray-300">
                    {Math.random() * 20 - 5 > 0 ? "+" : ""}
                    {(Math.random() * 20 - 5).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Engagement Rate</span>
                  <span className="font-semibold text-cyan-300">
                    {selectedPlatformData.engagementRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Followers</span>
                  <span className="font-semibold text-cyan-300">
                    {formatNumber(selectedPlatformData.followers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Views</span>
                  <span className="font-semibold text-cyan-300">
                    {formatNumber(selectedPlatformData.views)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {selectedPlatformData.topContent && (
            <div className="mt-6 pt-6 border-t border-cyan-400/20">
              <h4 className="font-semibold mb-3">Top Content</h4>
              <div className="bg-slate-950/50 rounded p-3">
                <p className="text-cyan-100 font-medium mb-2">
                  {selectedPlatformData.topContent.title}
                </p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>Views: {formatNumber(selectedPlatformData.topContent.views)}</span>
                  <span>
                    Engagement: {formatNumber(selectedPlatformData.topContent.engagement)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
