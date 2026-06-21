"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pipelines", label: "Pipelines" },
  { href: "/analytics", label: "Analytics" },
  { href: "/community", label: "Community" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-[#222] bg-[#111] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-red-400">
          Creator OS
        </p>
        <h1 className="mb-8 mt-2 text-2xl font-bold text-white">Creator Nexus</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-3">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-red-600 text-white"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-[#222] bg-neutral-950 p-4 text-sm text-neutral-400">
        Protected workspace
      </div>
    </aside>
  );
}
