"use client";

import { useState, useEffect } from "react";
import { useAnalyticsStream, StreamedMetrics } from "@/lib/hooks/useAnalyticsStream";

export default function RealtimeAnalyticsWidget() {
  const [isEnabled, setIsEnabled] = useState(true);
  const { metrics, isConnected, error } = useAnalyticsStream({ enabled: isEnabled });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (metrics) {
      setLastUpdate(new Date(metrics.timestamp));
    }
  }, [metrics]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getConnectionStatus = () => {
    if (error) return "error";
    if (isConnected) return "connected";
    return "connecting";
  };

  const statusColor = {
    connected: "bg-green-500",
    connecting: "bg-yellow-500",
    error: "bg-red-500",
  }[getConnectionStatus()];

  return (
    <div className="rounded border border-cyan-400/40 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
          <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`}></div>
        </div>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            isEnabled
              ? "bg-green-600 hover:bg-green-500"
              : "bg-gray-600 hover:bg-gray-500"
          }`}
        >
          {isEnabled ? "On" : "Off"}
        </button>
      </div>

      {error && !isEnabled && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {metrics && (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/50 border border-cyan-400/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Total Views</p>
              <p className="text-cyan-300 text-3xl font-bold">
                {formatNumber(metrics.views)}
              </p>
            </div>
            <div className="bg-slate-950/50 border border-cyan-400/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Followers</p>
              <p className="text-cyan-300 text-3xl font-bold">
                {formatNumber(metrics.followers)}
              </p>
            </div>
            <div className="bg-slate-950/50 border border-cyan-400/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Engagement</p>
              <p className="text-cyan-300 text-3xl font-bold">
                {formatNumber(metrics.engagement)}
              </p>
            </div>
          </div>

          {/* Platform Breakdown */}
          {metrics.platforms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-cyan-200">
                Connected Platforms
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {metrics.platforms.map((p) => (
                  <div
                    key={p.platform}
                    className="bg-slate-950/50 border border-cyan-400/20 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-cyan-200 capitalize">
                        {p.platform}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {formatNumber(p.followers)} followers • {formatNumber(p.views)} views
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-300 font-bold">
                        {formatNumber(p.engagement)}
                      </p>
                      <p className="text-gray-500 text-xs">engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Update */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-cyan-400/10">
            {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
            {isConnected && " (streaming)"}
          </div>
        </div>
      )}

      {!isEnabled && (
        <div className="text-center py-8 text-gray-400">
          Real-time analytics disabled. Click "On" to enable streaming.
        </div>
      )}
    </div>
  );
}
