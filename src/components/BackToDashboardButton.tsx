"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackToDashboardButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || pathname === "/dashboard" || pathname.startsWith("/api")) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard")}
      className="fixed bottom-4 right-4 z-50 rounded-lg border px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_12px_rgba(0,229,255,0.25)]"
      style={{
        background: "rgba(3, 17, 38, 0.9)",
        borderColor: "rgba(0, 229, 255, 0.5)",
      }}
    >
      Back to Dashboard
    </button>
  );
}
