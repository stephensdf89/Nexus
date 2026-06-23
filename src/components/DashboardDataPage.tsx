"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";

interface Notification {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
}

interface Pipeline {
  id: string;
  name: string;
  active: boolean;
  user_id: string;
  created_at: string;
}

interface PipelineRun {
  id: string;
  pipeline_id: string;
  started_at: string;
  status: string;
}

export default function DashboardDataPage() {
  const authContext = useUser();
  const user = authContext?.user;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);

  useEffect(() => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch notifications
        const { data: notif, error: notifError } = await supabase!
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (notifError) throw notifError;

        // Fetch pipelines
        const { data: pipes, error: pipesError } = await supabase!
          .from("pipelines")
          .select("*")
          .eq("user_id", user.id);

        if (pipesError) throw pipesError;

        // Fetch pipeline runs
        const pipelineIds = pipes?.map((p) => p.id) || [];
        let runs: PipelineRun[] = [];

        if (pipelineIds.length > 0) {
          const { data: runsData, error: runsError } = await supabase!
            .from("pipeline_runs")
            .select("*")
            .in("pipeline_id", pipelineIds)
            .order("started_at", { ascending: false })
            .limit(5);

          if (runsError) throw runsError;
          runs = runsData || [];
        }

        setNotifications(notif || []);
        setPipelines(pipes || []);
        setPipelineRuns(runs);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400 text-sm">Loading your cockpit...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 text-sm mb-2">Error loading dashboard</p>
            <p className="text-gray-400 text-xs">{error}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const totalPipelines = pipelines.length;
  const activePipelines = pipelines.filter((p) => p.active).length;
  const recentActivity = notifications;
  const recentRuns = pipelineRuns;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-cyan-100">Creator Nexus</h1>
          <p className="text-gray-400 text-sm mt-1">
            Your creator cockpit — analytics, tools, and automations in one place.
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard label="Total Pipelines" value={totalPipelines} change={`${activePipelines} active`} accent="cyan" />
          <SummaryCard label="Recent Notifications" value={recentActivity.length} change="Last 5" accent="cyan" />
          <SummaryCard label="Recent Runs" value={recentRuns.length} change="Last 5" accent="purple" />
        </section>

        {/* WIDGET GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardWidget title="Recent Activity">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications yet.</p>
            ) : (
              <ul className="text-sm text-gray-300 space-y-2">
                {recentActivity.map((n) => (
                  <li key={n.id} className="flex justify-between items-start">
                    <span>{n.message}</span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DashboardWidget>

          <DashboardWidget title="Pipelines Overview" span="lg:col-span-2">
            {pipelines.length === 0 ? (
              <p className="text-sm text-gray-500">No pipelines yet. Create your first automation.</p>
            ) : (
              <div className="space-y-2">
                {pipelines.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-2 bg-slate-950/50 rounded border border-cyan-400/20">
                    <span className="text-sm text-gray-300">{p.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${p.active ? "bg-cyan-500/20 text-cyan-300" : "bg-gray-500/20 text-gray-400"}`}>
                      {p.active ? "Active" : "Paused"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardWidget>

          <DashboardWidget title="Recent Runs" span="lg:col-span-3">
            {recentRuns.length === 0 ? (
              <p className="text-sm text-gray-500">No pipeline runs yet.</p>
            ) : (
              <div className="space-y-2">
                {recentRuns.map((run) => (
                  <div key={run.id} className="flex justify-between items-center p-2 bg-slate-950/50 rounded border border-cyan-400/20">
                    <span className="text-sm text-gray-300">{run.pipeline_id}</span>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        run.status === "success" ? "bg-emerald-500/20 text-emerald-300" :
                        run.status === "error" ? "bg-red-500/20 text-red-300" :
                        "bg-blue-500/20 text-blue-300"
                      }`}>
                        {run.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(run.started_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardWidget>
        </section>
      </div>
    </AppShell>
  );
}

function SummaryCard({ 
  label, 
  value, 
  change, 
  accent = "cyan" 
}: { 
  label: string
  value: number
  change: string
  accent?: "cyan" | "purple"
}) {
  const accentColor =
    accent === "cyan"
      ? "text-cyan-400"
      : "text-purple-400";

  return (
    <div className="bg-slate-900/80 border border-cyan-400/40 rounded-xl p-4 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className={`text-xs ${accentColor}`}>{change}</p>
    </div>
  );
}

function DashboardWidget({ 
  title, 
  span = "", 
  children 
}: { 
  title: string
  span?: string
  children: React.ReactNode
}) {
  return (
    <div className={`bg-slate-900/80 border border-cyan-400/40 rounded-xl p-5 shadow-[0_0_20px_rgba(0,229,255,0.15)] ${span}`}>
      <h2 className="text-lg font-bold mb-3 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
        {title}
      </h2>
      {children}
    </div>
  );
}
