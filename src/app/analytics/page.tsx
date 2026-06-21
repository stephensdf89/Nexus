import AppShell from "@/components/AppShell";

const platformData = [
  { platform: "YouTube", value: 78 },
  { platform: "Instagram", value: 62 },
  { platform: "TikTok", value: 85 },
  { platform: "Newsletter", value: 41 },
];

export default function AnalyticsPage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Views", value: "248K" },
            { label: "Engagement Rate", value: "6.7%" },
            { label: "Follower Growth", value: "+3.2%" },
          ].map((metric) => (
            <article key={metric.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
              <p className="text-sm text-zinc-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#ff3360]">{metric.value}</p>
            </article>
          ))}
        </div>

        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
          <h2 className="text-lg font-semibold">Platform Performance</h2>
          <div className="mt-4 space-y-4">
            {platformData.map((entry) => (
              <div key={entry.platform}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{entry.platform}</span>
                  <span className="text-zinc-400">{entry.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full bg-[#ff0033]" style={{ width: `${entry.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}