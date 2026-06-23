"use client";

import { create } from "zustand";

let isSyncing = false;

const BASE_SETTINGS = {
  // ACCESSIBILITY
  highContrast: false,
  textSize: "medium",
  colorBlindMode: "none",
  reducedMotion: false,
  disableNeon: false,
  safeMode: false,

  // UI / THEME
  theme: "neon",
  compactMode: false,
  language: "en",
  sidebarCollapsed: false,

  // DASHBOARD
  dashboardLayout: "default",
  showAnalyticsPreview: true,
  showCreatorToolsPreview: true,

  // NOTIFICATIONS
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: false,

  // AI BEHAVIOR
  aiMode: "standard",
};

const THEMES = ["neon", "ocean", "sunset", "graphite"];

function normalizeTheme(theme) {
  if (THEMES.includes(theme)) return theme;
  return "neon";
}

function enforceThemeDefaults(settings) {
  return {
    ...settings,
    theme: normalizeTheme(settings?.theme),
    disableNeon: Boolean(settings?.disableNeon),
  };
}

function pickBaseSettings(source) {
  const picked = {};
  for (const key of Object.keys(BASE_SETTINGS)) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      picked[key] = source[key];
    }
  }
  return picked;
}

function getActiveSettingsFromBuckets(state) {
  const currentDevice = state.device;

  if (currentDevice === "mobile" && Object.keys(state.mobileSettings).length) {
    return { ...state.globalSettings, ...state.mobileSettings };
  }

  if (currentDevice === "tablet" && Object.keys(state.tabletSettings).length) {
    return { ...state.globalSettings, ...state.tabletSettings };
  }

  if (currentDevice === "desktop" && Object.keys(state.desktopSettings).length) {
    return { ...state.globalSettings, ...state.desktopSettings };
  }

  return state.globalSettings;
}

function getPersistedShape(state) {
  return {
    globalSettings: state.globalSettings,
    desktopSettings: state.desktopSettings,
    mobileSettings: state.mobileSettings,
    tabletSettings: state.tabletSettings,
  };
}

function hydrateStateFromPayload(payload, detectedDevice) {
  const globalSettings = enforceThemeDefaults({
    ...BASE_SETTINGS,
    ...(payload?.globalSettings && typeof payload.globalSettings === "object"
      ? payload.globalSettings
      : pickBaseSettings(payload || {})),
  });

  const desktopSettings = enforceThemeDefaults(
    payload?.desktopSettings && typeof payload.desktopSettings === "object"
      ? payload.desktopSettings
      : {}
  );
  const mobileSettings = enforceThemeDefaults(
    payload?.mobileSettings && typeof payload.mobileSettings === "object"
      ? payload.mobileSettings
      : {}
  );
  const tabletSettings = enforceThemeDefaults(
    payload?.tabletSettings && typeof payload.tabletSettings === "object"
      ? payload.tabletSettings
      : {}
  );

  const bucketState = {
    globalSettings,
    desktopSettings,
    mobileSettings,
    tabletSettings,
    device: detectedDevice,
  };

  return {
    ...createDefaults(),
    ...getActiveSettingsFromBuckets(bucketState),
    ...bucketState,
  };
}

function persistLocal(state) {
  if (typeof window === "undefined") return;
  localStorage.setItem("global-settings", JSON.stringify(getPersistedShape(state)));
}

function detectDevice() {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function createDefaults() {
  return {
    ...BASE_SETTINGS,
    device: detectDevice(), // auto-detected
    globalSettings: { ...BASE_SETTINGS },
    desktopSettings: {},
    mobileSettings: {},
    tabletSettings: {},
  };
}

// Read from localStorage immediately so the store has the correct
// values on the very first render — no useEffect flash.
function initializeFromStorage() {
  if (typeof window === "undefined") return createDefaults();
  try {
    const raw = localStorage.getItem("global-settings");
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        return hydrateStateFromPayload(saved, detectDevice());
      }
    }
  } catch {}
  return createDefaults();
}

