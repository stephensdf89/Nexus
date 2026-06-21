import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Published This Week", value: "12" },
            { label: "Scheduled Posts", value: "18" },
            { label: "Active Pipelines", value: "6" },
            { label: "Unread Alerts", value: "4" },
          ].map((card) => (
            <article key={card.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
              <p className="text-sm text-zinc-400">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#ff3360]">{card.value}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Recent Posts</h2>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              <li className="rounded-lg bg-zinc-900 p-3">YouTube: &quot;Creator System Setup&quot; scheduled for tomorrow</li>
              <li className="rounded-lg bg-zinc-900 p-3">Instagram Reel: &quot;Workflow in 30s&quot; published 2h ago</li>
              <li className="rounded-lg bg-zinc-900 p-3">Newsletter: &quot;Weekly Creator Ops&quot; in drafting</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Pipeline Preview</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-zinc-900 p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-400">Ideas</p>
                <p className="mt-2 text-sm">14 backlog concepts</p>
              </div>
              <div className="rounded-lg bg-zinc-900 p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-400">Editing</p>
                <p className="mt-2 text-sm">5 videos in progress</p>
              </div>
            </div>
          </article>
        </div>

        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <p className="mt-3 text-sm text-zinc-400">Engagement dropped on TikTok by 8% over the last 48 hours.</p>
        </article>
      </section>
    </AppShell>
  );
}