"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import ConfirmModal from "@/components/ConfirmModal";
import { useSettingsStore } from "@/lib/settingsStore";

const sectionClass = "mb-10 rounded-xl border border-cyan-400/40 bg-slate-900/80 p-6 text-cyan-50";
const selectClass = "ml-2 rounded bg-slate-950/80 border border-cyan-400/60 px-2 py-1 text-cyan-50";
const resetButtonClass = "mt-4 rounded px-3 py-1 font-bold bg-violet-600 hover:bg-violet-500 text-white border border-violet-300/50";

export default function SettingsPage() {
  const {
    highContrast,
    textSize,
    colorBlindMode,
    reducedMotion,
    disableNeon,
    safeMode,
    compactMode,
    language,
    sidebarCollapsed,
    dashboardLayout,
    showAnalyticsPreview,
    showCreatorToolsPreview,
    notificationsEnabled,
    soundEnabled,
    vibrationEnabled,
    aiMode,
    update,
    resetAll,
    resetAccessibility,
    resetDashboard,
    resetNotifications,
    resetTheme,
    syncToDb,
  } = useSettingsStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const confirmReset = (action, message) => {
    setModalAction(() => action);
    setModalMessage(message);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await syncToDb();
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <AppShell>
      <div className="text-white">
        <ConfirmModal
          open={modalOpen}
          message={modalMessage}
          onCancel={() => setModalOpen(false)}
          onConfirm={() => {
            modalAction();
            setModalOpen(false);
          }}
        />

        <h1 className="mb-8 text-4xl font-bold text-cyan-200">Settings</h1>

        <section className={sectionClass}>
          <h2 className="mb-4 text-2xl font-bold">Theme</h2>
          <p className="mb-4 text-cyan-100/80">Theme profile: Neon (fixed)</p>

          <label className="mb-3 block">
            <input type="checkbox" checked={compactMode} onChange={() => update("compactMode", !compactMode)} /> Compact Mode
          </label>

          <label className="mb-3 block">
            Language:
            <select value={language} onChange={(e) => update("language", e.target.value)} className={selectClass}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </label>

          <button onClick={() => confirmReset(resetTheme, "Reset neon theme preferences?")} className={resetButtonClass}>
            Reset Theme Settings
          </button>
        </section>

        <section className={sectionClass}>
          <h2 className="mb-4 text-2xl font-bold">Accessibility</h2>

          <label className="mb-3 block">
            <input type="checkbox" checked={highContrast} onChange={() => update("highContrast", !highContrast)} /> High Contrast Mode
          </label>

          <label className="mb-3 block">
            Text Size:
            <select value={textSize} onChange={(e) => update("textSize", e.target.value)} className={selectClass}>
              <option value="small">Small</option>
              <option value="medium">Default</option>
              <option value="large">Large</option>
            </select>
          </label>

          <label className="mb-3 block">
            Color Blind Mode:
            <select value={colorBlindMode} onChange={(e) => update("colorBlindMode", e.target.value)} className={selectClass}>
              <option value="none">None</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
            </select>
          </label>

          <label className="mb-3 block">
            <input type="checkbox" checked={disableNeon} onChange={() => update("disableNeon", !disableNeon)} /> Disable Neon Effects
          </label>

          <label className="mb-3 block">
            <input type="checkbox" checked={safeMode} onChange={() => update("safeMode", !safeMode)} /> Seizure-Safe Mode
          </label>

          <label className="mb-3 block">
            <input type="checkbox" checked={reducedMotion} onChange={() => update("reducedMotion", !reducedMotion)} /> Reduced Motion
          </label>

          <button onClick={() => confirmReset(resetAccessibility, "Reset all accessibility settings?")} className={resetButtonClass}>
            Reset Accessibility Settings
          </button>
        </section>

        <section className={sectionClass}>
          <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>

          <label className="mb-3 block">
            Layout:
            <select value={dashboardLayout} onChange={(e) => update("dashboardLayout", e.target.value)} className={selectClass}>
              <option value="default">Default</option>
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          </label>

          <label className="mb-3 block">
            <input type="checkbox" checked={showAnalyticsPreview} onChange={() => update("showAnalyticsPreview", !showAnalyticsPreview)} /> Show Analytics Preview
          </label>

          <label className="mb-3 block">
            <input type="checkbox" checked={showCreatorToolsPreview} onChange={() => update("showCreatorToolsPreview", !showCreatorToolsPreview)} /> Show Creator Tools Preview
          </label>

          <label className="mb-3 block">
            <input type="checkbox" checked={sidebarCollapsed} onChange={() => update("sidebarCollapsed", !sidebarCollapsed)} /> Collapse Sidebar
          </label>

          <button onClick={() => confirmReset(resetDashboard, "Reset dashboard layout and widgets?")} className={resetButtonClass}>
            Reset Dashboard Settings
          </button>
        </section>

        <section className={sectionClass}>
          <h2 className="mb-4 text-2xl font-bold">Notifications</h2>

          <label className="mb-3 block">
            <input type="checkbox" checked={notificationsEnabled} onChange={() => update("notificationsEnabled", !notificationsEnabled)} /> Enable Notifications
          </label>

          <label className="mb-3 block">
            <input type="checkbox" checked={soundEnabled} onChange={() => update("soundEnabled", !soundEnabled)} /> Enable Sound
          </label>

          <label className="mb-3 block">
            <input type="checkbox" checked={vibrationEnabled} onChange={() => update("vibrationEnabled", !vibrationEnabled)} /> Enable Vibration
          </label>

          <button onClick={() => confirmReset(resetNotifications, "Reset all notification settings?")} className={resetButtonClass}>
            Reset Notification Settings
          </button>
        </section>

        <section className={sectionClass}>
          <h2 className="mb-4 text-2xl font-bold">AI Behavior</h2>
          <label className="mb-3 block">
            AI Mode:
            <select value={aiMode} onChange={(e) => update("aiMode", e.target.value)} className={selectClass}>
              <option value="standard">Standard</option>
              <option value="creative">Creative</option>
              <option value="strict">Strict</option>
            </select>
          </label>
        </section>

        <section className={sectionClass}>
          <h2 className="mb-4 text-2xl font-bold">Reset</h2>
          <button
            onClick={() => confirmReset(() => resetAll(), "Reset ALL settings across the entire site?")}
            className="rounded px-4 py-2 font-bold bg-violet-700 hover:bg-violet-600 text-white border border-violet-300/50"
          >
            Reset ALL Settings
          </button>
          <p className="mt-2 text-cyan-100/70">Restores all settings to their default values.</p>
        </section>

        <section className="fixed bottom-0 left-0 right-0 border-t border-cyan-400/40 bg-slate-900/95 p-6 flex items-center justify-between">
          <div>
            {isSaving && <span className="font-semibold text-cyan-300">Saving settings...</span>}
            {saveSuccess && !isSaving && <span className="font-semibold text-emerald-300">Settings saved to cloud!</span>}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`rounded px-6 py-2 font-bold ${
              isSaving
                ? "bg-slate-700 text-cyan-100 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 hover:from-cyan-400 hover:to-violet-500"
            }`}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </section>

        <div className="h-24" />
      </div>
    </AppShell>
  );
}
