"use client";

import AppShell from "@/components/AppShell";
import AccessLevelGate from "@/components/AccessLevelGate";

const board = {
  Ideas: ["30-day creator challenge", "Livestream workflow breakdown"],
  Drafting: ["YouTube script: content batching"],
  Editing: ["Podcast Episode 42", "Instagram carousel: growth metrics"],
  Scheduling: ["Weekly email sequence"],
  Published: ["Creator dashboard setup guide"],
};

export default function PipelinesPage() {
  return (
    <AppShell>
      <AccessLevelGate
        minimum="pro"
        blockedTitle="Pipelines requires Pro access"
        blockedDescription="Ask the account owner to upgrade your member access from the dashboard."
      >
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Pipelines</h1>

        <div className="grid gap-4 xl:grid-cols-5">
          {Object.entries(board).map(([column, cards]) => (
            <article key={column} className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-4 shadow-lg shadow-cyan-500/10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-100/70">{column}</h2>
              <div className="mt-4 space-y-3">
                {cards.map((card) => (
                  <div key={card} className="rounded-lg border border-cyan-400/35 bg-[rgba(14,33,82,0.78)] p-3 text-sm text-cyan-50">
                    {card}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      </AccessLevelGate>
    </AppShell>
  );
}