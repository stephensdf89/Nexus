"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  actor_email: string | null;
  event_type: "access_denied" | "access_granted" | "role_change" | "owner_check_failed";
  resource: string | null;
  required_level: string | null;
  current_level: string | null;
  success: boolean;
  target_user_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export default function OwnerAuditLogPanel() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/audit-logs?limit=40");
        if (!res.ok) {
          setLogs([]);
          return;
        }

        const data = await res.json();
        setLogs((data.logs || []) as AuditLog[]);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-violet-400/35 rounded-xl p-5 shadow-[0_0_18px_rgba(167,139,250,0.15)]">
        <h2 className="text-lg font-bold text-violet-300">Security Audit Log</h2>
        <p className="text-sm text-violet-100/70 mt-2">Loading audit logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/80 border border-violet-400/35 rounded-xl p-5 shadow-[0_0_18px_rgba(167,139,250,0.15)]">
      <h2 className="text-lg font-bold text-violet-300">Security Audit Log</h2>
      <p className="text-xs text-violet-100/60 mt-1">Recent role changes and blocked access attempts.</p>

      <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-violet-300/20 bg-violet-500/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-violet-100">{log.event_type}</p>
              <p className="text-xs text-violet-100/60">{new Date(log.created_at).toLocaleString()}</p>
            </div>
            <p className="text-xs text-violet-100/70 mt-1">
              Actor: {log.actor_email || "unknown"} | Resource: {log.resource || "n/a"}
            </p>
            {(log.required_level || log.current_level) && (
              <p className="text-xs text-violet-100/70 mt-1">
                Required: {log.required_level || "n/a"} | Current: {log.current_level || "n/a"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
