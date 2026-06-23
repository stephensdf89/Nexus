"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  Bell,
  CloudUpload,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Globe,
  IdCard,
  Info,
  LayoutDashboard,
  Menu,
  Palette,
  PlugZap,
  Share2,
  ShieldCheck,
  UserCircle,
  Workflow,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import ConfirmModal from "@/components/ConfirmModal";
import FacebookIntegration from "@/components/FacebookIntegration";
import YouTubeIntegration from "@/components/YouTubeIntegration";
import TikTokIntegration from "@/components/TikTokIntegration";
import { useSettingsStore } from "@/lib/settingsStore";

export default function SettingsPage() {
  const [active, setActive] = useState("appearance");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setFiltered([]);
      return;
    }

    const lower = value.toLowerCase();

    const matches = Object.keys(searchIndex).filter((key) =>
      searchIndex[key].some((term) => term.includes(lower))
    );

    setFiltered(matches);
  };

  const sidebarOrder = [
    "account",
    "profile",
    "security",
    "connected",
    "pipelines",
    "dashboard",
    "appearance",
    "language",
    "notifications",
    "accessibility",
    "integrations",
    "backup",
    "billing",
    "about",
  ];

  useEffect(() => {
    const handleKey = (e) => {
      // DOWN ARROW
      if (e.key === "ArrowDown") {
        setFocusedIndex((prev) =>
          Math.min(prev + 1, sidebarOrder.length - 1)
        );
      }

      // UP ARROW
      if (e.key === "ArrowUp") {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }

      // ENTER selects the focused item
      if (e.key === "Enter") {
        setActive(sidebarOrder[focusedIndex]);
      }

      // ESC clears search
      if (e.key === "Escape") {
        setSearch("");
        setFiltered([]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusedIndex, sidebarOrder]);

  const searchIndex = {
    account: ["account", "email", "username", "password", "delete"],
    profile: ["profile", "bio", "avatar", "banner", "social", "handle"],
    connected: ["platforms", "facebook", "tiktok", "youtube", "instagram"],
    notifications: ["notifications", "alerts", "sound", "vibration"],
    ai: ["ai", "assistant", "model", "creative", "strict"],
    appearance: ["theme", "appearance", "neon", "dark mode", "compact"],
    language: ["language", "region", "timezone", "date", "format"],
    pipelines: ["pipelines", "automation", "workflow", "triggers", "actions"],
    dashboard: ["dashboard", "layout", "widgets", "grid", "custom"],
    accessibility: ["accessibility", "contrast", "text size", "color blind"],
    security: ["security", "privacy", "2fa", "sessions", "devices"],
    integrations: ["integrations", "api", "webhooks", "oauth"],
    billing: ["billing", "subscription", "payment", "invoices"],
    backup: ["backup", "sync", "export", "import"],
    about: ["about", "support", "help", "version", "status"],
  };

  const labelMap = {
    account: "Account",
    profile: "Profile",
    security: "Security & Privacy",
    connected: "Connected Platforms",
    pipelines: "Pipelines",
    dashboard: "Dashboard Layout",
    appearance: "Appearance / Themes",
    language: "Language & Region",
    notifications: "Notifications",
    accessibility: "Accessibility",
    integrations: "Integrations",
    backup: "Backup & Sync",
    billing: "Billing & Subscription",
    about: "About / Support",
  };

  const iconMap = {
    account: UserCircle,
    profile: IdCard,
    connected: Share2,
    notifications: Bell,
    ai: Sparkles,
    appearance: Palette,
    language: Globe,
    pipelines: Workflow,
    dashboard: LayoutDashboard,
    accessibility: Accessibility,
    security: ShieldCheck,
    integrations: PlugZap,
    billing: CreditCard,
    backup: CloudUpload,
    about: Info,
  };

  const renderButton = (key, label, Icon, index) => {
    const isFocused = index === focusedIndex;
    const isMatch = filtered.length === 0 || filtered.includes(key);

    return (
      <button
        key={key}
        onClick={() => {
          setActive(key);
          setSidebarOpen(false);
        }}
        className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all duration-200
        ${
          active === key
            ? "glow-neon bg-gradient-to-r from-[#00E5FF] via-[#3A7BFF] to-[#A45CFF] text-slate-950"
            : isFocused
            ? "bg-slate-800 text-cyan-50 shadow-[0_0_10px_rgba(0,229,255,0.35)]"
            : isMatch
            ? "text-cyan-100 hover:bg-slate-800"
            : "opacity-20 cursor-not-allowed"
        }
      `}
      >
        <Icon className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,229,255,0.45)]" />
        {label}
      </button>
    );
  };

  return (
    <AppShell showSidebar={false} contentClassName="flex-1 p-0">
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
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="fixed left-4 top-4 z-50 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,229,255,0.45)] md:hidden"
        >
          <Menu />
        </button>

        <button
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="fixed left-4 top-4 z-50 hidden rounded-lg border border-cyan-400/40 bg-slate-950/90 p-2 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.2)] backdrop-blur md:flex"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-cyan-400/30 bg-slate-950/95 backdrop-blur-md transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${sidebarCollapsed ? "md:-translate-x-full" : "md:translate-x-0"}`}
        >
          <div className="min-h-full p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-cyan-100">Settings</h2>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden rounded-lg border border-cyan-400/30 p-2 text-cyan-300 transition-colors hover:bg-slate-800 md:inline-flex"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* SEARCH BAR */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search settings..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    setActive(filtered[0]);
                    setSidebarOpen(false);
                  }
                }}
                className="w-full rounded-lg border border-cyan-400/40 bg-slate-950/80 p-2 text-cyan-100 placeholder-cyan-300/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:shadow-[0_0_12px_rgba(0,229,255,0.35)]"
              />
            </div>

            <nav className="space-y-2">
              {sidebarOrder.map((key, index) => {
                return renderButton(key, labelMap[key], iconMap[key], index);
              })}
              {search && filtered.length === 0 && (
                <div className="mt-2 text-sm text-cyan-300 drop-shadow-[0_0_6px_rgba(0,229,255,0.35)]">
                  No matching settings found.
                </div>
              )}
            </nav>
          </div>
        </aside>

        <div className={`flex-1 overflow-y-auto p-10 pb-32 transition-[margin] duration-300 ${sidebarCollapsed ? "md:ml-0" : "md:ml-72"}`}>
          <div className="flex items-center justify-between mb-6">
            <Breadcrumbs active={active} />
            <Link href="/dashboard" className="text-cyan-300 text-sm hover:text-cyan-100 transition-colors">
              ← Back to Dashboard
            </Link>
          </div>

          {active === "account" && <AccountSettings />}
          {active === "profile" && <ProfileSettings />}
          {active === "connected" && <ConnectedPlatforms />}
          {active === "notifications" && <NotificationSettings />}
          {active === "ai" && <AISettings />}
          {active === "appearance" && <AppearanceSettings />}
          {active === "language" && <LanguageSettings />}
          {active === "pipelines" && <PipelinesSettings />}
          {active === "dashboard" && <DashboardLayoutSettings />}
          {active === "accessibility" && <AccessibilitySettings />}
          {active === "security" && <SecuritySettings />}
          {active === "integrations" && <IntegrationsSettings />}
          {active === "billing" && <BillingSettings />}
          {active === "backup" && <BackupSyncSettings />}
          {active === "about" && <AboutSupportSettings />}
        </div>
      </div>

      {/* FIXED FOOTER SAVE BUTTON */}
      <div className={`fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/40 bg-slate-900/95 p-6 backdrop-blur transition-[left] duration-300 ${sidebarCollapsed ? "md:left-0" : "md:left-72"}`}>
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
              : "glow-neon bg-gradient-to-r from-[#00E5FF] via-[#3A7BFF] to-[#A45CFF] text-slate-950"
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
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <p className="text-cyan-100/70">This section is not implemented yet.</p>
    </div>
  );
}

