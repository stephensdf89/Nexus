import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-6 text-white">
      <section className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <p className="text-sm uppercase tracking-[0.28em] text-[#ff0033]">Content Creator Nexus</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Creator productivity platform for planning, publishing, and growth.
        </h1>
        <p className="mt-5 max-w-2xl text-zinc-400">
          Build your content pipeline, monitor analytics, and stay connected with your audience from one dark-mode workspace.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-lg bg-[#ff0033] px-5 py-3 font-semibold transition hover:brightness-110">
            Sign In
          </Link>
          <Link href="/signup" className="rounded-lg border border-zinc-700 px-5 py-3 font-semibold transition hover:border-zinc-500">
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}