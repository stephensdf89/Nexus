"use client";

import { create } from "zustand";

let isSyncing = false;

export const useSettingsStore = create((set) => ({
  // ACCESSIBILITY
  highContrast: false,
  textSize: "medium",
  colorBlindMode: "none",
  reducedMotion: false,
  disableNeon: false,
  safeMode: false,

  // UI / THEME
  theme: "dark", // dark, light, system
  compactMode: false,
  language: "en",
  sidebarCollapsed: false,

  // DASHBOARD
  dashboardLayout: "default", // grid, list, custom
  showAnalyticsPreview: true,
  showCreatorToolsPreview: true,

  // NOTIFICATIONS
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: false,

  // AI BEHAVIOR
  aiMode: "standard", // standard, creative, strict

  load: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("global-settings");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        set(saved);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  },

  syncFromDb: async () => {
    if (typeof window === "undefined") return;
    try {
      const response = await fetch("/api/settings", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("Failed to sync from database, using localStorage fallback");
        return;
      }

      const { settings } = await response.json();
      if (settings && Object.keys(settings).length > 0) {
        set(settings);
        localStorage.setItem("global-settings", JSON.stringify(settings));
      }
    } catch (error) {
      console.error("Failed to sync settings from database:", error);
    }
  },

  syncToDb: async () => {
    if (isSyncing || typeof window === "undefined") return;
    isSyncing = true;

    try {
      const state = useSettingsStore.getState();
      const settings = {
        highContrast: state.highContrast,
        textSize: state.textSize,
        colorBlindMode: state.colorBlindMode,
        reducedMotion: state.reducedMotion,
        disableNeon: state.disableNeon,
        safeMode: state.safeMode,
        theme: state.theme,
        compactMode: state.compactMode,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
        dashboardLayout: state.dashboardLayout,
        showAnalyticsPreview: state.showAnalyticsPreview,
        showCreatorToolsPreview: state.showCreatorToolsPreview,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled,
        aiMode: state.aiMode,
      };

      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        console.error("Failed to sync to database");
      }
    } catch (error) {
      console.error("Failed to sync settings to database:", error);
    } finally {
      isSyncing = false;
    }
  },

  update: (key, value) =>
    set((state) => {
      const updated = { ...state, [key]: value };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("global-settings", JSON.stringify(updated));
        } catch (error) {
          console.error("Failed to save settings:", error);
        }
      }
      // Sync to database (async, non-blocking)
      useSettingsStore.getState().syncToDb();
      return updated;
    }),

  resetAccessibility: () =>
    set((state) => {
      const updated = {
        ...state,
        highContrast: false,
        textSize: "medium",
        colorBlindMode: "none",
        reducedMotion: false,
        disableNeon: false,
        safeMode: false,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("global-settings", JSON.stringify(updated));
      }
      useSettingsStore.getState().syncToDb();
      return updated;
    }),

  resetDashboard: () =>
    set((state) => {
      const updated = {
        ...state,
        dashboardLayout: "default",
        showAnalyticsPreview: true,
        showCreatorToolsPreview: true,
        sidebarCollapsed: false,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("global-settings", JSON.stringify(updated));
      }
      useSettingsStore.getState().syncToDb();
      return updated;
    }),

  resetNotifications: () =>
    set((state) => {
      const updated = {
        ...state,
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: false,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("global-settings", JSON.stringify(updated));
      }
      useSettingsStore.getState().syncToDb();
      return updated;
    }),

  resetTheme: () =>
    set((state) => {
      const updated = {
        ...state,
        theme: "dark",
        compactMode: false,
        language: "en",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("global-settings", JSON.stringify(updated));
      }
      useSettingsStore.getState().syncToDb();
      return updated;
    }),

  resetAll: () =>
    set((state) => {
      const defaults = {
        highContrast: false,
        textSize: "medium",
        colorBlindMode: "none",
        reducedMotion: false,
        disableNeon: false,
        safeMode: false,

        theme: "dark",
        compactMode: false,
        language: "en",
        sidebarCollapsed: false,

        dashboardLayout: "default",
        showAnalyticsPreview: true,
        showCreatorToolsPreview: true,

        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: false,

        aiMode: "standard",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("global-settings", JSON.stringify(defaults));
      }

      // Sync to database after reset
      useSettingsStore.getState().syncToDb();

      return defaults;
    }),
}));
