"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useUser } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabaseClient";

type NotificationRow = {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

function formatTime(ts?: string) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function NotificationsPreview() {
  const authContext = useUser();
  const user = authContext?.user;

  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setRows([]);
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("notifications")
          .select("id, message, created_at, is_read")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setRows(Array.isArray(data) ? (data as NotificationRow[]) : []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading notifications...</p>;
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">No recent notifications.</p>
      ) : (
        rows.map((n) => (
          <div
            key={n.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              n.is_read
                ? "border-cyan-400/15 bg-slate-950/40 text-gray-400"
                : "border-cyan-400/35 bg-slate-950/70 text-cyan-100"
            }`}
          >
            <p className="line-clamp-2">{n.message}</p>
            <p className="mt-1 text-xs text-cyan-200/65">{formatTime(n.created_at)}</p>
          </div>
        ))
      )}

      <div className="pt-1">
        <Link
          href="/notifications"
          className="inline-flex rounded-lg border border-cyan-400/45 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-500/20"
        >
          Open Notifications Center
        </Link>
      </div>
    </div>
  );
}
