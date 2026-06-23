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
            <article key={metric.label} className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
              <p className="text-sm text-cyan-100/75">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">{metric.value}</p>
            </article>
          ))}
        </div>

        <article className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
          <h2 className="text-lg font-semibold">Platform Performance</h2>
          <div className="mt-4 space-y-4">
            {platformData.map((entry) => (
              <div key={entry.platform}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{entry.platform}</span>
                  <span className="text-cyan-100/70">{entry.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-cyan-500/15">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-600" style={{ width: `${entry.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}