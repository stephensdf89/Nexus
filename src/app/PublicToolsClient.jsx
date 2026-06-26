"use client";

const FEATURES = [
  {
    title: "Auto-Generate Cards",
    description: "Turn a topic into a high-performing content draft in seconds.",
    tag: "AI Writing"
  },
  {
    title: "30-Day Calendar",
    description: "Build a complete month of posts with strategic topic coverage.",
    tag: "Planning"
  },
  {
    title: "Best-Time Scheduling",
    description: "Schedule posts when your audience is most likely to engage.",
    tag: "Automation"
  },
  {
    title: "Theme Clustering",
    description: "Organize ideas into content pillars and discover missing angles.",
    tag: "Strategy"
  },
  {
    title: "Series Builder",
    description: "Expand winners into multi-part content series that compound reach.",
    tag: "Growth"
  },
  {
    title: "Cross-Platform Posting",
    description: "Manage post flow across Instagram, TikTok, YouTube, and more.",
    tag: "Publishing"
  }
];

export default function PublicToolsClient() {
  return (
    <section className="mx-auto mt-10 w-full max-w-5xl rounded-2xl border border-cyan-400/25 bg-[rgba(4,14,38,0.8)] p-8 shadow-[0_20px_60px_rgba(0,194,255,0.12)] backdrop-blur-sm">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Platform Preview</p>
          <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">What You Can Run Inside The Dashboard</h2>
        </div>
        <a
          href="/login"
          className="rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
        >
          Open Dashboard
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="rounded-xl border border-cyan-400/20 bg-[rgba(7,24,58,0.7)] p-5 shadow-[0_10px_25px_rgba(0,194,255,0.08)]"
          >
            <span className="inline-block rounded-full border border-cyan-300/40 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
              {feature.tag}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-cyan-100/85">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
