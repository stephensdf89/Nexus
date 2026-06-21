import AppShell from "@/components/AppShell";

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
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Pipelines</h1>

        <div className="grid gap-4 xl:grid-cols-5">
          {Object.entries(board).map(([column, cards]) => (
            <article key={column} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-lg">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">{column}</h2>
              <div className="mt-4 space-y-3">
                {cards.map((card) => (
                  <div key={card} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm">
                    {card}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}