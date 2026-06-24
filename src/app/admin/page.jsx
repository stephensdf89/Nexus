"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import OwnerAppControlsPanel from "@/components/OwnerAppControlsPanel";
import OwnerMemberAccessPanel from "@/components/OwnerMemberAccessPanel";
import OwnerAuditLogPanel from "@/components/OwnerAuditLogPanel";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/access/me");
        if (!res.ok) {
          setIsOwner(false);
          return;
        }

        const data = await res.json();
        setIsOwner(Boolean(data?.isOwner));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <p className="text-gray-400">Loading admin center...</p>
      </AppShell>
    );
  }

  if (!isOwner) {
    return (
      <AppShell>
        <div className="max-w-2xl rounded-2xl border border-red-500/30 bg-black/80 p-6 shadow-[0_0_24px_rgba(255,0,0,0.18)]">
          <h1 className="text-2xl font-bold text-red-400">Admin Center</h1>
          <p className="mt-2 text-sm text-gray-300">
            You do not have owner access for this workspace.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-cyan-100">Admin Center</h1>
          <p className="mt-1 text-sm text-gray-400">
            Control app-wide settings, member access, and security audit history.
          </p>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <OwnerAppControlsPanel />
          <OwnerMemberAccessPanel />
          <OwnerAuditLogPanel />
        </section>
      </div>
    </AppShell>
  );
}