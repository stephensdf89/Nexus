import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent px-6 text-white">
      <section className="w-full max-w-4xl rounded-2xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-10 shadow-[0_20px_60px_rgba(0,194,255,0.22)] backdrop-blur-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Content Creator Nexus</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Creator productivity platform for planning, publishing, and growth.
        </h1>
        <p className="mt-5 max-w-2xl text-cyan-100/80">
          Build your content pipeline, monitor analytics, and stay connected with your audience from one dark-mode workspace.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 font-semibold text-[#05163b] transition hover:from-cyan-400 hover:to-violet-500">
            Sign In
          </Link>
          <Link href="/signup" className="rounded-lg border border-cyan-400/45 bg-cyan-500/10 px-5 py-3 font-semibold transition hover:bg-cyan-500/20 hover:border-cyan-300">
            Create Account
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-cyan-100/75">
          <Link href="/about" className="hover:text-cyan-200">About</Link>
          <Link href="/support" className="hover:text-cyan-200">Support</Link>
          <Link href="/terms" className="hover:text-cyan-200">Terms</Link>
          <Link href="/privacy" className="hover:text-cyan-200">Privacy</Link>
        </div>
      </section>
    </main>
  );
}