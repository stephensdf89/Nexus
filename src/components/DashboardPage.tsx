"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ViewsOverTimeChart, PlatformBreakdownChart } from "@/components/AnalyticsCharts";
import { useSettingsStore } from "@/lib/settingsStore";
import ConnectPlatforms from "@/app/dashboard/components/ConnectPlatforms";
import PlatformStatus from "@/app/dashboard/components/PlatformStatus";
import PostForm from "@/app/dashboard/components/PostForm";
import ScheduledPosts from "@/app/dashboard/components/ScheduledPosts";

const CreatorToolsPanel = dynamic(() => import("@/components/CreatorToolsPanel"), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-400">Loading tools...</p>,
});

const NotificationsPreview = dynamic(() => import("@/components/NotificationsPreview"), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-400">Loading notifications...</p>,
});

const IdeaInbox = dynamic(() => import("@/components/IdeaInbox"), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-400">Loading ideas...</p>,
});

const TaskManager = dynamic(() => import("@/components/TaskManager"), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-400">Loading tasks...</p>,
});

const OwnerAppControlsPanel = dynamic(() => import("@/components/OwnerAppControlsPanel"), {
  ssr: false,
});
const OwnerMemberAccessPanel = dynamic(() => import("@/components/OwnerMemberAccessPanel"), {
  ssr: false,
});
const OwnerAuditLogPanel = dynamic(() => import("@/components/OwnerAuditLogPanel"), {
  ssr: false,
});

type AccessLevel = "user" | "pro" | "admin";

type AccessResponse = {
  userId?: string | null;
  email?: string | null;
  isOwner: boolean;
  accessLevel: AccessLevel;
};

type ScheduledItem = {
  id?: string;
  platform?: string;
  content?: string;
  schedule_for?: string;
};

