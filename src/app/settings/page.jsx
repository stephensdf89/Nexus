"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/lib/settingsStore";
import ConfirmModal from "@/components/ConfirmModal";

export default function SettingsPage() {
  const {
    highContrast,
    textSize,
    colorBlindMode,
    reducedMotion,
    disableNeon,
    safeMode,
    theme,
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
    setTimeout(() => setSaveSuccess(false), 3000); // Hide after 3 seconds
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <ConfirmModal
        open={modalOpen}
        message={modalMessage}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          modalAction();
          setModalOpen(false);
        }}
      />

      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      {/* THEME SETTINGS */}
      <section className="mb-10 bg-gray-900 p-6 rounded border border-red-600">
        <h2 className="text-2xl font-bold mb-4">Theme</h2>

        <label className="block mb-3">
          Theme:
          <select
            value={theme}
            onChange={(e) => update("theme", e.target.value)}
            className="ml-2 bg-black border border-red-600 p-1"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={compactMode}
            onChange={() => update("compactMode", !compactMode)}
          />{" "}
          Compact Mode
        </label>

        <label className="block mb-3">
          Language:
          <select
            value={language}
            onChange={(e) => update("language", e.target.value)}
            className="ml-2 bg-black border border-red-600 p-1"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </label>

        <button
          onClick={() =>
            confirmReset(resetTheme, "Reset all theme and UI settings?")
          }
          className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded font-bold mt-4"
        >
          Reset Theme Settings
        </button>
      </section>

      {/* ACCESSIBILITY SETTINGS */}
      <section className="mb-10 bg-gray-900 p-6 rounded border border-red-600">
        <h2 className="text-2xl font-bold mb-4">Accessibility</h2>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={() => update("highContrast", !highContrast)}
          />{" "}
          High Contrast Mode
        </label>

        <label className="block mb-3">
          Text Size:
          <select
            value={textSize}
            onChange={(e) => update("textSize", e.target.value)}
            className="ml-2 bg-black border border-red-600 p-1"
          >
            <option value="small">Small</option>
            <option value="medium">Default</option>
            <option value="large">Large</option>
          </select>
        </label>

        <label className="block mb-3">
          Color Blind Mode:
          <select
            value={colorBlindMode}
            onChange={(e) => update("colorBlindMode", e.target.value)}
            className="ml-2 bg-black border border-red-600 p-1"
          >
            <option value="none">None</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
          </select>
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={disableNeon}
            onChange={() => update("disableNeon", !disableNeon)}
          />{" "}
          Disable Neon Effects
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={safeMode}
            onChange={() => update("safeMode", !safeMode)}
          />{" "}
          Seizure-Safe Mode
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={() => update("reducedMotion", !reducedMotion)}
          />{" "}
          Reduced Motion
        </label>

        <button
          onClick={() =>
            confirmReset(resetAccessibility, "Reset all accessibility settings?")
          }
          className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded font-bold mt-4"
        >
          Reset Accessibility Settings
        </button>
      </section>

      {/* DASHBOARD SETTINGS */}
      <section className="mb-10 bg-gray-900 p-6 rounded border border-red-600">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

        <label className="block mb-3">
          Layout:
          <select
            value={dashboardLayout}
            onChange={(e) => update("dashboardLayout", e.target.value)}
            className="ml-2 bg-black border border-red-600 p-1"
          >
            <option value="default">Default</option>
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={showAnalyticsPreview}
            onChange={() =>
              update("showAnalyticsPreview", !showAnalyticsPreview)
            }
          />{" "}
          Show Analytics Preview
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={showCreatorToolsPreview}
            onChange={() =>
              update("showCreatorToolsPreview", !showCreatorToolsPreview)
            }
          />{" "}
          Show Creator Tools Preview
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={sidebarCollapsed}
            onChange={() => update("sidebarCollapsed", !sidebarCollapsed)}
          />{" "}
          Collapse Sidebar
        </label>

        <button
          onClick={() =>
            confirmReset(resetDashboard, "Reset dashboard layout and widgets?")
          }
          className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded font-bold mt-4"
        >
          Reset Dashboard Settings
        </button>
      </section>

      {/* NOTIFICATIONS */}
      <section className="mb-10 bg-gray-900 p-6 rounded border border-red-600">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => update("notificationsEnabled", !notificationsEnabled)}
          />{" "}
          Enable Notifications
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={() => update("soundEnabled", !soundEnabled)}
          />{" "}
          Enable Sound
        </label>

        <label className="block mb-3">
          <input
            type="checkbox"
            checked={vibrationEnabled}
            onChange={() => update("vibrationEnabled", !vibrationEnabled)}
          />{" "}
          Enable Vibration
        </label>

        <button
          onClick={() =>
            confirmReset(resetNotifications, "Reset all notification settings?")
          }
          className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded font-bold mt-4"
        >
          Reset Notification Settings
        </button>
      </section>

      {/* AI SETTINGS */}
      <section className="mb-10 bg-gray-900 p-6 rounded border border-red-600">
        <h2 className="text-2xl font-bold mb-4">AI Behavior</h2>

        <label className="block mb-3">
          AI Mode:
          <select
            value={aiMode}
            onChange={(e) => update("aiMode", e.target.value)}
            className="ml-2 bg-black border border-red-600 p-1"
          >
            <option value="standard">Standard</option>
            <option value="creative">Creative</option>
            <option value="strict">Strict</option>
          </select>
        </label>
      </section>

      {/* RESET ALL SETTINGS */}
      <section className="mb-10 bg-gray-900 p-6 rounded border border-red-600">
        <h2 className="text-2xl font-bold mb-4">Reset</h2>

        <button
          onClick={() =>
            confirmReset(
              () => resetAll(),
              "Reset ALL settings across the entire site?"
            )
          }
          className="bg-red-800 hover:bg-red-900 px-4 py-2 rounded font-bold"
        >
          Reset ALL Settings
        </button>

        <p className="text-gray-400 mt-2">
          Restores all settings to their default values.
        </p>
      </section>

      {/* SAVE BUTTON FOOTER */}
      <section className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-red-600 p-6 flex items-center justify-between">
        <div>
          {isSaving && (
            <span className="text-yellow-400 font-semibold">
              💾 Saving settings...
            </span>
          )}
          {saveSuccess && !isSaving && (
            <span className="text-green-400 font-semibold">
              ✓ Settings saved to cloud!
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 rounded font-bold ${
            isSaving
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-cyan-600 hover:bg-cyan-700"
          }`}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </section>

      {/* Spacer for fixed footer */}
      <div className="h-24" />
    </div>
  );
}
