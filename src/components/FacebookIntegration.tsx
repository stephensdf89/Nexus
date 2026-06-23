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
}

export default function FacebookIntegration() {
  const [facebookStatus, setFacebookStatus] = useState<FacebookStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Facebook connection status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/integrations/facebook/status");
      const data = await res.json();
      setFacebookStatus(data);
    } catch (error) {
      console.error("Error fetching Facebook status:", error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/facebook/auth", {
        method: "POST",
      });
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        console.error("Failed to get auth URL");
      }
    } catch (error) {
      console.error("Error initiating Facebook auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!facebookStatus?.pages[0]?.platform_id) return;

    try {
      await fetch("/api/integrations/facebook/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformId: facebookStatus.pages[0].platform_id,
        }),
      });
      fetchStatus();
    } catch (error) {
      console.error("Error disconnecting Facebook:", error);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded border border-cyan-400/40 bg-slate-900/50 p-6">
      <div>
        <div className="mb-4 h-12 w-12 rounded-full bg-[#1877F2] flex items-center justify-center">
          <span className="text-white text-lg font-bold">f</span>
        </div>

        <h2 className="text-xl font-semibold mb-3">Facebook</h2>

        <p className="mb-4 text-cyan-100/70">
          Status:{" "}
          <span className={`font-bold ${facebookStatus?.connected ? "text-green-400" : "text-[#FF0033]"}`}>
            {facebookStatus?.status}
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
      </div>

      <div className="flex gap-2">
        {facebookStatus?.connected ? (
          <button
            onClick={handleDisconnect}
            className="rounded bg-red-700 px-4 py-2 font-bold hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="rounded bg-[#1877F2] px-4 py-2 font-bold hover:bg-[#165ec7] transition-colors disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>
    </div>
  );
}
