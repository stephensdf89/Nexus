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
    syncFromDb,
  } = useSettingsStore();

  useEffect(() => {
    // Load saved settings from localStorage on startup
    load();

    // If user is authenticated, sync from database
    if (session?.user) {
      syncFromDb();
    }
  }, [session, load, syncFromDb]);

  useEffect(() => {
    // Apply settings to <body>
    document.body.className = `
      ${theme === "dark" ? "theme-dark" : theme === "light" ? "theme-light" : ""}
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
