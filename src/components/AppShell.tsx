import type { ReactNode } from "react";
import { Suspense } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CollapsibleSidebarWrapper from "@/components/CollapsibleSidebarWrapper";

export default function AppShell({
  children,
  showSidebar = true,
  contentClassName,
}: {
  children: ReactNode;
  showSidebar?: boolean;
  contentClassName?: string;
}) {
  if (!showSidebar) {
    // For pages like dashboard that handle their own layout
    return (
      <div className="flex min-h-screen bg-transparent text-white">
        <div className="flex min-h-screen flex-1 flex-col">
          <main className={contentClassName ?? "flex-1 p-6 md:p-8"}>{children}</main>
        </div>
      </div>
    );
  }

  // For pages using AppShell sidebar, wrap with collapsible functionality
  return (
    <CollapsibleSidebarWrapper>
      <div className="flex min-h-screen bg-transparent text-white">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className={contentClassName ?? "flex-1 p-6 md:p-8"}>{children}</main>
        </div>
      </div>
    </CollapsibleSidebarWrapper>
  );
}