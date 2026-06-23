"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import ConfirmModal from "@/components/ConfirmModal";
import { useSettingsStore } from "@/lib/settingsStore";

export default function SettingsPage() {
  const [active, setActive] = useState("appearance");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    device,
    globalSettings,
    desktopSettings,
    mobileSettings,
    tabletSettings,
    theme,
    compactMode,
    language,
    highContrast,
    textSize,
    colorBlindMode,
    reducedMotion,
    disableNeon,
    safeMode,
    dashboardLayout,
    showAnalyticsPreview,
    showCreatorToolsPreview,
    notificationsEnabled,
    soundEnabled,
    vibrationEnabled,
    aiMode,
    update,
    resetAll,
    resetTheme,
    resetAccessibility,
    resetDashboard,
    resetNotifications,
    syncToServer,
  } = useSettingsStore();

  const confirmReset = (action, message) => {
    setModalAction(() => action);
    setModalMessage(message);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await syncToServer();
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyGlobalToDevice = () => {
    if (device === "global") return;
    const bucketKey = `${device}Settings`;
    useSettingsStore.setState((state) => ({
      ...state,
      ...state.globalSettings,
      [bucketKey]: { ...state.globalSettings },
    }));
    const next = useSettingsStore.getState();
    localStorage.setItem("global-settings", JSON.stringify(next));
    void syncToServer();
  };

  const handleResetDeviceSettings = () => {
    if (device === "global") return;
    const bucketKey = `${device}Settings`;
    useSettingsStore.setState((state) => ({
      ...state,
      ...state.globalSettings,
      [bucketKey]: {},
    }));
    const next = useSettingsStore.getState();
    localStorage.setItem("global-settings", JSON.stringify(next));
    void syncToServer();
  };

  const navItems = [
    "account",
    "profile",
    "connected",
    "notifications",
    "ai",
    "appearance",
    "language",
    "accessibility",
    "device-overrides",
    "dashboard",
    "security",
    "integrations",
    "billing",
    "backup",
    "about",
  ];

  return (
    <AppShell>
      <ConfirmModal
        open={modalOpen}
        message={modalMessage}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          modalAction();
          setModalOpen(false);
        }}
      />

      <div className="min-h-screen bg-slate-950 text-white flex">
        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-900 border-r border-cyan-400/40 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 text-cyan-200">Settings</h2>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`block w-full text-left px-4 py-2 rounded transition-all ${
                  active === item
                    ? "bg-gradient-to-r from-cyan-500/30 to-violet-600/30 border border-cyan-400/40 text-cyan-200 font-semibold"
                    : "text-cyan-100/70 hover:bg-slate-800 hover:text-cyan-200"
                }`}
              >
                {item
                  .replace("connected", "Connected Platforms")
                  .replace("ai", "AI Settings")
                  .replace("appearance", "Appearance / Themes")
                  .replace("device-overrides", "Device Overrides")
                  .replace("dashboard", "Dashboard Layout")
                  .replace("security", "Security & Privacy")
                  .replace("billing", "Billing & Subscription")
                  .replace("backup", "Backup & Sync")
                  .replace("about", "About / Support")
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN PANEL */}
        <main className="flex-1 p-10 pb-32">
          {active === "appearance" && (
            <AppearanceSettings
              theme={theme}
              compactMode={compactMode}
              language={language}
              update={update}
              resetTheme={() => confirmReset(resetTheme, "Reset appearance settings?")}
            />
          )}

          {active === "accessibility" && (
            <AccessibilitySettings
              highContrast={highContrast}
              textSize={textSize}
              colorBlindMode={colorBlindMode}
              reducedMotion={reducedMotion}
              disableNeon={disableNeon}
              safeMode={safeMode}
              update={update}
              resetAccessibility={() => confirmReset(resetAccessibility, "Reset accessibility settings?")}
            />
          )}

          {active === "dashboard" && (
            <DashboardSettings
              dashboardLayout={dashboardLayout}
              showAnalyticsPreview={showAnalyticsPreview}
              showCreatorToolsPreview={showCreatorToolsPreview}
              update={update}
              resetDashboard={() => confirmReset(resetDashboard, "Reset dashboard settings?")}
            />
          )}

          {active === "notifications" && (
            <NotificationSettings
              notificationsEnabled={notificationsEnabled}
              soundEnabled={soundEnabled}
              vibrationEnabled={vibrationEnabled}
              update={update}
              resetNotifications={() => confirmReset(resetNotifications, "Reset notification settings?")}
            />
          )}

          {active === "ai" && <AISettings aiMode={aiMode} update={update} />}

          {active === "device-overrides" && (
            <DeviceOverridesSettings
              device={device}
              globalSettings={globalSettings}
              desktopSettings={desktopSettings}
              mobileSettings={mobileSettings}
              tabletSettings={tabletSettings}
              update={update}
              onCopyGlobal={handleCopyGlobalToDevice}
              onResetDevice={handleResetDeviceSettings}
            />
          )}

          {/* PLACEHOLDERS FOR FUTURE FEATURES */}
          {active === "account" && <AccountSettings />}
          {active === "profile" && <Placeholder title="Profile Settings" />}
          {active === "connected" && <Placeholder title="Connected Platforms (Coming Soon)" />}
          {active === "language" && <Placeholder title="Language Settings" />}
          {active === "security" && <Placeholder title="Security & Privacy (Coming Soon)" />}
          {active === "integrations" && <Placeholder title="Integrations (Coming Soon)" />}
          {active === "billing" && <Placeholder title="Billing & Subscription (Coming Soon)" />}
          {active === "backup" && <Placeholder title="Backup & Sync (Coming Soon)" />}
          {active === "about" && <Placeholder title="About / Support" />}
        </main>
      </div>

      {/* FIXED FOOTER SAVE BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-cyan-400/40 bg-slate-900/95 backdrop-blur p-6 flex items-center justify-between">
        <div>
          {isSaving && <span className="font-semibold text-cyan-300">Saving settings...</span>}
          {saveSuccess && !isSaving && <span className="font-semibold text-emerald-300">Settings saved to cloud!</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`rounded px-6 py-2 font-bold transition-all ${
            isSaving
              ? "bg-slate-700 text-cyan-100 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 hover:from-cyan-400 hover:to-violet-500"
          }`}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </AppShell>
  );
}

/* COMPONENTS */

function Placeholder({ title }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-cyan-200">{title}</h1>
      <p className="text-cyan-100/60">This section is not implemented yet.</p>
    </div>
  );
}

function AppearanceSettings({ theme, compactMode, language, update, resetTheme }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-cyan-200">Appearance / Themes</h1>
      <p className="text-cyan-100/60 mb-6">Customize the visual appearance of the app.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Theme:</span>
          <select
            value={theme}
            onChange={(e) => update("theme", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-50 w-full"
          >
            <option value="neon">Neon</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Language:</span>
          <select
            value={language}
            onChange={(e) => update("language", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-50 w-full"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={compactMode}
            onChange={() => update("compactMode", !compactMode)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Compact Mode</span>
        </label>

        <button
          onClick={resetTheme}
          className="mt-6 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded font-bold text-white border border-violet-300/50"
        >
          Reset Appearance Settings
        </button>
      </div>
    </div>
  );
}

function AccessibilitySettings({
  highContrast,
  textSize,
  colorBlindMode,
  reducedMotion,
  disableNeon,
  safeMode,
  update,
  resetAccessibility,
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-cyan-200">Accessibility</h1>
      <p className="text-cyan-100/60 mb-6">Customize accessibility options for your needs.</p>

      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={() => update("highContrast", !highContrast)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">High Contrast Mode</span>
        </label>

        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Text Size:</span>
          <select
            value={textSize}
            onChange={(e) => update("textSize", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-50 w-full"
          >
            <option value="small">Small</option>
            <option value="medium">Default</option>
            <option value="large">Large</option>
          </select>
        </label>

        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Color Blind Mode:</span>
          <select
            value={colorBlindMode}
            onChange={(e) => update("colorBlindMode", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-50 w-full"
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
            checked={disableNeon}
            onChange={() => update("disableNeon", !disableNeon)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Disable Neon Effects</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={safeMode}
            onChange={() => update("safeMode", !safeMode)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Seizure-Safe Mode</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={() => update("reducedMotion", !reducedMotion)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Reduced Motion</span>
        </label>

        <button
          onClick={resetAccessibility}
          className="mt-6 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded font-bold text-white border border-violet-300/50"
        >
          Reset Accessibility Settings
        </button>
      </div>
    </div>
  );
}

function DashboardSettings({
  dashboardLayout,
  showAnalyticsPreview,
  showCreatorToolsPreview,
  update,
  resetDashboard,
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-cyan-200">Dashboard Layout</h1>
      <p className="text-cyan-100/60 mb-6">Customize your dashboard appearance and content.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Layout:</span>
          <select
            value={dashboardLayout}
            onChange={(e) => update("dashboardLayout", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-50 w-full"
          >
            <option value="default">Default</option>
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showAnalyticsPreview}
            onChange={() => update("showAnalyticsPreview", !showAnalyticsPreview)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Show Analytics Preview</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showCreatorToolsPreview}
            onChange={() => update("showCreatorToolsPreview", !showCreatorToolsPreview)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Show Creator Tools Preview</span>
        </label>

        <button
          onClick={resetDashboard}
          className="mt-6 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded font-bold text-white border border-violet-300/50"
        >
          Reset Dashboard Settings
        </button>
      </div>
    </div>
  );
}

function NotificationSettings({
  notificationsEnabled,
  soundEnabled,
  vibrationEnabled,
  update,
  resetNotifications,
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-cyan-200">Notifications</h1>
      <p className="text-cyan-100/60 mb-6">Manage notification preferences.</p>

      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => update("notificationsEnabled", !notificationsEnabled)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Enable Notifications</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={() => update("soundEnabled", !soundEnabled)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Enable Sound</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={vibrationEnabled}
            onChange={() => update("vibrationEnabled", !vibrationEnabled)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="ml-3 text-cyan-100">Enable Vibration</span>
        </label>

        <button
          onClick={resetNotifications}
          className="mt-6 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded font-bold text-white border border-violet-300/50"
        >
          Reset Notification Settings
        </button>
      </div>
    </div>
  );
}

function AISettings({ aiMode, update }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-cyan-200">AI Settings</h1>
      <p className="text-cyan-100/60 mb-6">Configure AI behavior and mode.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">AI Mode:</span>
          <select
            value={aiMode}
            onChange={(e) => update("aiMode", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-50 w-full"
          >
            <option value="standard">Standard</option>
            <option value="creative">Creative</option>
            <option value="strict">Strict</option>
          </select>
        </label>
      </div>
    </div>
  );
}

function DeviceOverridesSettings({
  device,
  globalSettings,
  desktopSettings,
  mobileSettings,
  tabletSettings,
  update,
  onCopyGlobal,
  onResetDevice,
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-cyan-200">Device-Specific Overrides</h1>
      <p className="text-cyan-100/60 mb-6">Manage settings per device type.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Apply changes to:</span>
          <select
            value={device}
            onChange={(e) => update("device", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-50 w-full"
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
            <option value="global">Global</option>
          </select>
        </label>

        <div className="bg-slate-900/50 border border-cyan-400/30 rounded p-4 text-sm text-cyan-100/70 space-y-1">
          <p>Global keys: {Object.keys(globalSettings || {}).length}</p>
          <p>Desktop overrides: {Object.keys(desktopSettings || {}).length}</p>
          <p>Mobile overrides: {Object.keys(mobileSettings || {}).length}</p>
          <p>Tablet overrides: {Object.keys(tabletSettings || {}).length}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCopyGlobal}
            disabled={device === "global"}
            className={`rounded px-4 py-2 font-bold border transition-all ${
              device === "global"
                ? "bg-slate-700/50 border-slate-500/40 text-slate-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-500 border-cyan-300/50 text-slate-950 font-semibold"
            }`}
          >
            Copy global settings to this device
          </button>

          <button
            onClick={onResetDevice}
            disabled={device === "global"}
            className={`rounded px-4 py-2 font-bold border transition-all ${
              device === "global"
                ? "bg-slate-700/50 border-slate-500/40 text-slate-400 cursor-not-allowed"
                : "bg-violet-700 hover:bg-violet-600 border-violet-300/50 text-white"
            }`}
          >
            Reset device settings
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-cyan-200">Account Settings</h1>
      <p className="text-cyan-100/60 mb-6">Manage your account information and security.</p>

      {/* ACCOUNT INFO */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4 text-cyan-200">Account Information</h2>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Display Name:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-50"
            placeholder="Your display name"
            disabled
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Username:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-50"
            placeholder="Your username"
            disabled
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Email:</span>
          <input
            type="email"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-50"
            placeholder="your@email.com"
            disabled
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Account ID:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-50"
            placeholder="ID-000000"
            disabled
          />
        </label>
      </section>

      {/* PASSWORD */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4 text-cyan-200">Password</h2>

        <button className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded font-bold mb-4 border border-violet-300/50 text-white">
          Change Password
        </button>

        <p className="text-cyan-100/60 mb-4">
          A password reset email will be sent to your account.
        </p>

        <button className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded font-semibold border border-cyan-300/50 text-slate-950">
          Send Password Reset Email
        </button>
      </section>

      {/* ACCOUNT STATUS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4 text-cyan-200">Account Status</h2>

        <p className="text-cyan-100 mb-2">
          <strong>Created:</strong> <span className="text-cyan-100/70">Placeholder</span>
        </p>
        <p className="text-cyan-100 mb-2">
          <strong>Last Login:</strong> <span className="text-cyan-100/70">Placeholder</span>
        </p>

        <p className="text-cyan-100/60 mt-4">
          Device list and login history will appear here.
        </p>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-violet-400/40">
        <h2 className="text-2xl font-bold mb-4 text-violet-400">Danger Zone</h2>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold mb-4 border border-violet-300/50 text-white">
          Delete Account
        </button>

        <p className="text-cyan-100/60 mb-6">
          This action is permanent and cannot be undone.
        </p>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded font-semibold mb-3 border border-slate-600/40 text-cyan-100">
          Export Account Data (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded font-semibold border border-slate-600/40 text-cyan-100">
          Disable Account (Coming Soon)
        </button>
      </section>
    </div>
  );
}
