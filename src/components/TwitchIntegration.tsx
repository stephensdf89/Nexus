"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/AuthContext";

interface TwitchStatus {
  connected: boolean;
  channel_name?: string;
  platform_id?: string;
}

interface TwitchMetrics {
  subscribers: number;
  videos: number;
  recent_engagement: number;
}

export default function TwitchIntegration() {
  const authContext = useUser();
  const user = authContext?.user;

  const [status, setStatus] = useState<TwitchStatus>({ connected: false });
  const [metrics, setMetrics] = useState<TwitchMetrics | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/integrations/twitch/status", {
          headers: {
            "x-user-id": user.id || "",
            "x-user-email": user.email || "",
          },
        });

        const data = await res.json();
        setStatus(data);

        if (data.connected) {
          const metricsRes = await fetch(
            "/api/integrations/twitch/analytics",
            {
              headers: {
                "x-user-id": user.id || "",
                "x-user-email": user.email || "",
              },
            }
          );

          if (metricsRes.ok) {
            const metricsData = await metricsRes.json();
            if (metricsData.success) {
              setMetrics(metricsData.metrics);
            }
          }
        }
      } catch (err) {
        console.error("Error checking Twitch status:", err);
        setError(err instanceof Error ? err.message : "Error checking status");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user]);

  const handleConnect = async () => {
    if (!user) return;

    try {
      setConnecting(true);
      setError(null);

      const res = await fetch("/api/integrations/twitch/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.id,
          email: user.email,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to initiate Twitch authentication");
      }

      const data = await res.json();

      if (data.authUrl) {
        window.location.assign(data.authUrl);
      }
    } catch (err) {
      console.error("Error connecting Twitch:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    try {
      setConnecting(true);
      setError(null);

      const res = await fetch("/api/integrations/twitch/disconnect", {
        method: "POST",
        headers: {
          "x-user-id": user.id || "",
          "x-user-email": user.email || "",
        },
      });

      if (res.ok) {
        setStatus({ connected: false });
        setMetrics(null);
      } else {
        throw new Error("Failed to disconnect");
      }
    } catch (err) {
      console.error("Error disconnecting Twitch:", err);
      setError(err instanceof Error ? err.message : "Disconnection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handlePullAnalytics = async () => {
    if (!user) return;

    try {
      setConnecting(true);
      setError(null);

      const res = await fetch("/api/integrations/twitch/analytics", {
        headers: {
          "x-user-id": user.id || "",
          "x-user-email": user.email || "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
        } else {
          throw new Error(data.error || "Failed to fetch analytics");
        }
      } else {
        throw new Error("Failed to pull analytics");
      }
    } catch (err) {
      console.error("Error pulling Twitch analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-between rounded border border-cyan-400/40 bg-slate-900/50 p-6 h-full">
        <div>
          <div className="mb-4 h-12 w-12 rounded-full bg-[#9146FF]"></div>
          <h2 className="text-xl font-semibold mb-3">Twitch</h2>
          <p className="text-cyan-100/70 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between rounded border border-cyan-400/40 bg-slate-900/50 p-6 h-full">
      <div>
        <div className="mb-4 h-12 w-12 rounded-full bg-[#9146FF]"></div>

        <h2 className="text-xl font-semibold mb-3">Twitch</h2>

        {!status.connected ? (
          <p className="mb-4 text-cyan-100/70">
            Status:{" "}
            <span className="font-bold text-yellow-400">Not Connected</span>
          </p>
        ) : (
          <div className="mb-4">
            <p className="text-cyan-100/70 text-sm mb-2">
              Status:{" "}
              <span className="font-bold text-green-400">Connected</span>
            </p>
            <p className="text-cyan-100/70 text-sm">
              Account: <span className="font-semibold">{status.channel_name}</span>
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        {status.connected && metrics && (
          <div className="bg-slate-950/50 border border-cyan-400/20 rounded-lg p-3 mb-4 space-y-2">
            <div className="text-sm">
              <p className="text-gray-400">Followers</p>
              <p className="text-cyan-300 font-semibold">
                {(metrics.subscribers / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="text-sm">
              <p className="text-gray-400">Videos</p>
              <p className="text-cyan-300 font-semibold">
                {metrics.videos}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-gray-400">Recent Engagement</p>
              <p className="text-cyan-300 font-semibold">
                {(metrics.recent_engagement / 100).toFixed(0)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {!status.connected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full rounded bg-cyan-600 px-4 py-2 font-bold hover:bg-cyan-500 disabled:opacity-50 transition-all"
          >
            {connecting ? "Connecting..." : "Connect"}
          </button>
        ) : (
          <>
            <button
              onClick={handlePullAnalytics}
              disabled={connecting}
              className="w-full rounded bg-cyan-600 px-4 py-2 font-bold text-sm hover:bg-cyan-500 disabled:opacity-50 transition-all"
            >
              {connecting ? "Loading..." : "Pull Analytics"}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={connecting}
              className="w-full rounded bg-red-700 px-4 py-2 font-bold text-sm hover:bg-red-600 disabled:opacity-50 transition-all"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