export const useSettingsStore = create((set) => ({
  ...initializeFromStorage(),

  detectDevice: () => {
    const width = window.innerWidth;

    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  },

  getActiveSettings: (state) => {
    return getActiveSettingsFromBuckets(state);
  },

  load: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("global-settings");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        set(hydrateStateFromPayload(saved, useSettingsStore.getState().detectDevice()));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  },

  syncFromServer: async () => {
    if (typeof window === "undefined") return;
    try {
      const accessToken = document.cookie
        .split("; ")
        .find((c) => c.startsWith("sb-access-token="))
        ?.split("=")[1];

      const headers = {};
      if (accessToken) {
        headers["x-supabase-auth"] = decodeURIComponent(accessToken);
      }

      const res = await fetch("/api/settings", {
        credentials: "include",
        headers,
      });
      if (!res.ok) return;

      const payload = await res.json();
      const serverSettings = payload?.settings ?? payload;
      if (!serverSettings || Object.keys(serverSettings).length === 0) return;

      // Only apply server settings when local storage is empty so that a
      // stale or empty server row never overwrites the user's local changes.
      const localRaw = localStorage.getItem("global-settings");
      if (localRaw) {
        // Local settings exist — push them to the server instead (local wins).
        useSettingsStore.getState().syncToServer();
        return;
      }

      const normalized = hydrateStateFromPayload(
        serverSettings,
        useSettingsStore.getState().detectDevice()
      );
      set(normalized);
      persistLocal(normalized);
    } catch (error) {
      console.error("Failed to sync settings from server:", error);
    }
  },

  syncToServer: async () => {
    if (isSyncing || typeof window === "undefined") return;
    isSyncing = true;

    try {
      const state = useSettingsStore.getState();
      const settings = getPersistedShape(state);

      // Read Supabase access token from cookie for server-side auth
      const accessToken = document.cookie
        .split("; ")
        .find((c) => c.startsWith("sb-access-token="))
        ?.split("=")[1];

      const headers = { "Content-Type": "application/json" };
      if (accessToken) {
        headers["x-supabase-auth"] = decodeURIComponent(accessToken);
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(settings),
      });

      if (!res.ok) return;

      const savedPayload = await res.json();
      const saved = savedPayload?.settings ?? savedPayload;
      const normalized = hydrateStateFromPayload(saved, useSettingsStore.getState().detectDevice());
      set(normalized);
      persistLocal(normalized);
    } catch (error) {
      console.error("Failed to sync settings to server:", error);
    } finally {
      isSyncing = false;
    }
  },

  update: (key, value) =>
    set((state) => {
      const normalizedValue = key === "theme" ? normalizeTheme(value) : value;

      const updated = {
        ...state,
        [key]: normalizedValue,
        globalSettings: {
          ...state.globalSettings,
          [key]: normalizedValue,
        },
      };

      if (state.device === "desktop") {
        updated.desktopSettings = {
          ...state.desktopSettings,
          [key]: normalizedValue,
        };
      }
      if (state.device === "mobile") {
        updated.mobileSettings = {
          ...state.mobileSettings,
          [key]: normalizedValue,
        };
      }
      if (state.device === "tablet") {
        updated.tabletSettings = {
          ...state.tabletSettings,
          [key]: normalizedValue,
        };
      }

      if (typeof window !== "undefined") {
        try {
          persistLocal(updated);
          useSettingsStore.getState().syncToServer();
        } catch (error) {
          console.error("Failed to save settings:", error);
        }
      } else {
        useSettingsStore.getState().syncToServer();
      }
      return updated;
    }),

  updateDeviceSetting: (key, value) =>
    set((state) => {
      const device = state.device;
      const updated = { ...state[`${device}Settings`], [key]: value };

      const newState = {
        ...state,
        [`${device}Settings`]: updated,
      };

      persistLocal(newState);
      return newState;
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
        persistLocal(updated);
      }
      useSettingsStore.getState().syncToServer();
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
        persistLocal(updated);
      }
      useSettingsStore.getState().syncToServer();
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
        persistLocal(updated);
      }
      useSettingsStore.getState().syncToServer();
      return updated;
    }),

  resetTheme: () =>
    set((state) => {
      const updated = {
        ...state,
        theme: "neon",
        compactMode: false,
        language: "en",
      };
      if (typeof window !== "undefined") {
        persistLocal(updated);
      }
      useSettingsStore.getState().syncToServer();
      return updated;
    }),

  resetAll: () =>
    set((state) => {
      const defaults = createDefaults();

      if (typeof window !== "undefined") {
        persistLocal(defaults);
      }

      // Sync to server after reset
      useSettingsStore.getState().syncToServer();

      return defaults;
    }),
}));
