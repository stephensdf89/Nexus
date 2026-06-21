import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#111] border-r border-[#222] p-6">
      <h1 className="text-2xl font-bold mb-8">Creator Nexus</h1>

      <nav className="flex flex-col gap-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/pipelines">Pipelines</Link>
        <Link href="/analytics">Analytics</Link>
        <Link href="/community">Community</Link>
        <Link href="/settings">Settings</Link>
      </nav>
    </div>
  );
}
