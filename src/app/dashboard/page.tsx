"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/lib/settingsStore";

export default function Dashboard() {
  const a11y = useSettingsStore();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    a11y.load();
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 p-8 relative ${a11y.highContrast ? "bg-white text-black" : "bg-gradient-to-br from-[#050a1f] via-[#0b1c4d] to-[#2a0d5c] text-white"}`}>
      <a href="#main-dashboard" className="absolute top-2 left-2 bg-cyan-500 text-slate-950 px-3 py-1 rounded focus:outline-white z-40 sr-only focus:not-sr-only" aria-label="Skip to main dashboard content">Skip to content</a>

      <button onClick={() => setShowMenu(!showMenu)} aria-label="Open Accessibility Menu" aria-expanded={showMenu} className={`absolute top-4 right-4 px-3 py-2 rounded focus:outline-2 focus:outline-offset-2 ${a11y.highContrast ? "bg-black text-white border-2 border-black focus:outline-black" : "bg-cyan-500 text-slate-950 focus:outline-cyan-400"}`}>
        ♿ A11y
      </button>

      {showMenu && (
        <div className={`absolute top-16 right-4 p-4 rounded w-72 z-50 border-2 ${a11y.highContrast ? "bg-white text-black border-black" : "bg-slate-900/95 border-cyan-400/70 text-white"}`}>
          <h2 className="font-bold mb-4 text-lg">Accessibility Options</h2>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={a11y.highContrast} onChange={() => a11y.update('highContrast', !a11y.highContrast)} className="mr-2 w-4 h-4 cursor-pointer" />
              <span>High Contrast Mode</span>
            </label>
            <label className="flex items-center justify-between">
              <span>Text Size:</span>
              <select value={a11y.textSize} onChange={(e) => a11y.update('textSize', e.target.value)} className={`ml-2 px-2 py-1 rounded border ${a11y.highContrast ? "bg-white text-black border-black" : "bg-slate-950 border-cyan-400/70 text-white"}`}>
                <option value="small">Small</option>
                <option value="medium">Default</option>
                <option value="large">Large</option>
              </select>
            </label>
            <label className="flex items-center justify-between">
              <span>Color Blind Mode:</span>
              <select value={a11y.colorBlindMode} onChange={(e) => a11y.update('colorBlindMode', e.target.value)} className={`ml-2 px-2 py-1 rounded border ${a11y.highContrast ? "bg-white text-black border-black" : "bg-slate-950 border-cyan-400/70 text-white"}`}>
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              </select>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={a11y.disableNeon} onChange={() => a11y.update('disableNeon', !a11y.disableNeon)} className="mr-2 w-4 h-4 cursor-pointer" />
              <span>Disable Neon Effects</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={a11y.safeMode} onChange={() => a11y.update('safeMode', !a11y.safeMode)} className="mr-2 w-4 h-4 cursor-pointer" />
              <span>Seizure-Safe Mode</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={a11y.reducedMotion} onChange={() => a11y.update('reducedMotion', !a11y.reducedMotion)} className="mr-2 w-4 h-4 cursor-pointer" />
              <span>Reduced Motion</span>
            </label>
          </div>
          <button onClick={() => setShowMenu(false)} className={`w-full mt-4 px-3 py-2 rounded border ${a11y.highContrast ? "bg-black text-white border-black hover:bg-gray-800" : "bg-violet-600 text-white border-violet-400/70 hover:bg-violet-700"}`}>Close</button>
        </div>
      )}

      <main id="main-dashboard" className="mt-12 max-w-6xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-3">
          <img src="/logo.png" alt="Nexus logo" width="56" height="56" className="h-12 w-12 rounded-md ring-1 ring-cyan-300/40" />
          <h1 className="text-4xl font-bold">Dashboard</h1>
        </div>
        <p className={`mb-6 ${a11y.highContrast ? "text-gray-700" : "text-gray-300"}`}>Welcome to your creator control center. All your analytics, tools, and platform data will appear here.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Published This Week", value: "12" },
            { label: "Scheduled Posts", value: "18" },
            { label: "Active Pipelines", value: "6" },
            { label: "Unread Alerts", value: "4" },
          ].map((card) => (
            <article key={card.label} className={`rounded-lg p-5 border-2 ${a11y.highContrast ? "bg-white border-black text-black" : "bg-slate-900/85 border-cyan-400/40 text-white"}`}>
              <p className={a11y.highContrast ? "text-gray-700" : "text-gray-400"}>{card.label}</p>
              <p className={`mt-3 text-3xl font-bold ${a11y.highContrast ? "text-black" : "text-cyan-300"}`}>{card.value}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className={`rounded-lg p-6 border-2 ${a11y.highContrast ? "bg-white border-black text-black" : "bg-slate-900/85 border-cyan-400/40 text-white"}`}>
            <h2 className="text-xl font-bold mb-4">Analytics Overview</h2>
            <p className={a11y.highContrast ? "text-gray-700" : "text-gray-400"}>Your analytics will load here. Track engagement, reach, and audience growth across all platforms.</p>
          </article>

          <article className={`rounded-lg p-6 border-2 ${a11y.highContrast ? "bg-white border-black text-black" : "bg-slate-900/85 border-cyan-400/40 text-white"}`}>
            <h2 className="text-xl font-bold mb-4">Creator Tools</h2>
            <p className={a11y.highContrast ? "text-gray-700" : "text-gray-400"}>Access your content management tools, scheduling, and platform integrations here.</p>
          </article>

          <article className={`rounded-lg p-6 border-2 ${a11y.highContrast ? "bg-white border-black text-black" : "bg-slate-900/85 border-cyan-400/40 text-white"}`}>
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <ul className={`space-y-2 text-sm ${a11y.highContrast ? "text-gray-700" : "text-gray-400"}`}>
              <li>• Published Instagram Reel 2 hours ago</li>
              <li>• Scheduled YouTube video for tomorrow</li>
              <li>• Newsletter draft in progress</li>
            </ul>
          </article>

          <article className={`rounded-lg p-6 border-2 ${a11y.highContrast ? "bg-white border-black text-black" : "bg-slate-900/85 border-cyan-400/40 text-white"}`}>
            <h2 className="text-xl font-bold mb-4">Pipeline Status</h2>
            <ul className={`space-y-2 text-sm ${a11y.highContrast ? "text-gray-700" : "text-gray-400"}`}>
              <li>• Ideas: 14 backlog concepts</li>
              <li>• In Progress: 5 videos editing</li>
              <li>• Ready to Publish: 3 items</li>
            </ul>
          </article>
        </div>
      </main>
    </div>
  );
}
