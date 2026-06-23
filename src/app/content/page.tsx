"use client";

import AppShell from "@/components/AppShell";
import ContentScheduler from "@/components/ContentScheduler";

export default function ContentPage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-100">Content Manager</h1>
          <p className="text-gray-400 text-sm mt-1">
            Schedule and manage content across all platforms
          </p>
        </div>

        <div className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-6 shadow-lg shadow-cyan-500/10">
          <ContentScheduler />
        </div>
      </section>
    </AppShell>
  );
}
