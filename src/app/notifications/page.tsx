"use client";

import { AuthGuard } from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import NotificationsCenter from "@/components/NotificationsCenter";

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <NotificationsCenter />
      </AppShell>
    </AuthGuard>
  );
}
