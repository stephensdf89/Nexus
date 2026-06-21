import AppShell from "@/components/AppShell";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              Display Name
              <input className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3" defaultValue="Creator Name" />
            </label>
            <label className="text-sm">
              Email
              <input className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3" defaultValue="creator@nexus.app" />
            </label>
          </div>
        </article>

        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="mt-2 text-sm text-zinc-400">Theme toggle placeholder (dark mode active)</p>
          <button className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm">Toggle Theme</button>
        </article>

        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
          <h2 className="text-lg font-semibold">Connected Platforms</h2>
          <p className="mt-2 text-sm text-zinc-400">Connect YouTube, Instagram, TikTok, and Newsletter providers.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["YouTube", "Instagram", "TikTok", "Newsletter"].map((platform) => (
              <button key={platform} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm">
                Connect {platform}
              </button>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}