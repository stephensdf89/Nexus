import Link from "next/link";

export const metadata = {
  title: "About | Content Creator Nexus",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-transparent px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-2xl border border-cyan-400/35 bg-[rgba(9,25,66,0.82)] p-8 shadow-[0_16px_50px_rgba(0,194,255,0.18)]">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">About Creator Nexus</p>
          <h1 className="mt-3 text-4xl font-bold text-cyan-100 md:text-5xl">
            Built to run your creator operation from one cockpit
          </h1>
          <p className="mt-4 max-w-3xl text-cyan-100/80">
            Content Creator Nexus brings publishing, analytics, community workflows, and automations into one secure workspace so creators can ship faster with less context switching.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-400/30 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-cyan-200">Mission</h2>
            <p className="mt-2 text-sm text-cyan-100/75">Help creators move from reactive posting to repeatable systems and measurable growth.</p>
          </article>
          <article className="rounded-xl border border-cyan-400/30 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-cyan-200">Platform Focus</h2>
            <p className="mt-2 text-sm text-cyan-100/75">Scheduling, performance analytics, workflow automations, and collaboration tooling.</p>
          </article>
          <article className="rounded-xl border border-cyan-400/30 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-cyan-200">Security First</h2>
            <p className="mt-2 text-sm text-cyan-100/75">Role-based access, owner controls, and audit logging are built into the app architecture.</p>
          </article>
        </section>

        <section className="rounded-xl border border-violet-400/35 bg-violet-500/10 p-6">
          <h2 className="text-2xl font-semibold text-violet-200">Need Docs or Help?</h2>
          <p className="mt-2 text-sm text-violet-100/80">
            Browse support docs, setup guides, and legal information from the support hub.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/support" className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 font-semibold text-slate-950">
              Open Support Hub
            </Link>
            <Link href="/terms" className="rounded-lg border border-cyan-300/40 px-4 py-2 text-cyan-100 hover:bg-cyan-500/10">
              Terms of Service
            </Link>
            <Link href="/privacy" className="rounded-lg border border-cyan-300/40 px-4 py-2 text-cyan-100 hover:bg-cyan-500/10">
              Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
