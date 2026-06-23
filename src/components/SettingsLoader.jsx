"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSettingsStore } from "@/lib/settingsStore";

export default function SettingsLoader() {
  const { data: session } = useSession();
  const {
    highContrast,
    textSize,
    colorBlindMode,
    reducedMotion,
    disableNeon,
    safeMode,
    theme,
    load,
    syncFromServer,
  } = useSettingsStore();

  useEffect(() => {
    // Load saved settings from localStorage on startup
    load();

    // If user is authenticated, sync from database
    if (session?.user) {
      syncFromServer();
    }
  }, [session, load, syncFromServer]);

  useEffect(() => {
    // Apply settings to <body>
    document.body.className = `
      theme-neon
      ${highContrast ? "hc-mode" : ""}
      ${textSize === "large" ? "text-lg" : textSize === "small" ? "text-sm" : ""}
      ${colorBlindMode !== "none" ? `cb-${colorBlindMode}` : ""}
      ${disableNeon ? "no-neon" : ""}
      ${safeMode ? "safe-mode" : ""}
      ${reducedMotion ? "reduced-motion" : ""}
    `;
  }, [
    theme,
    highContrast,
    textSize,
    colorBlindMode,
    disableNeon,
    safeMode,
    reducedMotion,
  ]);

  return null;
}
