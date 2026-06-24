"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const [canAdmin, setCanAdmin] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/analytics", label: "Analytics" },
    { href: "/pipelines", label: "Pipelines" },
    { href: "/community", label: "Community" },
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" },
    ...(canAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

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

  return (
    <nav className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2 border border-cyan-400/30">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
              isActive
                ? "bg-cyan-400/40 text-cyan-100 shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                : "text-gray-300 hover:text-cyan-300 hover:shadow-[0_0_6px_rgba(0,229,255,0.2)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
