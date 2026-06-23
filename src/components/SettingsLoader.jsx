"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/settingsStore";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsLoader() {
  const { detectDevice, getActiveSettings, update, syncFromServer } = useSettingsStore();
  const {
    highContrast,
    textSize,
    colorBlindMode,
    reducedMotion,
    disableNeon,
    safeMode,
    theme,
  } = useSettingsStore();

  // Detect and record device on mount
  useEffect(() => {
    update("device", detectDevice());
  }, []);

  // Sync from Supabase once on mount (non-blocking; localStorage already applied)
  useEffect(() => {
    const trySync = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        syncFromServer();
      }
    };
    trySync();
  }, []);

  useEffect(() => {
    // Apply settings to <body>
    const active = getActiveSettings(useSettingsStore.getState());

    const classes = [
      `theme-${active.theme || "neon"}`,
      active.highContrast ? "hc-mode" : "",
      active.textSize === "large"
        ? "text-lg"
        : active.textSize === "small"
        ? "text-sm"
        : "",
      active.colorBlindMode !== "none" ? `cb-${active.colorBlindMode}` : "",
      active.safeMode ? "safe-mode" : "",
      active.reducedMotion ? "reduced-motion" : "",
      active.disableNeon ? "no-neon" : "",
    ].filter(Boolean);

    document.body.className = classes.join(" ");
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
