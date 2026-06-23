"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/AuthContext";

export default function NotificationsCenter() {
  const authContext = useUser();
  const user = authContext?.user;
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const seededForUser = useRef(null);

  useEffect(() => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setLoadError("");
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        if (data.length === 0) {
          // Guard against duplicate inserts when effects run more than once.
          if (seededForUser.current !== user.id) {
            seededForUser.current = user.id;

            const { error: seedError } = await supabase
              .from("notifications")
              .insert({
                user_id: user.id,
                type: "system",
                category: "system",
                message: "Welcome to Creator Nexus notifications.",
                is_read: false,
              });

            if (seedError) {
              setLoadError("Could not create starter notification.");
            }
          }

          const { data: refreshed, error: refreshError } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!refreshError && refreshed) {
            setNotifications(refreshed);
            const alreadyRead = new Set(
              refreshed.filter((n) => n.is_read).map((n) => n.id)
            );
            setReadNotifications(alreadyRead);
          } else {
            setNotifications([]);
          }
        } else {
          setNotifications(data);
          const alreadyRead = new Set(
            data.filter((n) => n.is_read).map((n) => n.id)
          );
          setReadNotifications(alreadyRead);
        }
      } else if (error) {
        setLoadError("Failed to load notifications.");
      }
      setLoading(false);
    };

    load();
  }, [user]);

  useEffect(() => {
    if (!user?.id || !supabase) {
      return;
    }

    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const incoming = payload?.new;
          if (!incoming || !incoming.id) {
            return;
          }

          setNotifications((prev) => {
            if (prev.some((n) => n.id === incoming.id)) {
              return prev;
            }
            return [incoming, ...prev];
          });

          if (incoming.is_read) {
            setReadNotifications((prev) => {
              const next = new Set(prev);
              next.add(incoming.id);
              return next;
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload?.new;
          if (!updated || !updated.id) {
            return;
          }

          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
          );

          setReadNotifications((prev) => {
            const next = new Set(prev);
            if (updated.is_read) {
              next.add(updated.id);
            } else {
              next.delete(updated.id);
            }
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deleted = payload?.old;
          if (!deleted || !deleted.id) {
            return;
          }

          setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
          setReadNotifications((prev) => {
            const next = new Set(prev);
            next.delete(deleted.id);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const categorise = (n) => {
    if (n.category) return n.category;
    const pipelines = ["pipeline", "automation", "workflow"];
    const system = ["system", "backup", "security"];
    if (pipelines.includes(n.type)) return "pipelines";
    if (system.includes(n.type)) return "system";
    return "platform";
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  const icons = {
    tiktok: <span className="text-pink-400">🎵</span>,
    youtube: <span className="text-red-400">▶️</span>,
    pipeline: <span className="text-cyan-400">⚙️</span>,
    discord: <span className="text-purple-400">💬</span>,
    system: <span className="text-green-400">✔️</span>,
    instagram: <span className="text-pink-300">📸</span>,
    twitter: <span className="text-sky-400">🐦</span>,
    twitch: <span className="text-purple-500">🎮</span>,
    facebook: <span className="text-blue-400">📘</span>,
    linkedin: <span className="text-blue-500">💼</span>,
    default: <span className="text-cyan-300">🔔</span>,
  };

  const typeColour = {
    tiktok: "text-pink-400",
    youtube: "text-red-400",
    pipeline: "text-cyan-400",
    discord: "text-purple-400",
    system: "text-green-400",
    instagram: "text-pink-300",
    twitter: "text-sky-400",
    twitch: "text-purple-500",
    facebook: "text-blue-400",
    linkedin: "text-blue-500",
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "platform", label: "Platform" },
    { id: "pipelines", label: "Pipelines" },
    { id: "system", label: "System" },
  ];

  const availableTypes = Array.from(
    new Set(notifications.map((n) => n.type).filter(Boolean))
  );

  // Filter notifications based on active tab
  const filteredNotifications = notifications
    .filter((n) => (activeTab === "all" ? true : categorise(n) === activeTab))
    .filter((n) => (typeFilter === "all" ? true : n.type === typeFilter))
    .filter((n) => (showUnreadOnly ? !readNotifications.has(n.id) : true));

  const handleMarkAllAsRead = async () => {
    setReadNotifications(new Set(notifications.map((n) => n.id)));
    if (supabase && user) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id);
    }
  };

  const handleMarkAsRead = async (id) => {
    const updated = new Set(readNotifications);
    updated.add(id);
    setReadNotifications(updated);
    if (supabase && user) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id);
    }
  };

  const handleDeleteOne = async (id) => {
    if (!supabase || !user) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const nextRead = new Set(readNotifications);
      nextRead.delete(id);
      setReadNotifications(nextRead);
    }
  };

  const handleDeleteRead = async () => {
    if (!supabase || !user) return;

    const readIds = notifications
      .filter((n) => readNotifications.has(n.id))
      .map((n) => n.id);

    if (readIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .in("id", readIds)
      .eq("user_id", user.id);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => !readNotifications.has(n.id)));
      setReadNotifications(new Set());
    }
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

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm text-cyan-100">
          Type
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-cyan-400/40 bg-black/80 px-3 py-2 text-cyan-100"
          >
            <option value="all">All types</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-end gap-2 text-sm text-cyan-100">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={() => setShowUnreadOnly((v) => !v)}
            className="h-4 w-4"
          />
          Show unread only
        </label>

        <button
          onClick={handleDeleteRead}
          className="rounded-lg border border-violet-400/45 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 transition hover:bg-violet-500/20"
        >
          Delete Read
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {loadError && (
          <p className="text-violet-300 text-center py-3">{loadError}</p>
        )}
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            {notifications.length === 0
              ? "No notifications yet."
              : "No notifications in this category."}
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
                {icons[n.type] ?? icons.default}
                <div>
                  <p className={`font-bold ${typeColour[n.type] ?? "text-cyan-300"}`}>
                    {n.message}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {n.time ?? formatTime(n.created_at)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleMarkAsRead(n.id)}
                className="bg-black/80 border border-cyan-400/40 px-3 py-1 rounded-lg text-xs hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] transition-all duration-200 whitespace-nowrap"
              >
                {readNotifications.has(n.id) ? "Read" : "View"}
              </button>

              <button
                onClick={() => handleDeleteOne(n.id)}
                className="bg-black/80 border border-violet-400/40 px-3 py-1 rounded-lg text-xs text-violet-200 hover:shadow-[0_0_10px_rgba(168,85,247,0.35)] transition-all duration-200 whitespace-nowrap"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
