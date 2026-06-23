"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/lib/settingsStore";

export default function DashboardPage() {
  const a11y = useSettingsStore();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    a11y.load();
  }, []);

  const widgets = [
    "analytics",
    "recentActivity",
    "creatorTools",
    "notifications",
    "pipelines",
    "monetization",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* ACCESSIBILITY BUTTON */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Open Accessibility Menu"
        aria-expanded={showMenu}
        className="fixed top-4 right-4 z-50 px-3 py-2 rounded focus:outline-2 focus:outline-offset-2 bg-cyan-500 text-slate-950 focus:outline-cyan-400"
      >
        A11y
      </button>

      {showMenu && (
        <div className="fixed top-16 right-4 p-4 rounded w-72 z-50 border-2 bg-slate-900/95 border-cyan-400/70 text-white">
          <h2 className="font-bold mb-4 text-lg">Accessibility Options</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Text Size:</span>
              <select
                value={a11y.textSize}
                onChange={(e) => a11y.update("textSize", e.target.value)}
                className="ml-2 px-2 py-1 rounded border bg-slate-950 border-cyan-400/70 text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Default</option>
                <option value="large">Large</option>
              </select>
            </label>
            <label className="flex items-center justify-between">
              <span>Color Blind Mode:</span>
              <select
                value={a11y.colorBlindMode}
                onChange={(e) => a11y.update("colorBlindMode", e.target.value)}
                className="ml-2 px-2 py-1 rounded border bg-slate-950 border-cyan-400/70 text-white"
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              </select>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={a11y.disableNeon}
                onChange={() => a11y.update("disableNeon", !a11y.disableNeon)}
                className="mr-2 w-4 h-4 cursor-pointer"
              />
              <span>Disable Neon Effects</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={a11y.safeMode}
                onChange={() => a11y.update("safeMode", !a11y.safeMode)}
                className="mr-2 w-4 h-4 cursor-pointer"
              />
              <span>Seizure-Safe Mode</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={a11y.reducedMotion}
                onChange={() => a11y.update("reducedMotion", !a11y.reducedMotion)}
                className="mr-2 w-4 h-4 cursor-pointer"
              />
              <span>Reduced Motion</span>
            </label>
          </div>
          <button
            onClick={() => setShowMenu(false)}
            className="w-full mt-4 px-3 py-2 rounded border bg-violet-600 text-white border-violet-400/70 hover:bg-violet-700"
          >
            Close
          </button>
        </div>
      )}

      {/* TOP BAR */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-cyan-400/30 shadow-[0_0_20px_rgba(0,229,255,0.1)] bg-slate-950/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_8px_rgba(0,229,255,0.25)]">
            Creator Nexus
          </h1>
          <p className="text-gray-400 text-sm">
            Your creator cockpit — analytics, tools, and automations in one place.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-slate-900 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all duration-200 text-cyan-300">
            View Pipelines
          </button>
          <Link
            href="/settings"
            className="bg-slate-900 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all duration-200 text-cyan-300"
          >
            Settings
          </Link>
          <button className="glow-neon bg-gradient-to-r from-[#00E5FF] via-[#3A7BFF] to-[#A45CFF] px-4 py-2 rounded-lg font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all duration-200 text-slate-950">
            New Automation
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        {/* TOP ROW: SUMMARY */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            label="Total Reach"
            value="128.4K"
            change="+12.3%"
            accent="cyan"
          />
          <SummaryCard
            label="Active Pipelines"
            value="4"
            change="+1"
            accent="cyan"
          />
          <SummaryCard
            label="Monthly Revenue"
            value="$2,340"
            change="+8.1%"
            accent="purple"
          />
        </section>

        {/* WIDGET GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardWidget title="Analytics Overview" span="lg:col-span-2">
            <PlaceholderBlock>
              Traffic, views, watch time, and engagement charts coming soon.
            </PlaceholderBlock>
          </DashboardWidget>

          <DashboardWidget title="Recent Activity">
            <ul className="text-sm text-gray-300 space-y-2">
              <li>New follower on TikTok • 2 min ago</li>
              <li>New comment on YouTube • 18 min ago</li>
              <li>Pipeline "Welcome New Followers" ran • 1 hour ago</li>
              <li>New Discord member joined • 3 hours ago</li>
            </ul>
          </DashboardWidget>

          <DashboardWidget title="Creator Tools" span="lg:col-span-1">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <QuickTool label="Content Planner" />
              <QuickTool label="Task Manager" />
              <QuickTool label="Idea Inbox" />
              <QuickTool label="Template Library" />
            </div>
          </DashboardWidget>

          <DashboardWidget title="Notifications" span="lg:col-span-1">
            <PlaceholderBlock>
              Centralized notifications from all platforms coming soon.
            </PlaceholderBlock>
          </DashboardWidget>

          <DashboardWidget title="Pipelines Overview" span="lg:col-span-2">
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Welcome New Followers • Active • Last run: 2 hours ago</li>
              <li>Daily Analytics Snapshot • Paused • Last run: Yesterday</li>
              <li>New Comment Alert • Active • Last run: 10 min ago</li>
            </ul>
            <button className="mt-4 bg-slate-900 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all duration-200 text-cyan-300">
              Open Pipelines
            </button>
          </DashboardWidget>

          <DashboardWidget title="Monetization Snapshot">
            <PlaceholderBlock>
              Revenue by platform, CPM, and conversion funnels coming soon.
            </PlaceholderBlock>
          </DashboardWidget>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  change,
  accent = "cyan",
}: {
  label: string;
  value: string;
  change: string;
  accent?: "cyan" | "purple";
}) {
  const accentColor =
    accent === "cyan"
      ? "text-cyan-400"
      : accent === "purple"
      ? "text-purple-400"
      : "text-cyan-400";

  return (
    <div className="bg-slate-900/80 border border-cyan-400/40 rounded-xl p-4 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className={`text-xs ${accentColor}`}>{change} vs last period</p>
    </div>
  );
}

function DashboardWidget({
  title,
  span = "",
  children,
}: {
  title: string;
  span?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-slate-900/80 border border-cyan-400/40 rounded-xl p-5 shadow-[0_0_20px_rgba(0,229,255,0.15)] ${span}`}
    >
      <h2 className="text-lg font-bold mb-3 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function PlaceholderBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-950/80 border border-cyan-400/30 rounded-lg p-4 text-sm text-gray-400 shadow-[0_0_12px_rgba(0,229,255,0.15)]">
      {children}
    </div>
  );
}

function QuickTool({ label }: { label: string }) {
  return (
    <button className="bg-slate-950/80 border border-cyan-400/30 rounded-lg px-3 py-2 text-xs text-gray-200 hover:shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all duration-200">
      {label}
    </button>
  );
}
