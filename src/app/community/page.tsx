import AppShell from "@/components/AppShell";

const posts = [
  {
    author: "Avery Miller",
    title: "How I batch 14 videos every month",
    body: "My workflow relies on one planning day and two execution days. Here is the template that keeps me consistent.",
  },
  {
    author: "Jordan Blake",
    title: "Quick tip: reusable thumbnails",
    body: "A modular thumbnail system helped me cut design time by 60 percent.",
  },
  {
    author: "Riley Chen",
    title: "Best time to publish shorts",
    body: "Our testing across three channels showed strongest retention between 6:30pm and 8:30pm local.",
  },
];

export default function CommunityPage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Community</h1>
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.title} className="rounded-xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-5 shadow-lg shadow-cyan-500/10">
              <p className="text-xs uppercase tracking-[0.12em] text-cyan-100/65">{post.author}</p>
              <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
              <p className="mt-3 text-sm text-cyan-100/80">{post.body}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}