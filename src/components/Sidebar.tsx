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
    <aside className="flex w-72 flex-col border-r border-cyan-400/35 bg-[rgba(10,20,58,0.82)] p-6 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Creator OS</p>
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
                  ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-[#05163b] shadow-[0_8px_20px_rgba(0,194,255,0.35)]"
                  : "text-cyan-100/85 hover:bg-cyan-500/12 hover:text-cyan-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-cyan-400/35 bg-[rgba(13,30,76,0.75)] p-4 text-sm text-cyan-100/80">
        Protected creator workspace
      </div>
    </aside>
  );
}