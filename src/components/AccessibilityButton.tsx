"use client";

import { useState } from "react";
import { useSettingsStore } from "@/lib/settingsStore";

export default function AccessibilityButton() {
  const [showMenu, setShowMenu] = useState(false);
  const a11y = useSettingsStore();

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Open Accessibility Menu"
        aria-expanded={showMenu}
        className="px-3 py-2 rounded focus:outline-2 focus:outline-offset-2 bg-cyan-500 text-slate-950 focus:outline-cyan-400 font-semibold hover:bg-cyan-400 transition-colors"
      >
        A11y
      </button>

      {showMenu && (
        <div className="absolute top-12 right-0 p-4 rounded w-72 z-50 border-2 bg-slate-900/95 border-cyan-400/70 text-white shadow-lg">
          <h2 className="font-bold mb-4 text-lg">Accessibility Options</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <label className="flex items-center justify-between">
              <span>Text Size:</span>
              <select
                value={a11y.textSize}
                onChange={(e) => a11y.update("textSize", e.target.value)}
                className="ml-2 px-2 py-1 rounded border bg-slate-950 border-cyan-400/70 text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Default</option>
                <option value="large">Large</option>
              </select>
            </label>
            <label className="flex items-center justify-between">
              <span>Color Blind Mode:</span>
              <select
                value={a11y.colorBlindMode}
                onChange={(e) => a11y.update("colorBlindMode", e.target.value)}
                className="ml-2 px-2 py-1 rounded border bg-slate-950 border-cyan-400/70 text-white"
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              </select>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={a11y.disableNeon}
                onChange={() => a11y.update("disableNeon", !a11y.disableNeon)}
                className="mr-2 w-4 h-4 cursor-pointer"
              />
              <span>Disable Neon Effects</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={a11y.safeMode}
                onChange={() => a11y.update("safeMode", !a11y.safeMode)}
                className="mr-2 w-4 h-4 cursor-pointer"
              />
              <span>Seizure-Safe Mode</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={a11y.reducedMotion}
                onChange={() => a11y.update("reducedMotion", !a11y.reducedMotion)}
                className="mr-2 w-4 h-4 cursor-pointer"
              />
              <span>Reduced Motion</span>
            </label>
          </div>
          <button
            onClick={() => setShowMenu(false)}
            className="w-full mt-4 px-3 py-2 rounded border bg-violet-600 text-white border-violet-400/70 hover:bg-violet-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
