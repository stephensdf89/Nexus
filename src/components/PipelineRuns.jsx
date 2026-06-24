"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PipelineRuns({ pipelineId, onSelectRun }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "running":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  useEffect(() => {
    if (!pipelineId) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("pipeline_runs")
        .select("*")
        .eq("pipeline_id", pipelineId)
        .order("started_at", { ascending: false });

      setRuns(data || []);
      setLoading(false);
    };

    load();
  }, [pipelineId]);

  useEffect(() => {
    if (!pipelineId) return;

    const channel = supabase
      .channel("pipeline-runs-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pipeline_runs",
          filter: `pipeline_id=eq.${pipelineId}`,
        },
        (payload) => {
          setRuns((prev) => {
            const existing = prev.find((r) => r.id === payload.new.id);
            if (existing) {
              return prev.map((r) =>
                r.id === payload.new.id ? payload.new : r
              );
            }
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [pipelineId]);

  if (loading) return <p className="text-gray-400">Loading runs...</p>;

  return (
    <div className="space-y-4">
      {runs.map((run) => (
        <div
          key={run.id}
          className="bg-black/80 border border-red-600 rounded-lg p-4 shadow-[0_0_10px_rgba(255,0,0,0.4)] cursor-pointer"
          onClick={() => onSelectRun?.(run.id)}
        >
          <div className="flex justify-between items-center">
            <span className={`font-bold ${statusColor(run.status)}`}>
              {run.status.toUpperCase()}
            </span>

            <span className="text-xs text-gray-400">
              {new Date(run.started_at).toLocaleString()}
            </span>
          </div>

          {run.finished_at && (
            <p className="text-xs text-gray-500 mt-1">
              Finished: {new Date(run.finished_at).toLocaleString()}
            </p>
          )}

          {run.error_message && (
            <p className="text-xs text-red-400 mt-2">
              Error: {run.error_message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}