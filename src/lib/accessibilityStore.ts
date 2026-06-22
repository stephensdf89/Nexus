"use client";

import { create } from "zustand";

export interface A11yPreferences {
  highContrast: boolean;
  textSize: "small" | "medium" | "large";
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  reducedMotion: boolean;
  disableNeon: boolean;
  safeMode: boolean;
}

interface A11yStore extends A11yPreferences {
  load: () => void;
  update: (key: keyof A11yPreferences, value: any) => void;
}

const STORAGE_KEY = "a11y-global";

const DEFAULT_PREFS: A11yPreferences = {
  highContrast: false,
  textSize: "medium",
  colorBlindMode: "none",
  reducedMotion: false,
  disableNeon: false,
  safeMode: false,
};

export const useA11yStore = create<A11yStore>((set) => ({
  ...DEFAULT_PREFS,

  // Load saved settings from localStorage
  load: () => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set(parsed);

        // Detect system reduced motion and merge
        const systemReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        if (systemReducedMotion && !parsed.reducedMotion) {
          set({ reducedMotion: true });
        }
      }
    } catch (error) {
      console.error("Failed to load accessibility preferences:", error);
    }
  },

  // Update and persist settings
  update: (key, value) =>
    set((state) => {
      const updated = { ...state, [key]: value };
      
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error("Failed to save accessibility preferences:", error);
        }
      }

      return updated;
    }),
}));
