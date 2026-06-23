import type { ReactNode } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function AppShell({
  children,
  showSidebar = true,
  contentClassName,
}: {
  children: ReactNode;
  showSidebar?: boolean;
  contentClassName?: string;
}) {
  return (
    <div className="flex min-h-screen bg-transparent text-white">
      {showSidebar && <Sidebar />}
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className={contentClassName ?? "flex-1 p-6 md:p-8"}>{children}</main>
      </div>
    </div>
  );
}