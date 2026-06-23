"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/settingsStore";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsLoader() {
  const { detectDevice, getActiveSettings } = useSettingsStore();
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
    // Always load from localStorage first for instant apply
    load();

    // Then sync from server if a Supabase session exists
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
