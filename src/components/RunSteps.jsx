"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RunSteps({ runId }) {
  const [steps, setSteps] = useState([]);
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
    if (!runId) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("pipeline_run_steps")
        .select("*")
        .eq("run_id", runId)
        .order("started_at", { ascending: true });

      setSteps(data || []);
      setLoading(false);
    };

    load();
  }, [runId]);

  useEffect(() => {
    if (!runId) return;

    const channel = supabase
      .channel("run-steps-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pipeline_run_steps",
          filter: `run_id=eq.${runId}`,
        },
        (payload) => {
          setSteps((prev) => {
            const existing = prev.find((s) => s.id === payload.new.id);
            if (existing) {
              return prev.map((s) =>
                s.id === payload.new.id ? payload.new : s
              );
            }
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [runId]);

  if (loading) return <p className="text-gray-400">Loading logs...</p>;

  return (
    <div className="space-y-4">
      {steps.map((s, index) => (
        <div
          key={s.id}
          className="bg-black/80 border border-red-600 rounded-lg p-4 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
        >
          <div className="flex justify-between items-center">
            <span className={`font-bold ${statusColor(s.status)}`}>
              Step {index + 1}: {s.status.toUpperCase()}
            </span>

            <span className="text-xs text-gray-400">
              {new Date(s.started_at).toLocaleString()}
            </span>
          </div>

          {s.finished_at && (
            <p className="text-xs text-gray-500 mt-1">
              Finished: {new Date(s.finished_at).toLocaleString()}
            </p>
          )}

          {s.input && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Input:</p>
              <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(s.input, null, 2)}
              </pre>
            </div>
          )}

          {s.output && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Output:</p>
              <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(s.output, null, 2)}
              </pre>
            </div>
          )}

          {s.error_message && (
            <p className="text-xs text-red-400 mt-3">
              Error: {s.error_message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}