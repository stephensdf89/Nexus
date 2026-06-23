"use client";

import { AuthGuard } from "@/components/AuthGuard";
import DashboardPage from "@/components/DashboardPage";

export default function DashboardRoute() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}
