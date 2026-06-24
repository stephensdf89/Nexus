"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebarCollapse } from "./CollapsibleSidebarWrapper";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/assistant", label: "Assistant" },
  { href: "/pipelines", label: "Pipelines" },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebarCollapse();
  const [canAdmin, setCanAdmin] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/access/me");
        if (!res.ok) {
          setCanAdmin(false);
          return;
        }

        const data = await res.json();
        setCanAdmin(Boolean(data?.isOwner) || data?.accessLevel === "admin");
      } catch {
        setCanAdmin(false);
      }
    };

    load();
  }, []);

  const items = [...navItems, ...(canAdmin ? [{ href: "/admin", label: "Admin" }] : [])];

  return (
    <aside className={`flex flex-col border-r border-cyan-400/35 bg-[rgba(10,20,58,0.82)] backdrop-blur-sm transition-all duration-300 ${
      sidebarCollapsed ? "w-20" : "w-72"
    }`}>
      <div className="flex items-center justify-between p-6">
        {!sidebarCollapsed && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Creator OS</p>
            <h1 className="mt-2 text-2xl font-bold">Content Creator Nexus</h1>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded hover:bg-cyan-500/20 transition-colors"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} className="text-cyan-300" />
          ) : (
            <ChevronLeft size={20} className="text-cyan-300" />
          )}
        </button>
      </div>

      <nav className={`flex flex-1 flex-col gap-2 ${sidebarCollapsed ? "px-2" : "px-6"} transition-all duration-300`}>
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-[#05163b] shadow-[0_8px_20px_rgba(0,194,255,0.35)]"
                  : "text-cyan-100/85 hover:bg-cyan-500/12 hover:text-cyan-200"
              } ${sidebarCollapsed ? "flex justify-center px-3" : ""}`}
            >
              {sidebarCollapsed ? item.label.charAt(0) : item.label}
            </Link>
          );
        })}
      </nav>

      {!sidebarCollapsed && (
        <div className="rounded-xl border border-cyan-400/35 bg-[rgba(13,30,76,0.75)] p-4 m-6 text-sm text-cyan-100/80">
          Protected creator workspace
        </div>
      )}
    </aside>
  );
}