function Breadcrumbs({ active }) {
  const labels = {
    account: "Account",
    profile: "Profile",
    connected: "Connected Platforms",
    notifications: "Notifications",
    ai: "AI Settings",
    appearance: "Appearance / Themes",
    language: "Language & Region",
    pipelines: "Pipelines",
    dashboard: "Dashboard Layout",
    accessibility: "Accessibility",
    security: "Security & Privacy",
    integrations: "Integrations",
    billing: "Billing & Subscription",
    backup: "Backup & Sync",
    about: "About / Support",
  };

  return (
    <div className="mb-6 flex items-center gap-2 text-sm text-cyan-300/70 drop-shadow-[0_0_6px_rgba(0,229,255,0.2)]">
      <span className="text-cyan-300">Settings</span>
      <span className="text-cyan-500/70">/</span>
      <span className="text-cyan-100">{labels[active]}</span>
    </div>
  );
}

function AppearanceSettings({ theme, compactMode, language, update, resetTheme }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Appearance / Themes</h1>
      <p className="text-cyan-100/70 mb-6">Customize the visual appearance of the app.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Theme:</span>
          <select
            value={theme}
            onChange={(e) => update("theme", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-100 w-full"
            disabled
          >
            <option value="neon">Neon</option>
          </select>
        </label>

        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Language:</span>
          <select
            value={language}
            onChange={(e) => update("language", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-100 w-full"
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
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
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
      <h1 className="text-3xl font-bold mb-6">Accessibility</h1>
      <p className="text-cyan-100/70 mb-6">Customize accessibility options for your needs.</p>

      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={() => update("highContrast", !highContrast)}
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
          />
          <span className="ml-3 text-cyan-100">High Contrast Mode</span>
        </label>

        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Text Size:</span>
          <select
            value={textSize}
            onChange={(e) => update("textSize", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-100 w-full"
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
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-100 w-full"
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
            onChange={() => update("disableNeon", false)}
            disabled
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
          />
          <span className="ml-3 text-cyan-100">Disable Neon Effects (Locked Off)</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={safeMode}
            onChange={() => update("safeMode", !safeMode)}
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
          />
          <span className="ml-3 text-cyan-100">Seizure-Safe Mode</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={() => update("reducedMotion", !reducedMotion)}
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
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
      <h1 className="text-3xl font-bold mb-6">Dashboard Layout</h1>
      <p className="text-cyan-100/70 mb-6">Customize your dashboard appearance and content.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Layout:</span>
          <select
            value={dashboardLayout}
            onChange={(e) => update("dashboardLayout", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-100 w-full"
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
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
          />
          <span className="ml-3 text-cyan-100">Show Analytics Preview</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showCreatorToolsPreview}
            onChange={() => update("showCreatorToolsPreview", !showCreatorToolsPreview)}
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
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

function DashboardLayoutSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Layout</h1>

      {/* LAYOUT MODE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Layout Mode</h2>

        <label className="block mb-4">
          Layout:
          <select className="ml-2 bg-slate-950/80 border border-cyan-400/40 p-1">
            <option value="default">Default</option>
            <option value="grid">Grid</option>
            <option value="list">List</option>
            <option value="custom">Custom (Coming Soon)</option>
          </select>
        </label>

        <p className="text-cyan-100/70">
          Choose how your dashboard widgets are arranged.
        </p>
      </section>

      {/* WIDGET TOGGLES */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Widgets</h2>

        <p className="text-cyan-100/70 mb-4">
          Enable or disable widgets on your dashboard.
        </p>

        {[
          "Analytics Overview",
          "Creator Tools",
          "Recent Activity",
          "Notifications",
          "Tasks",
          "Pipelines",
          "Monetization",
          "Audience Insights",
          "Content Performance",
          "Custom Widgets (Coming Soon)",
        ].map((widget) => (
          <label key={widget} className="block mb-3">
            <input type="checkbox" /> {widget}
          </label>
        ))}
      </section>

      {/* DEVICE-SPECIFIC LAYOUT */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Device Layouts</h2>

        <p className="text-cyan-100/70 mb-4">
          Customize your dashboard layout for each device type.
        </p>

        <label className="block mb-3">
          <input type="checkbox" /> Sync layout across all devices
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {["Desktop", "Tablet", "Mobile"].map((device) => (
            <div
              key={device}
              className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded"
            >
              <h3 className="text-xl font-semibold mb-3">{device} Layout</h3>
              <p className="text-cyan-100/70 mb-4">
                Customize widget positions for {device.toLowerCase()} view.
              </p>

              <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-2">
                Edit Layout (Coming Soon)
              </button>

              <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
                Reset {device} Layout
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* PREVIEW AREA */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Layout Preview</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-6 rounded h-64 flex items-center justify-center text-cyan-100/70">
          Drag-and-drop layout builder coming soon.
        </div>
      </section>

      {/* RESET ALL */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Reset Layout</h2>

        <button className="bg-violet-800 hover:bg-violet-700 px-4 py-2 rounded font-bold">
          Reset All Dashboard Layouts
        </button>

        <p className="text-cyan-100/70 mt-2">
          This will reset widget positions and layout modes for all devices.
        </p>
      </section>
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
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <p className="text-cyan-100/70 mb-6">Manage notification preferences.</p>

      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => update("notificationsEnabled", !notificationsEnabled)}
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
          />
          <span className="ml-3 text-cyan-100">Enable Notifications</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={() => update("soundEnabled", !soundEnabled)}
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
          />
          <span className="ml-3 text-cyan-100">Enable Sound</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={vibrationEnabled}
            onChange={() => update("vibrationEnabled", !vibrationEnabled)}
            className="w-4 h-4 rounded cursor-pointer toggle-neon"
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
      <h1 className="text-3xl font-bold mb-6">AI Settings</h1>
      <p className="text-cyan-100/70 mb-6">Configure AI behavior and mode.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">AI Mode:</span>
          <select
            value={aiMode}
            onChange={(e) => update("aiMode", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-100 w-full"
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
      <h1 className="text-3xl font-bold mb-6">Device-Specific Overrides</h1>
      <p className="text-cyan-100/70 mb-6">Manage settings per device type.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-cyan-100 font-semibold mb-2 block">Apply changes to:</span>
          <select
            value={device}
            onChange={(e) => update("device", e.target.value)}
            className="bg-slate-950/80 border border-cyan-400/60 px-3 py-2 rounded text-cyan-100 w-full"
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
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <p className="text-cyan-100/70 mb-6">Manage your account information and security.</p>

      {/* ACCOUNT INFO */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4">Account Information</h2>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Display Name:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="Your display name"
            disabled
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Username:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="Your username"
            disabled
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Email:</span>
          <input
            type="email"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="your@email.com"
            disabled
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Account ID:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="ID-000000"
            disabled
          />
        </label>
      </section>

      {/* PASSWORD */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4">Password</h2>

        <button className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded font-bold mb-4 border border-violet-300/50 text-white">
          Change Password
        </button>

        <p className="text-cyan-100/70 mb-4">
          A password reset email will be sent to your account.
        </p>

        <button className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded font-semibold border border-cyan-300/50 text-slate-950">
          Send Password Reset Email
        </button>
      </section>

      {/* ACCOUNT STATUS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4">Account Status</h2>

        <p className="text-cyan-100 mb-2">
          <strong>Created:</strong> <span className="text-cyan-100/70">Placeholder</span>
        </p>
        <p className="text-cyan-100 mb-2">
          <strong>Last Login:</strong> <span className="text-cyan-100/70">Placeholder</span>
        </p>

        <p className="text-cyan-100/70 mt-4">
          Device list and login history will appear here.
        </p>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-violet-400/40">
        <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold mb-4 border border-violet-300/50 text-white">
          Delete Account
        </button>

        <p className="text-cyan-100/70 mb-6">
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

function ProfileSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <p className="text-cyan-100/70 mb-6">Customize your creator profile and personal information.</p>

      {/* PROFILE IMAGES */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4">Profile Images</h2>

        <div className="flex items-center gap-6 mb-6">
          {/* PROFILE PICTURE */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-slate-800 border border-cyan-400/60 mb-3"></div>
            <button className="bg-violet-600 hover:bg-violet-500 px-3 py-2 rounded font-bold border border-violet-300/50 text-white text-sm">
              Change Photo
            </button>
          </div>

          {/* BANNER */}
          <div className="flex-1">
            <div className="w-full h-24 bg-slate-800 border border-cyan-400/60 mb-3 rounded"></div>
            <button className="bg-violet-600 hover:bg-violet-500 px-3 py-2 rounded font-bold border border-violet-300/50 text-white text-sm">
              Change Banner
            </button>
          </div>
        </div>
      </section>

      {/* BASIC INFO */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4">Basic Information</h2>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Display Name:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="Your display name"
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Username / Handle:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="@yourhandle"
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Bio:</span>
          <textarea
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100 h-24"
            placeholder="Tell people about yourself..."
          ></textarea>
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Pronouns:</span>
          <select className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100">
            <option value="none">Prefer not to say</option>
            <option value="he/him">He/Him</option>
            <option value="she/her">She/Her</option>
            <option value="they/them">They/Them</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </section>

      {/* SOCIAL LINKS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4">Social Links</h2>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Website:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="https://yourwebsite.com"
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Instagram:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="@username"
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">TikTok:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="@username"
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">YouTube:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="Channel URL"
          />
        </label>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Twitter / X:</span>
          <input
            type="text"
            className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100"
            placeholder="@username"
          />
        </label>
      </section>

      {/* CREATOR CATEGORY */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4">Creator Category</h2>

        <label className="block mb-4">
          <span className="text-cyan-100 font-semibold mb-2 block">Category:</span>
          <select className="w-full p-3 bg-slate-950/80 border border-cyan-400/60 rounded text-cyan-100">
            <option value="general">General Creator</option>
            <option value="gaming">Gaming</option>
            <option value="beauty">Beauty</option>
            <option value="fitness">Fitness</option>
            <option value="education">Education</option>
            <option value="music">Music</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="tech">Tech</option>
            <option value="other">Other</option>
          </select>
        </label>
      </section>

      {/* VISIBILITY */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-cyan-400/40">
        <h2 className="text-2xl font-bold mb-4">Profile Visibility</h2>

        <label className="flex items-center cursor-pointer mb-3">
          <input type="checkbox" className="w-4 h-4 rounded cursor-pointer toggle-neon" />
          <span className="ml-3 text-cyan-100">Make my profile public</span>
        </label>

        <label className="flex items-center cursor-pointer mb-3">
          <input type="checkbox" className="w-4 h-4 rounded cursor-pointer toggle-neon" />
          <span className="ml-3 text-cyan-100">Show my social links</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded cursor-pointer toggle-neon" />
          <span className="ml-3 text-cyan-100">Allow profile discovery</span>
        </label>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded border border-violet-400/40">
        <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold mb-4 border border-violet-300/50 text-white">
          Reset Profile
        </button>

        <p className="text-cyan-100/70">
          This will reset your profile information but will not delete your account.
        </p>
      </section>
    </div>
  );
}

function ConnectedPlatforms() {
  const otherPlatforms = [
    {
      name: "Instagram",
      color: "bg-[#A45CFF]",
      status: "Not Connected",
      button: "Connect",
    },
    {
      name: "TikTok",
      color: "bg-[#3A7BFF]",
      status: "Not Connected",
      button: "Connect",
    },
    {
      name: "YouTube",
      color: "bg-[#FF0033]",
      status: "Not Connected",
      button: "Connect",
    },
    {
      name: "Twitter / X",
      color: "bg-[#00E5FF]",
      status: "Not Connected",
      button: "Connect",
    },
    {
      name: "Twitch",
      color: "bg-[#A45CFF]",
      status: "Not Connected",
      button: "Connect",
    },
    {
      name: "LinkedIn",
      color: "bg-[#3A7BFF]",
      status: "Not Connected",
      button: "Connect",
    },
    {
      name: "Pinterest",
      color: "bg-[#FF0033]",
      status: "Not Connected",
      button: "Connect",
    },
    {
      name: "Reddit",
      color: "bg-[#00E5FF]",
      status: "Not Connected",
      button: "Connect",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Connected Platforms</h1>

      <p className="text-cyan-100/70 mb-8">
        Connect your social media accounts to enable analytics, scheduling,
        insights, and creator tools. More integrations coming soon.
      </p>

      {/* PLATFORM GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Facebook - Using Real Integration Component */}
        <FacebookIntegration />

        {/* YouTube - Using Real Integration Component */}
        <YouTubeIntegration />

        {/* TikTok - Using Real Integration Component */}
        <TikTokIntegration />

        {/* Other Platforms - Coming Soon */}
        {otherPlatforms.map((p) => (
          <div
            key={p.name}
            className="flex flex-col justify-between rounded border border-cyan-400/40 bg-slate-900/50 p-6"
          >
            <div>
              <div className={`mb-4 h-12 w-12 rounded-full icon-neon ${p.color}`}></div>

              <h2 className="text-xl font-semibold mb-3">{p.name}</h2>

              <p className="mb-4 text-cyan-100/70">
                Status: <span className="font-bold text-[#FF0033]">{p.status}</span>
              </p>
            </div>

            <button className="rounded bg-violet-700 px-4 py-2 font-bold hover:bg-violet-600">{p.button}</button>
          </div>
        ))}
      </div>

      {/* FUTURE INTEGRATIONS */}
      <section className="mt-12 rounded border border-cyan-400/40 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-2xl font-bold">Custom Integrations</h2>

        <p className="mb-4 text-cyan-100/70">
          API keys, webhooks, and custom platform integrations will appear here.
        </p>

        <button className="rounded bg-slate-800 px-4 py-2 hover:bg-slate-700">
          Add Custom Integration (Coming Soon)
        </button>
      </section>

      {/* PERMISSIONS */}
      <section className="mt-10 rounded border border-cyan-400/40 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-2xl font-bold">Permissions</h2>

        <p className="mb-4 text-cyan-100/70">
          Once connected, you'll be able to manage permissions, scopes, and
          access levels for each platform.
        </p>

        <button className="rounded bg-slate-800 px-4 py-2 hover:bg-slate-700">
          Manage Permissions (Coming Soon)
        </button>
      </section>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Security & Privacy</h1>

      {/* AUTHENTICATION */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold mb-4">
          Change Password
        </button>

        <p className="text-cyan-100/70 mb-6">
          A password reset email will be sent to your account.
        </p>

        <h3 className="text-xl font-semibold mb-3">Two-Factor Authentication (2FA)</h3>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Enable 2FA (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          View Backup Codes (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          Manage Login Alerts (Coming Soon)
        </button>
      </section>

      {/* DEVICE & SESSION MANAGEMENT */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Device & Session Management</h2>

        <p className="text-cyan-100/70 mb-4">
          View and manage devices currently logged into your account.
        </p>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded mb-4">
          <p className="text-cyan-100">No active sessions to display.</p>
        </div>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Refresh Sessions (Coming Soon)
        </button>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
          Log Out of All Devices
        </button>
      </section>

      {/* PRIVACY CONTROLS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Privacy Controls</h2>

        <label className="block mb-3">
          <input type="checkbox" /> Allow personalized recommendations
        </label>

        <label className="block mb-3">
          <input type="checkbox" /> Allow analytics tracking
        </label>

        <label className="block mb-3">
          <input type="checkbox" /> Allow usage data collection
        </label>

        <p className="text-cyan-100/70 mt-4">
          These settings control how your data is used to improve your experience.
        </p>
      </section>

      {/* DATA MANAGEMENT */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Data Management</h2>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Download My Data (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Request Data Export (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          Delete My Data (Coming Soon)
        </button>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>

        <button className="bg-violet-800 hover:bg-violet-700 px-4 py-2 rounded font-bold mb-4">
          Delete Account
        </button>

        <p className="text-cyan-100/70">
          This action is permanent and cannot be undone.
        </p>
      </section>
    </div>
  );
}

function BillingSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>

      {/* CURRENT PLAN */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Current Plan</h2>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xl font-semibold mb-3">Creator Nexus Free</p>
            <p className="text-cyan-100/70">You are currently on the free plan.</p>
          </div>

          <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
            Upgrade Plan
          </button>
        </div>

        <p className="text-cyan-100/70">
          Premium features, analytics, and automation tools will be available once you upgrade.
        </p>
      </section>

      {/* PAYMENT METHODS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Payment Methods</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded mb-4">
          <p className="text-cyan-100">No payment methods added.</p>
        </div>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
          Add Payment Method
        </button>
      </section>

      {/* BILLING HISTORY */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Billing History</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded">
          <p className="text-cyan-100">No invoices available.</p>
        </div>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mt-4">
          Refresh Billing History (Coming Soon)
        </button>
      </section>

      {/* PLAN OPTIONS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded border border-cyan-400/30 bg-slate-950/80 p-4">
            <h3 className="text-xl font-semibold mb-3">Free</h3>
            <p className="text-cyan-100/70 mb-4">Perfect for getting started.</p>
            <p className="text-2xl font-bold mb-4">$0/mo</p>
            <button className="w-full rounded bg-slate-800 px-4 py-2 hover:bg-slate-700">
              Current Plan
            </button>
          </div>

          <div className="rounded border border-cyan-400/40 bg-slate-950/80 p-4">
            <h3 className="text-xl font-semibold mb-3">Pro</h3>
            <p className="text-cyan-100/70 mb-4">Advanced analytics and automation.</p>
            <p className="text-2xl font-bold mb-4">$19/mo</p>
            <button className="w-full rounded bg-violet-700 px-4 py-2 font-bold hover:bg-violet-600">
              Upgrade to Pro
            </button>
          </div>

          <div className="rounded border border-cyan-400/30 bg-slate-950/80 p-4">
            <h3 className="text-xl font-semibold mb-3">Studio</h3>
            <p className="text-cyan-100/70 mb-4">Teams, permissions, and priority support.</p>
            <p className="text-2xl font-bold mb-4">$49/mo</p>
            <button className="w-full rounded bg-slate-800 px-4 py-2 hover:bg-slate-700">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION MANAGEMENT */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>

        <p className="text-cyan-100/70 mb-4">
          Manage renewals, cancel your plan, or apply coupon codes when available.
        </p>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mr-3 mb-3">
          Manage Subscription (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Apply Coupon (Coming Soon)
        </button>
      </section>
    </div>
  );
}

function PipelinesSettings() {
  const pipelines = [
    {
      name: "Welcome New Followers",
      status: "Active",
      lastRun: "2 hours ago",
    },
    {
      name: "Daily Analytics Snapshot",
      status: "Paused",
      lastRun: "Yesterday",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pipelines</h1>

      <p className="text-cyan-100/70 mb-8">
        Automate tasks, workflows, and creator actions using triggers and
        actions. Full automation engine coming soon.
      </p>

      {/* PIPELINE LIST */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Pipelines</h2>

          <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
            Create New Pipeline
          </button>
        </div>

        {pipelines.length === 0 ? (
          <p className="text-cyan-100/70">No pipelines created yet.</p>
        ) : (
          <div className="space-y-4">
            {pipelines.map((p) => (
              <div
                key={p.name}
                className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p className="text-xl font-semibold mb-3">{p.name}</p>
                  <p className="text-cyan-100/70">
                    Status: {p.status} • Last run: {p.lastRun}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">
                    Edit
                  </button>
                  <button className="bg-violet-700 hover:bg-violet-600 px-3 py-1 rounded font-bold">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CREATE PIPELINE (STATIC UI) */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Create Pipeline</h2>

        <label className="block mb-4">
          Pipeline Name:
          <input
            type="text"
            className="w-full mt-1 p-2 bg-slate-950/80 border border-cyan-400/40 rounded"
            placeholder="My Automation"
          />
        </label>

        {/* TRIGGER */}
        <label className="block mb-4">
          Trigger:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="">Select a trigger</option>
            <option value="newFollower">New Follower</option>
            <option value="newComment">New Comment</option>
            <option value="newPost">New Video Posted</option>
            <option value="scheduled">Scheduled Time</option>
            <option value="manual">Manual Trigger</option>
            <option value="webhook">Webhook (Coming Soon)</option>
          </select>
        </label>

        {/* ACTION */}
        <label className="block mb-4">
          Action:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="">Select an action</option>
            <option value="sendNotification">Send Notification</option>
            <option value="postContent">Post Content</option>
            <option value="addTask">Add to Task List</option>
            <option value="updateAnalytics">Update Analytics</option>
            <option value="triggerPipeline">Trigger Another Pipeline</option>
            <option value="sendWebhook">Send Webhook (Coming Soon)</option>
          </select>
        </label>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
          Save Pipeline (Coming Soon)
        </button>
      </section>

      {/* WORKFLOW BUILDER */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Workflow Builder</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-6 rounded h-64 flex items-center justify-center text-cyan-100/70">
          Drag-and-drop workflow builder coming soon.
        </div>
      </section>

      {/* PIPELINE LOGS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Pipeline Logs</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded">
          <p className="text-cyan-100/70">No logs available.</p>
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>

        <button className="bg-violet-800 hover:bg-violet-700 px-4 py-2 rounded font-bold">
          Reset All Pipelines
        </button>

        <p className="text-cyan-100/70 mt-2">
          This will delete all pipelines and automation settings.
        </p>
      </section>
    </div>
  );
}

function BackupSyncSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Backup & Sync</h1>

      <p className="text-cyan-100/70 mb-8">
        Manage how your settings, layouts, preferences, and pipelines are backed
        up and synced across devices. Cloud sync coming soon.
      </p>

      {/* SYNC STATUS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Sync Status</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded mb-4">
          <p className="text-cyan-100">Cloud Sync: Disabled</p>
          <p className="text-cyan-100/70">Last Sync: Never</p>
        </div>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold mb-2">
          Enable Cloud Sync (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          Sync Now (Coming Soon)
        </button>
      </section>

      {/* DEVICE SYNC */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Device Sync</h2>

        <label className="block mb-3">
          <input type="checkbox" /> Sync settings across all devices
        </label>

        <label className="block mb-3">
          <input type="checkbox" /> Sync dashboard layouts
        </label>

        <label className="block mb-3">
          <input type="checkbox" /> Sync pipelines
        </label>

        <label className="block mb-3">
          <input type="checkbox" /> Sync connected platforms (Coming Soon)
        </label>

        <p className="text-cyan-100/70 mt-4">
          Device-specific overrides will still apply when enabled.
        </p>
      </section>

      {/* MANUAL BACKUP */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Manual Backup</h2>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold mb-3">
          Create Backup (Coming Soon)
        </button>

        <p className="text-cyan-100/70">
          This will generate a backup file containing your settings, layouts,
          pipelines, and preferences.
        </p>
      </section>

      {/* MANUAL RESTORE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Restore From Backup</h2>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Upload Backup File (Coming Soon)
        </button>

        <p className="text-cyan-100/70">
          Restoring a backup will overwrite your current settings.
        </p>
      </section>

      {/* EXPORT / IMPORT SETTINGS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Export / Import Settings</h2>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Export Settings (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          Import Settings (Coming Soon)
        </button>

        <p className="text-cyan-100/70 mt-4">
          Export your settings to a file or import settings from another device.
        </p>
      </section>

      {/* BACKUP HISTORY */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Backup History</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded">
          <p className="text-cyan-100/70">No backups available.</p>
        </div>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mt-4">
          Refresh Backup History (Coming Soon)
        </button>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>

        <button className="bg-violet-800 hover:bg-violet-700 px-4 py-2 rounded font-bold mb-4">
          Reset Sync Settings
        </button>

        <p className="text-cyan-100/70">
          This will disable sync and clear all sync-related data.
        </p>
      </section>
    </div>
  );
}

function AboutSupportSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">About & Support</h1>

      <p className="text-cyan-100/70 mb-8">
        Learn more about Creator Nexus, access support resources, and manage
        app-related information.
      </p>

      {/* APP INFO */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">App Information</h2>

        <p className="text-cyan-100 mb-2">
          <strong>Version:</strong> 1.0.0 (Static)
        </p>

        <p className="text-cyan-100 mb-2">
          <strong>Build:</strong> 2026.06.22 (Static)
        </p>

        <p className="text-cyan-100/70 mt-4">
          Release notes and version history will appear here.
        </p>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mt-4">
          View Release Notes (Coming Soon)
        </button>
      </section>

      {/* HELP CENTER */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Help Center</h2>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold mb-3">
          Open Help Center (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Documentation (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          Tutorials & Guides (Coming Soon)
        </button>
      </section>

      {/* CONTACT SUPPORT */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Contact Support</h2>

        <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold mb-3">
          Submit a Support Ticket (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Report a Bug (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          Request a Feature (Coming Soon)
        </button>
      </section>

      {/* SYSTEM STATUS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">System Status</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded mb-4">
          <p className="text-cyan-100">All systems operational.</p>
          <p className="text-cyan-100/70">Status page integration coming soon.</p>
        </div>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          View Status Page (Coming Soon)
        </button>
      </section>

      {/* LEGAL */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Legal</h2>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Terms of Service (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mb-3">
          Privacy Policy (Coming Soon)
        </button>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          Cookie Policy (Coming Soon)
        </button>
      </section>

      {/* CREDITS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Credits</h2>

        <p className="text-cyan-100 mb-2">Creator Nexus</p>
        <p className="text-cyan-100/70 mb-4">Built with passion for creators.</p>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          View Full Credits (Coming Soon)
        </button>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>

        <button className="bg-violet-800 hover:bg-violet-700 px-4 py-2 rounded font-bold mb-4">
          Clear Local Cache
        </button>

        <p className="text-cyan-100/70 mb-6">
          This will clear cached data and force the app to reload fresh settings.
        </p>

        <button className="bg-violet-800 hover:bg-violet-700 px-4 py-2 rounded font-bold">
          Reset App Data
        </button>

        <p className="text-cyan-100/70 mt-2">
          This will reset all local app data. Cloud data will remain untouched.
        </p>
      </section>
    </div>
  );
}

function IntegrationsSettings() {
  const apiKeys = [
    {
      name: "Primary API Key",
      created: "June 2026",
      lastUsed: "2 days ago",
      status: "Active",
    },
  ];

  const webhooks = [
    {
      name: "New Follower Webhook",
      url: "https://example.com/webhook",
      status: "Active",
      lastDelivery: "5 hours ago",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>

      <p className="text-cyan-100/70 mb-8">
        Manage API keys, webhooks, developer apps, and external integrations.
        Full developer platform coming soon.
      </p>

      {/* API KEYS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">API Keys</h2>

          <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
            Generate New Key
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <p className="text-cyan-100/70">No API keys created yet.</p>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.name}
                className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded"
              >
                <p className="text-xl font-semibold mb-3">{key.name}</p>
                <p className="text-cyan-100/70">
                  Created: {key.created} • Last Used: {key.lastUsed}
                </p>
                <p className="text-cyan-100/70 mb-4">Status: {key.status}</p>

                <div className="flex gap-3">
                  <button className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">
                    Copy Key
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">
                    Rotate Key
                  </button>
                  <button className="bg-violet-700 hover:bg-violet-600 px-3 py-1 rounded font-bold">
                    Delete Key
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WEBHOOKS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Webhooks</h2>

          <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
            Add Webhook
          </button>
        </div>

        {webhooks.length === 0 ? (
          <p className="text-cyan-100/70">No webhooks configured.</p>
        ) : (
          <div className="space-y-4">
            {webhooks.map((hook) => (
              <div
                key={hook.name}
                className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded"
              >
                <p className="text-xl font-semibold mb-3">{hook.name}</p>
                <p className="text-cyan-100/70">URL: {hook.url}</p>
                <p className="text-cyan-100/70">
                  Status: {hook.status} • Last Delivery: {hook.lastDelivery}
                </p>

                <div className="flex gap-3 mt-4">
                  <button className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">
                    Test Delivery
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">
                    Edit
                  </button>
                  <button className="bg-violet-700 hover:bg-violet-600 px-3 py-1 rounded font-bold">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* OAUTH APPS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">OAuth Apps</h2>

          <button className="bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded font-bold">
            Register New App
          </button>
        </div>

        <p className="text-cyan-100/70 mb-4">
          Create OAuth applications to allow external tools to authenticate with
          Creator Nexus.
        </p>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded">
          <p className="text-cyan-100/70">No OAuth apps registered.</p>
        </div>
      </section>

      {/* API USAGE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">API Usage</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded mb-4">
          <p className="text-cyan-100">Requests This Month: 0</p>
          <p className="text-cyan-100/70">Rate limits and usage analytics coming soon.</p>
        </div>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded">
          View Usage Logs (Coming Soon)
        </button>
      </section>

      {/* ERROR LOGS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Integration Error Logs</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded">
          <p className="text-cyan-100/70">No errors logged.</p>
        </div>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded mt-4">
          Refresh Logs (Coming Soon)
        </button>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>

        <button className="bg-violet-800 hover:bg-violet-700 px-4 py-2 rounded font-bold mb-4">
          Reset All Integrations
        </button>

        <p className="text-cyan-100/70">
          This will delete all API keys, webhooks, and OAuth apps.
        </p>
      </section>
    </div>
  );
}

function LanguageSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Language & Region</h1>

      <p className="text-cyan-100/70 mb-8">
        Customize your language, region, date formats, and localization
        preferences. Full localization support coming soon.
      </p>

      {/* LANGUAGE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Language</h2>

        <label className="block mb-4">
          App Language:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="en">English (US)</option>
            <option value="en-uk">English (UK)</option>
            <option value="es">Spanish (Coming Soon)</option>
            <option value="fr">French (Coming Soon)</option>
            <option value="de">German (Coming Soon)</option>
            <option value="jp">Japanese (Coming Soon)</option>
            <option value="custom">Add Custom Language (Coming Soon)</option>
          </select>
        </label>

        <p className="text-cyan-100/70">
          More languages will be added as localization expands.
        </p>
      </section>

      {/* REGION */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Region</h2>

        <label className="block mb-4">
          Region:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="eu">European Union</option>
            <option value="ca">Canada</option>
            <option value="au">Australia</option>
            <option value="custom">Custom Region (Coming Soon)</option>
          </select>
        </label>

        <p className="text-cyan-100/70">
          Region affects currency, formatting, and localization defaults.
        </p>
      </section>

      {/* DATE & TIME FORMATS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Date & Time Format</h2>

        <label className="block mb-4">
          Date Format:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="mmddyyyy">MM/DD/YYYY</option>
            <option value="ddmmyyyy">DD/MM/YYYY</option>
            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
          </select>
        </label>

        <label className="block mb-4">
          Time Format:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="12h">12-Hour</option>
            <option value="24h">24-Hour</option>
          </select>
        </label>

        <label className="block mb-4">
          Time Zone:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="auto">Auto-detect</option>
            <option value="cst">Central Time (US)</option>
            <option value="est">Eastern Time (US)</option>
            <option value="pst">Pacific Time (US)</option>
            <option value="gmt">GMT</option>
            <option value="cet">CET</option>
            <option value="ist">IST</option>
            <option value="custom">Custom Time Zone (Coming Soon)</option>
          </select>
        </label>
      </section>

      {/* NUMBER & CURRENCY FORMATS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Number & Currency Format</h2>

        <label className="block mb-4">
          Number Format:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="us">1,234.56</option>
            <option value="eu">1.234,56</option>
            <option value="space">1 234,56</option>
          </select>
        </label>

        <label className="block mb-4">
          Currency:
          <select className="w-full mt-1 bg-slate-950/80 border border-cyan-400/40 p-2 rounded">
            <option value="usd">USD ($)</option>
            <option value="eur">EUR (€)</option>
            <option value="gbp">GBP (£)</option>
            <option value="cad">CAD ($)</option>
            <option value="aud">AUD ($)</option>
            <option value="custom">Custom Currency (Coming Soon)</option>
          </select>
        </label>
      </section>

      {/* LOCALIZATION PREVIEW */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Localization Preview</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded">
          <p className="text-cyan-100">Date Example: June 22, 2026</p>
          <p className="text-cyan-100">Time Example: 8:14 PM</p>
          <p className="text-cyan-100">Number Example: 1,234.56</p>
          <p className="text-cyan-100">Currency Example: $49.99</p>
        </div>

        <p className="text-cyan-100/70 mt-4">
          This preview updates automatically when localization features are
          implemented.
        </p>
      </section>

      {/* TRANSLATION STATUS */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Translation Status</h2>

        <div className="bg-slate-950/80 border border-cyan-400/40 p-4 rounded">
          <p className="text-cyan-100">English: 100%</p>
          <p className="text-cyan-100">Spanish: 0% (Coming Soon)</p>
          <p className="text-cyan-100">French: 0% (Coming Soon)</p>
          <p className="text-cyan-100">German: 0% (Coming Soon)</p>
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-xl border border-cyan-400/40 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Danger Zone</h2>

        <button className="bg-violet-800 hover:bg-violet-700 px-4 py-2 rounded font-bold">
          Reset Language Settings
        </button>

        <p className="text-cyan-100/70 mt-2">
          This will reset all language, region, and formatting preferences.
        </p>
      </section>
    </div>
  );
}



