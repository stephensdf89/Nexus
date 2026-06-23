"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSettingsStore } from "@/lib/settingsStore";

export default function SettingsLoader() {
  const { data: session } = useSession();
  const { detectDevice, device, getActiveSettings } = useSettingsStore();
  const {
    highContrast,
    textSize,
    colorBlindMode,
    reducedMotion,
    disableNeon,
    safeMode,
    theme,
    update,
    load,
    syncFromServer,
  } = useSettingsStore();

  useEffect(() => {
    const d = detectDevice();
    update("device", d);
  }, []);

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
    const active = getActiveSettings(useSettingsStore.getState());

    document.body.className = `
      theme-neon
      ${active.highContrast ? "hc-mode" : ""}
      ${active.textSize === "large" ? "text-lg" : active.textSize === "small" ? "text-sm" : ""}
      ${active.colorBlindMode !== "none" ? `cb-${active.colorBlindMode}` : ""}
      ${active.safeMode ? "safe-mode" : ""}
      ${active.reducedMotion ? "reduced-motion" : ""}
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
