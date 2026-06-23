"use client";

export default function NotificationsCenter() {
  const notifications = [
    {
      type: "tiktok",
      message: "New follower on TikTok",
      time: "2 minutes ago",
      color: "text-pink-400",
    },
    {
      type: "youtube",
      message: "New comment on your YouTube video",
      time: "18 minutes ago",
      color: "text-red-400",
    },
    {
      type: "pipeline",
      message: "Pipeline 'Welcome New Followers' executed",
      time: "1 hour ago",
      color: "text-cyan-400",
    },
    {
      type: "discord",
      message: "New member joined your Discord server",
      time: "3 hours ago",
      color: "text-purple-400",
    },
    {
      type: "system",
      message: "Backup completed successfully",
      time: "5 hours ago",
      color: "text-green-400",
    },
  ];

  const icons = {
    tiktok: <span className="text-pink-400">🎵</span>,
    youtube: <span className="text-red-400">▶️</span>,
    pipeline: <span className="text-cyan-400">⚙️</span>,
    discord: <span className="text-purple-400">💬</span>,
    system: <span className="text-green-400">✔️</span>,
  };

  return (
    <div className="bg-black text-white p-6 rounded-xl border border-cyan-400/30 shadow-[0_0_16px_rgba(0,229,255,0.15)]">
      <h1 className="text-3xl font-bold mb-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
        Notifications Center
      </h1>

      <p className="text-gray-400 mb-8">
        All your creator notifications in one place - across every platform, pipeline, and integration.
      </p>

      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <button className="bg-slate-900 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm hover:shadow-[0_0_12px_rgba(0,229,255,0.35)] transition-all duration-200">
          All
        </button>
        <button className="bg-black/80 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm hover:shadow-[0_0_12px_rgba(0,229,255,0.35)] transition-all duration-200">
          Platform
        </button>
        <button className="bg-black/80 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm hover:shadow-[0_0_12px_rgba(0,229,255,0.35)] transition-all duration-200">
          Pipelines
        </button>
        <button className="bg-black/80 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm hover:shadow-[0_0_12px_rgba(0,229,255,0.35)] transition-all duration-200">
          System
        </button>
      </div>

      <button className="mb-6 glow-neon bg-gradient-to-r from-[#00E5FF] via-[#3A7BFF] to-[#A45CFF] px-4 py-2 rounded-lg font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all duration-200 text-slate-950">
        Mark All as Read
      </button>

      <div className="space-y-4">
        {notifications.map((n, i) => (
          <div
            key={`${n.type}-${i}`}
            className="bg-slate-900/80 border border-cyan-400/30 rounded-xl p-4 shadow-[0_0_15px_rgba(0,229,255,0.18)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              {icons[n.type]}
              <div>
                <p className={`font-bold ${n.color}`}>{n.message}</p>
                <p className="text-gray-400 text-xs">{n.time}</p>
              </div>
            </div>

            <button className="bg-black/80 border border-cyan-400/40 px-3 py-1 rounded-lg text-xs hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] transition-all duration-200">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
