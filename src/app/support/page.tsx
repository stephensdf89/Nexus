import Link from "next/link";
import { SUPPORT_DOCS } from "@/lib/supportDocs";

export const metadata = {
  title: "Support | Content Creator Nexus",
};

export default function SupportPage() {
  const categories = {
    setup: "Setup",
    deployment: "Deployment",
    reference: "Reference",
    policy: "Policy",
  } as const;

  return (
    <main className="min-h-screen bg-transparent px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-cyan-400/35 bg-[rgba(9,25,66,0.82)] p-8 shadow-[0_16px_50px_rgba(0,194,255,0.18)]">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Support Hub</p>
          <h1 className="mt-3 text-4xl font-bold text-cyan-100 md:text-5xl">Documentation and support resources</h1>
          <p className="mt-4 max-w-3xl text-cyan-100/80">
            Open setup documents, deployment guides, and legal pages from one place. All document links below render inside the app.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/about" className="rounded-lg border border-cyan-300/40 px-4 py-2 text-cyan-100 hover:bg-cyan-500/10">
              About
            </Link>
            <Link href="/terms" className="rounded-lg border border-cyan-300/40 px-4 py-2 text-cyan-100 hover:bg-cyan-500/10">
              Terms
            </Link>
            <Link href="/privacy" className="rounded-lg border border-cyan-300/40 px-4 py-2 text-cyan-100 hover:bg-cyan-500/10">
              Privacy
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {SUPPORT_DOCS.map((doc) => (
            <article key={doc.slug} className="rounded-xl border border-cyan-400/30 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-cyan-200">{doc.title}</h2>
                <span className="rounded-full border border-cyan-300/40 px-2 py-0.5 text-xs text-cyan-100/75">
                  {categories[doc.category]}
                </span>
              </div>
              <p className="mt-2 text-sm text-cyan-100/75">{doc.description}</p>
              <Link
                href={`/support/docs/${doc.slug}`}
                className="mt-4 inline-flex rounded-lg bg-cyan-500/15 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/25"
              >
                Open document
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