export default function DashboardPage() {
  const [canUseAnalytics, setCanUseAnalytics] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userId, setUserId] = useState("");
  const [postPulseRefreshNonce, setPostPulseRefreshNonce] = useState(0);
  const [postPulseIntegrations, setPostPulseIntegrations] = useState<Array<{ platform?: string }>>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledItem[]>([]);
  const dashboardLayout = useSettingsStore((state) => state.dashboardLayout);
  const showAnalyticsPreview = useSettingsStore((state) => state.showAnalyticsPreview);
  const showCreatorToolsPreview = useSettingsStore((state) => state.showCreatorToolsPreview);

  useEffect(() => {
    const loadAccess = async () => {
      try {
        const res = await fetch("/api/access/me");
        if (!res.ok) {
          setCanUseAnalytics(false);
          setIsOwner(false);
          return;
        }

        const data = (await res.json()) as AccessResponse;
        const analyticsAllowed =
          data.isOwner || data.accessLevel === "pro" || data.accessLevel === "admin";

        setCanUseAnalytics(analyticsAllowed);
        setIsOwner(Boolean(data.isOwner));
        setUserId(String(data.userId || ""));
      } catch {
        setCanUseAnalytics(false);
        setIsOwner(false);
        setUserId("");
      }
    };

    loadAccess();
  }, []);

  useEffect(() => {
    const loadPostPulseData = async () => {
      const headers: HeadersInit = userId ? { "x-user-id": userId } : {};

      try {
        const [statusRes, scheduledRes] = await Promise.all([
          fetch("/api/postpulse/status", { headers, cache: "no-store" }),
          fetch("/api/content/scheduled", { headers, cache: "no-store" }),
        ]);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setPostPulseIntegrations(Array.isArray(statusData?.integrations) ? statusData.integrations : []);
        } else {
          setPostPulseIntegrations([]);
        }

        if (scheduledRes.ok) {
          const scheduledData = await scheduledRes.json();
          const rows = Array.isArray(scheduledData?.scheduled_posts) ? scheduledData.scheduled_posts : [];
          const mapped = rows.map((row: { id?: string; platforms?: string[]; content?: string; scheduled_time?: string }) => ({
            id: row.id,
            platform: Array.isArray(row.platforms) ? row.platforms[0] : "",
            content: row.content,
            schedule_for: row.scheduled_time,
          }));
          setScheduledPosts(mapped);
        } else {
          setScheduledPosts([]);
        }
      } catch {
        setPostPulseIntegrations([]);
        setScheduledPosts([]);
      }
    };

    loadPostPulseData();
  }, [userId, postPulseRefreshNonce]);

  const { summary, timeseries, loading } = useAnalytics({ enabled: canUseAnalytics });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const totalReach = summary ? formatNumber(summary.totalViews) : "128.4K";
  const engagementRate = summary
    ? ((summary.totalEngagement / summary.totalViews) * 100).toFixed(1)
    : "6.7";

  return (
    <AppShell>
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-cyan-100">
            Creator Nexus
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Your creator cockpit — analytics, tools, and automations in one place.
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard label="Total Reach" value={totalReach} change="+12.3%" accent="cyan" />
          <SummaryCard label="Engagement Rate" value={`${engagementRate}%`} change="+2.1%" accent="cyan" />
          <SummaryCard label="Monthly Revenue" value="$2,340" change="+8.1%" accent="purple" />
        </section>

        {/* WIDGET GRID */}
        <section className={`grid grid-cols-1 gap-6 ${dashboardLayout === "compact" ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {isOwner && (
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <OwnerAppControlsPanel />
              <OwnerMemberAccessPanel />
              <OwnerAuditLogPanel />
            </div>
          )}

          <DashboardWidget title="Analytics Overview" span={dashboardLayout === "focus" ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <GrowthStat label="Views" value={summary ? formatNumber(summary.totalViews) : "12.4K"} change="+14%" />
              <GrowthStat label="Engagement" value={summary ? formatNumber(summary.totalEngagement) : "1.8K"} change="+9%" />
              <GrowthStat label="Followers" value={summary ? formatNumber(summary.totalFollowers) : "24.5K"} change="+6%" />
            </div>

            {!showAnalyticsPreview ? (
              <div className="rounded-lg border border-cyan-400/20 bg-slate-950/40 p-4 text-sm text-cyan-100/80">
                Analytics preview is hidden by your settings. Enable it from the Settings page.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {!loading && timeseries ? (
                <div className="bg-slate-950/80 border border-cyan-400/30 rounded-lg p-4 shadow-[0_0_12px_rgba(0,229,255,0.15)]">
                  <h3 className="text-sm font-bold text-cyan-400 mb-3">Views Trend</h3>
                  <ViewsOverTimeChart timeseries={timeseries} />
                </div>
              ) : (
                <div className="h-40 bg-slate-950/80 border border-cyan-400/30 rounded-lg flex items-center justify-center text-gray-500 text-xs shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                  Loading analytics chart...
                </div>
              )}

              {summary && summary.platforms && (
                <div className="bg-slate-950/80 border border-cyan-400/30 rounded-lg p-4 shadow-[0_0_12px_rgba(0,229,255,0.15)]">
                  <h3 className="text-sm font-bold text-cyan-400 mb-3">Platform Breakdown</h3>
                  <PlatformBreakdownChart platforms={summary.platforms} />
                </div>
              )}

              <div className="bg-slate-950/80 border border-cyan-400/30 rounded-lg p-4 shadow-[0_0_12px_rgba(0,229,255,0.15)]">
                <h3 className="text-sm font-bold text-cyan-400 mb-3 drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
                  Audience Metrics
                </h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>Returning Viewers • 42%</li>
                  <li>New Viewers • 58%</li>
                  <li>Avg Watch Time • 3m 12s</li>
                  <li>Top Region • United States</li>
                </ul>
              </div>
            </div>
            )}
          </DashboardWidget>

          <DashboardWidget title="Recent Activity">
            <ul className="text-sm text-gray-300 space-y-2">
              <li>New follower on TikTok • 2 min ago</li>
              <li>New comment on YouTube • 18 min ago</li>
              <li>Pipeline "Welcome New Followers" ran • 1 hour ago</li>
              <li>New Discord member joined • 3 hours ago</li>
            </ul>
          </DashboardWidget>

          <DashboardWidget title="PostPulse Center" span={dashboardLayout === "focus" ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="grid gap-4">
              <ConnectPlatforms />
              <PlatformStatus integrations={postPulseIntegrations as any} />
              <PostForm userId={userId} onPublished={() => setPostPulseRefreshNonce((n) => n + 1)} />
              <ScheduledPosts items={scheduledPosts as any} />
            </div>
          </DashboardWidget>

          {showCreatorToolsPreview && (
            <DashboardWidget title="Creator Tools">
              <CreatorToolsPanel />
            </DashboardWidget>
          )}

          <DashboardWidget title="Notifications">
            <NotificationsPreview />
          </DashboardWidget>

          <DashboardWidget title="Idea Inbox">
            <IdeaInbox />
          </DashboardWidget>

          <DashboardWidget title="Task Manager">
            <TaskManager />
          </DashboardWidget>

          <DashboardWidget title="Pipelines Overview" span={dashboardLayout === "focus" ? "lg:col-span-3" : "lg:col-span-2"}>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Welcome New Followers • Active • Last run: 2 hours ago</li>
              <li>Daily Analytics Snapshot • Paused • Last run: Yesterday</li>
              <li>New Comment Alert • Active • Last run: 10 min ago</li>
            </ul>
            <button className="mt-4 bg-slate-900 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm 
                               hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all duration-200 text-cyan-300">
              Open Pipelines
            </button>
          </DashboardWidget>

          <DashboardWidget title="Top Performing Content">
            <div className="space-y-3">
              <div className="bg-slate-950/50 rounded p-2 border border-cyan-400/10">
                <p className="text-sm font-medium text-cyan-100">YouTube Shorts Compilation</p>
                <p className="text-xs text-gray-400 mt-1">8.2K views • 642 likes</p>
              </div>
              <div className="bg-slate-950/50 rounded p-2 border border-cyan-400/10">
                <p className="text-sm font-medium text-cyan-100">TikTok Trending Sound</p>
                <p className="text-xs text-gray-400 mt-1">5.4K views • 1.2K likes</p>
              </div>
              <div className="bg-slate-950/50 rounded p-2 border border-cyan-400/10">
                <p className="text-sm font-medium text-cyan-100">Instagram Carousel Post</p>
                <p className="text-xs text-gray-400 mt-1">2.1K views • 189 likes</p>
              </div>
            </div>
          </DashboardWidget>

        </section>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, change, accent = "cyan" }: { label: string; value: string; change: string; accent?: "cyan" | "purple" }) {
  const accentColor =
    accent === "cyan"
      ? "text-cyan-400"
      : accent === "purple"
      ? "text-purple-400"
      : "text-cyan-400";

  return (
    <div className="bg-slate-900/80 border border-cyan-400/40 rounded-xl p-4 
                    shadow-[0_0_15px_rgba(0,229,255,0.2)]">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className={`text-xs ${accentColor}`}>{change} vs last period</p>
    </div>
  );
}

function DashboardWidget({ title, span = "", children }: { title: string; span?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-slate-900/80 border border-cyan-400/40 rounded-xl p-5 
                     shadow-[0_0_20px_rgba(0,229,255,0.15)] ${span}`}>
      <h2 className="text-lg font-bold mb-3 text-cyan-400 
                     drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function GrowthStat({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="bg-slate-900/80 border border-cyan-400/30 rounded-lg p-3 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-cyan-300">{change} this week</p>
    </div>
  );
}
