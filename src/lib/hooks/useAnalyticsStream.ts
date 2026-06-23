import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@/contexts/AuthContext";

export interface StreamedMetrics {
  timestamp: number;
  views: number;
  engagement: number;
  followers: number;
  platforms: Array<{
    platform: string;
    views: number;
    engagement: number;
    followers: number;
  }>;
}

interface UseAnalyticsStreamOptions {
  enabled?: boolean;
  onMetrics?: (metrics: StreamedMetrics) => void;
  onError?: (error: string) => void;
}

export function useAnalyticsStream(options: UseAnalyticsStreamOptions = {}) {
  const { enabled = true, onMetrics, onError } = options;
  const authContext = useUser();
  const user = authContext?.user;

  const [metrics, setMetrics] = useState<StreamedMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !user || eventSourceRef.current) return;

    try {
      const url = `/api/analytics/stream`;
      const eventSource = new EventSource(url);

      eventSource.addEventListener("connected", () => {
        console.log("Analytics stream connected");
        setIsConnected(true);
        setError(null);
      });

      eventSource.addEventListener("metrics", (event) => {
        try {
          const data = JSON.parse(event.data) as StreamedMetrics;
          setMetrics(data);
          onMetrics?.(data);
        } catch (err) {
          console.error("Failed to parse metrics:", err);
        }
      });

      eventSource.addEventListener("error", (event) => {
        console.error("Stream error:", event);
        const errorMsg = "Analytics stream error";
        setError(errorMsg);
        onError?.(errorMsg);
        eventSource.close();
        setIsConnected(false);
      });

      eventSource.onerror = () => {
        console.error("EventSource error");
        setIsConnected(false);
        setError("Connection lost");
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (enabled && user) {
            connect();
          }
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect to analytics stream";
      console.error("Analytics stream error:", err);
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [enabled, user, onMetrics, onError]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setMetrics(null);
    }
  }, []);

  useEffect(() => {
    if (enabled && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, user, connect, disconnect]);

  return {
    metrics,
    isConnected,
    error,
    reconnect: connect,
  };
}
