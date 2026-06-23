"use client";

import { useState, useEffect } from "react";

interface FacebookPage {
  platform_id: string;
  page_name: string;
  created_at: string;
}

interface FacebookStatus {
  connected: boolean;
  pages: FacebookPage[];
  status: string;
  error?: string;
}

interface FacebookAnalytics {
  connected: boolean;
  warning?: string;
  page?: {
    id: string;
    name: string;
    fanCount: number | null;
    followersCount: number | null;
  };
  insights?: {
    pageImpressions: number | null;
    pageEngagedUsers: number | null;
  };
}

export default function FacebookIntegration() {
  const [facebookStatus, setFacebookStatus] = useState<FacebookStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<FacebookAnalytics | null>(null);
  const [error, setError] = useState<string>("");

  // Fetch Facebook connection status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setError("");
      const res = await fetch("/api/integrations/facebook/status");
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setFacebookStatus(data);
      if (data?.connected) {
        fetchAnalytics();
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch Facebook status";
      console.error("Error fetching Facebook status:", err);
      setError(errorMsg);
      setFacebookStatus(null);
    }
  };

  const handleConnect = () => {
    setLoading(true);
    setError("");

    const timeoutId = window.setTimeout(() => {
      setLoading(false);
      setError("Facebook connect took too long. Please try again.");
    }, 12000);

    try {
      window.location.assign("/api/integrations/facebook/auth");
    } catch (err) {
      window.clearTimeout(timeoutId);
      const errorMsg = err instanceof Error ? err.message : "Error initiating Facebook auth";
      console.error("Error initiating Facebook auth:", err);
      setError(errorMsg);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch("/api/integrations/facebook/analytics");

      if (!response.ok) {
        const message = response.status === 404
          ? "Connect Facebook first to pull analytics."
          : `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMsg);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!facebookStatus?.pages[0]?.platform_id) return;

    try {
      setError("");
      const response = await fetch("/api/integrations/facebook/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformId: facebookStatus.pages[0].platform_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setError("");
      setAnalytics(null);
      fetchStatus();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error disconnecting Facebook";
      console.error("Error disconnecting Facebook:", err);
      setError(errorMsg);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded border border-cyan-400/40 bg-slate-900/50 p-6">
      <div>
        <div className="mb-4 h-12 w-12 rounded-full bg-[#1877F2] flex items-center justify-center">
          <span className="text-white text-lg font-bold">f</span>
        </div>

        <h2 className="text-xl font-semibold mb-3">Facebook</h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-400/50">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <p className="mb-4 text-cyan-100/70">
          Status:{" "}
          <span className={`font-bold ${facebookStatus?.connected ? "text-green-400" : "text-[#FF0033]"}`}>
            {facebookStatus?.status || "Not Connected"}
          </span>
        </p>

        {facebookStatus?.connected && facebookStatus.pages.length > 0 && (
          <div className="bg-slate-950/80 border border-cyan-400/30 rounded p-3 mb-4 text-sm">
            <p className="text-cyan-100 font-semibold mb-2">Connected Pages:</p>
            {facebookStatus.pages.map((page) => (
              <p key={page.platform_id} className="text-cyan-100/70">
                • {page.page_name}
                <br />
                <span className="text-xs text-gray-500">
                  Connected: {new Date(page.created_at).toLocaleDateString()}
                </span>
              </p>
            ))}
          </div>
        )}

        {analytics && (
          <div className="bg-slate-950/80 border border-cyan-400/30 rounded p-3 mb-4 text-sm space-y-2">
            <p className="text-cyan-100 font-semibold">Facebook Analytics</p>
            <p className="text-cyan-100/70">Page: {analytics.page?.name || "Unknown"}</p>
            <p className="text-cyan-100/70">Followers: {analytics.page?.followersCount ?? "N/A"}</p>
            <p className="text-cyan-100/70">Fans: {analytics.page?.fanCount ?? "N/A"}</p>
            <p className="text-cyan-100/70">Daily Impressions: {analytics.insights?.pageImpressions ?? "N/A"}</p>
            <p className="text-cyan-100/70">Daily Engaged Users: {analytics.insights?.pageEngagedUsers ?? "N/A"}</p>
            {analytics.warning && (
              <p className="text-amber-300 text-xs">{analytics.warning}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {facebookStatus?.connected ? (
          <>
            <button
              onClick={fetchAnalytics}
              disabled={analyticsLoading}
              className="rounded bg-cyan-700 px-4 py-2 font-bold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyticsLoading ? "Pulling..." : "Pull Analytics"}
            </button>

            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="rounded bg-red-700 px-4 py-2 font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Disconnecting..." : "Disconnect"}
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="rounded bg-[#1877F2] px-4 py-2 font-bold hover:bg-[#165ec7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>
    </div>
  );
}
