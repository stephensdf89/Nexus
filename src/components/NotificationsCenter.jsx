"use client";

import { useState } from "react";

export default function NotificationsCenter() {
  const [activeTab, setActiveTab] = useState("all");
  const [readNotifications, setReadNotifications] = useState(new Set());

  const allNotifications = [
    {
      id: "notif-1",
      type: "tiktok",
      message: "New follower on TikTok",
      time: "2 minutes ago",
      color: "text-pink-400",
      category: "platform",
    },
    {
      id: "notif-2",
      type: "youtube",
      message: "New comment on your YouTube video",
      time: "18 minutes ago",
      color: "text-red-400",
      category: "platform",
    },
    {
      id: "notif-3",
      type: "pipeline",
      message: "Pipeline 'Welcome New Followers' executed",
      time: "1 hour ago",
      color: "text-cyan-400",
      category: "pipelines",
    },
    {
      id: "notif-4",
      type: "discord",
      message: "New member joined your Discord server",
      time: "3 hours ago",
      color: "text-purple-400",
      category: "platform",
    },
    {
      id: "notif-5",
      type: "system",
      message: "Backup completed successfully",
      time: "5 hours ago",
      color: "text-green-400",
      category: "system",
    },
  ];

  const icons = {
    tiktok: <span className="text-pink-400">🎵</span>,
    youtube: <span className="text-red-400">▶️</span>,
    pipeline: <span className="text-cyan-400">⚙️</span>,
    discord: <span className="text-purple-400">💬</span>,
    system: <span className="text-green-400">✔️</span>,
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "platform", label: "Platform" },
    { id: "pipelines", label: "Pipelines" },
    { id: "system", label: "System" },
  ];

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "all"
      ? allNotifications
      : allNotifications.filter((n) => n.category === activeTab);

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setReadNotifications(new Set(allNotifications.map((n) => n.id)));
  };

  // Mark individual notification as read
  const handleMarkAsRead = (id) => {
    const updated = new Set(readNotifications);
    updated.add(id);
    setReadNotifications(updated);
  };

  return (
    <div className="bg-black text-white p-6 rounded-xl border border-cyan-400/30 shadow-[0_0_16px_rgba(0,229,255,0.15)]">
      <h1 className="text-3xl font-bold mb-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
        Notifications Center
      </h1>

      <p className="text-gray-400 mb-8">
        All your creator notifications in one place - across every platform, pipeline, and integration.
      </p>

      {/* Tab buttons */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-slate-900 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.5)]"
                : "bg-black/80 border border-cyan-400/40 hover:shadow-[0_0_12px_rgba(0,229,255,0.35)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleMarkAllAsRead}
        className="mb-6 glow-neon bg-gradient-to-r from-[#00E5FF] via-[#3A7BFF] to-[#A45CFF] px-4 py-2 rounded-lg font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all duration-200 text-slate-950 hover:shadow-[0_0_16px_rgba(0,229,255,0.6)]"
      >
        Mark All as Read
      </button>

      {/* Notifications list */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No notifications in this category.
          </p>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`border border-cyan-400/30 rounded-xl p-4 shadow-[0_0_15px_rgba(0,229,255,0.18)] flex items-center justify-between gap-3 transition-all duration-200 ${
                readNotifications.has(n.id)
                  ? "bg-slate-950/50 opacity-60"
                  : "bg-slate-900/80"
              }`}
            >
              <div className="flex items-center gap-3">
                {icons[n.type]}
                <div>
                  <p className={`font-bold ${n.color}`}>{n.message}</p>
                  <p className="text-gray-400 text-xs">{n.time}</p>
                </div>
              </div>

              <button
                onClick={() => handleMarkAsRead(n.id)}
                className="bg-black/80 border border-cyan-400/40 px-3 py-1 rounded-lg text-xs hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] transition-all duration-200 whitespace-nowrap"
              >
                {readNotifications.has(n.id) ? "Read" : "View"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
