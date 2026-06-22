"use client";

import { useEffect } from "react";
import { useA11yStore } from "@/lib/accessibilityStore";

export default function AccessibilityLoader() {
  const {
    highContrast,
    textSize,
    colorBlindMode,
    reducedMotion,
    disableNeon,
    safeMode,
    load,
  } = useA11yStore();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    document.body.className = `
      ${highContrast ? "hc-mode" : ""}
      ${textSize === "large" ? "text-lg" : textSize === "small" ? "text-sm" : ""}
      ${colorBlindMode !== "none" ? `cb-${colorBlindMode}` : ""}
      ${disableNeon ? "no-neon" : ""}
      ${safeMode ? "safe-mode" : ""}
      ${reducedMotion ? "reduced-motion" : ""}
    `;
  }, [highContrast, textSize, colorBlindMode, disableNeon, safeMode, reducedMotion]);

  return null;
}
