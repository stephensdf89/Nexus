import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#111] border-r border-[#222] p-6">
      <h1 className="text-2xl font-bold mb-8">Creator Nexus</h1>

      <nav className="flex flex-col gap-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/pipelines">Pipelines</Link>
        <Link href="/dashboard/analytics">Analytics</Link>
        <Link href="/dashboard/community">Community</Link>
        <Link href="/dashboard/settings">Settings</Link>
      </nav>
    </div>
  );
}
