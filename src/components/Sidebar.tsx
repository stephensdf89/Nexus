"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/pipelines", label: "Pipelines" },
  { href: "/community", label: "Community" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-72 flex-col border-r border-zinc-800 bg-zinc-950 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#ff0033]">Creator OS</p>
      <h1 className="mt-2 text-2xl font-bold">Content Creator Nexus</h1>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#ff0033] text-white shadow-[0_8px_20px_rgba(255,0,51,0.35)]"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
        Protected creator workspace
      </div>
    </aside>
  );
}