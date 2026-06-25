"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/AuthContext";
import OwnerAppControlsPanel from "@/components/OwnerAppControlsPanel";
import { useSettingsStore } from "@/lib/settingsStore";

const THEME_OPTIONS = [
  "neon",
  "vibrant-neon",
  "ocean",
  "sunset",
  "graphite",
  "aurora",
  "forest",
  "rose-gold",
];
const TEXT_SIZE_OPTIONS = ["small", "medium", "large"];
const COLOR_BLIND_OPTIONS = ["none", "protanopia", "deuteranopia", "tritanopia"];
const DASHBOARD_LAYOUT_OPTIONS = ["default", "focus", "compact"];
const AI_MODE_OPTIONS = ["standard", "creative", "strict"];
const REGION_OPTIONS = ["US", "EU", "AS", "Global"];
const INTEGRATION_PROVIDERS = [
  "youtube",
  "tiktok",
  "instagram",
  "twitter",
  "linkedin",
  "facebook",
  "pinterest",
  "twitch",
];

const DEFAULT_REGION = "US";

function IntegrationCard({ provider, label, onConnect, onDisconnect, integration }) {
  const connected = !!integration;

  return (
    <div className="rounded-xl border p-5" style={{
      background: "var(--brand-surface)",
      borderColor: "var(--brand-border)",
      boxShadow: "0 0 18px rgba(58, 123, 255, 0.2)",
    }}>
      <h3 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>{label}</h3>

      {connected ? (
        <>
          <p className="text-green-400 text-sm mt-2">Connected</p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {new Date(integration.updated_at).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Scopes: {integration.scope}
          </p>

          <button
            onClick={onDisconnect}
            className="mt-3 border px-3 py-1 rounded-lg text-xs"
            style={{
              borderColor: "var(--brand-border)",
              background: "rgba(10, 20, 58, 0.6)",
            }}
          >
            Disconnect
          </button>
        </>
      ) : (
        <>
          <p className="text-yellow-300 text-sm mt-2">Not Connected</p>

          <button
            onClick={onConnect}
            className="mt-3 px-3 py-1 rounded-lg text-xs"
            style={{
              background: "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))",
              color: "#041329",
              fontWeight: 700,
            }}
          >
            Connect
          </button>
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();

  const device = useSettingsStore((state) => state.device);

  const highContrast = useSettingsStore((state) => state.highContrast);
  const textSize = useSettingsStore((state) => state.textSize);
  const colorBlindMode = useSettingsStore((state) => state.colorBlindMode);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const disableNeon = useSettingsStore((state) => state.disableNeon);
  const safeMode = useSettingsStore((state) => state.safeMode);

  const theme = useSettingsStore((state) => state.theme);
  const compactMode = useSettingsStore((state) => state.compactMode);
  const language = useSettingsStore((state) => state.language);
  const sidebarCollapsed = useSettingsStore((state) => state.sidebarCollapsed);

  const dashboardLayout = useSettingsStore((state) => state.dashboardLayout);
  const showAnalyticsPreview = useSettingsStore((state) => state.showAnalyticsPreview);
  const showCreatorToolsPreview = useSettingsStore((state) => state.showCreatorToolsPreview);

  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const vibrationEnabled = useSettingsStore((state) => state.vibrationEnabled);

  const aiMode = useSettingsStore((state) => state.aiMode);

  const updateAppSetting = useSettingsStore((state) => state.update);
  const resetAccessibility = useSettingsStore((state) => state.resetAccessibility);
  const resetDashboard = useSettingsStore((state) => state.resetDashboard);
  const resetNotifications = useSettingsStore((state) => state.resetNotifications);
  const resetTheme = useSettingsStore((state) => state.resetTheme);
  const resetAll = useSettingsStore((state) => state.resetAll);
  const syncFromServer = useSettingsStore((state) => state.syncFromServer);
  const syncToServer = useSettingsStore((state) => state.syncToServer);

  const [region, setRegion] = useState(DEFAULT_REGION);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        const accessRes = await fetch("/api/access/me");
        if (accessRes.ok) {
          const accessData = await accessRes.json();
          setIsOwner(Boolean(accessData?.isOwner));
        }

        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Failed to load user settings:", error);
        } else if (!data) {
          const defaultRow = {
            user_id: user.id,
            theme,
            language,
            region,
            notifications_enabled: notificationsEnabled,
          };
          const { error: insertError } = await supabase
            .from("user_settings")
            .upsert(defaultRow, { onConflict: "user_id" });

          if (insertError) {
            console.error("Failed to initialize user settings:", insertError);
          }
        } else {
          const hasLocalSettings =
            typeof window !== "undefined" && Boolean(localStorage.getItem("global-settings"));

          // Legacy settings are migration fallback only.
          // If local settings already exist, never overwrite the active store.
          if (!hasLocalSettings) {
            if (data.theme && data.theme !== theme) {
              updateAppSetting("theme", data.theme);
            }
            if (data.language && data.language !== language) {
              updateAppSetting("language", data.language);
            }
            if (
              typeof data.notifications_enabled === "boolean" &&
              data.notifications_enabled !== notificationsEnabled
            ) {
              updateAppSetting("notificationsEnabled", data.notifications_enabled);
            }
          }

          setRegion(data.region || DEFAULT_REGION);
        }

        await syncFromServer();

        const { data: integrations, error: integrationsError } = await supabase
          .from("integrations")
          .select("*")
          .eq("user_id", user.id);

        if (integrationsError) {
          console.error("Failed to load integrations:", integrationsError);
          setIntegrations([]);
        } else {
          setIntegrations(integrations || []);
        }
      } catch (error) {
        console.error("Settings page load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const updateSetting = async (field, value) => {
    if (!user) return;

    setSaveNotice("");
    setSaveError("");

    if (field === "region") {
      setRegion(value);
    } else {
      updateAppSetting(field, value);
    }

    await persistLegacySettings(field, value);
  };

  const persistLegacySnapshot = async () => {
    if (!user) return;

    const payload = {
      user_id: user.id,
      theme,
      language,
      region,
      notifications_enabled: notificationsEnabled,
    };

    await supabase.from("user_settings").upsert(payload, { onConflict: "user_id" });
  };

  const saveSettings = async () => {
    if (!user || isSavingSettings) return;

    setIsSavingSettings(true);
    setSaveError("");
    setSaveNotice("");

    try {
      await syncToServer();
      await persistLegacySnapshot();
      setSaveNotice("Settings saved.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveError("Failed to save settings. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const persistLegacySettings = async (field, value) => {
    if (!user) return;

    const payload = {
      user_id: user.id,
      theme: field === "theme" ? value : theme,
      language: field === "language" ? value : language,
      region: field === "region" ? value : region,
      notifications_enabled:
        field === "notificationsEnabled" ? value : notificationsEnabled,
    };

    await supabase.from("user_settings").upsert(payload, { onConflict: "user_id" });
  };

  const disconnect = async (provider) => {
    await supabase
      .from("integrations")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);

    setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
  };

  const connectProvider = (provider) => {
    window.location.assign(`/api/integrations/${provider}/auth?uid=${user.id}&email=${user.email}`);
  };

  const integrationByProvider = integrations.reduce((acc, item) => {
    acc[item.provider] = item;
    return acc;
  }, {});

  if (loading) {
    return <p className="text-gray-300 p-6">Loading settings...</p>;
  }

  if (!user) {
    return <p className="text-gray-300 p-6">Please log in to manage settings.</p>;
  }

  return (
    <div
      className="space-y-6 p-6 rounded-2xl border"
      style={{
        background: "var(--brand-surface)",
        borderColor: "var(--brand-border)",
        color: "var(--brand-text)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold" style={{ color: "var(--brand-primary)" }}>
          Settings
        </h1>

        <button
          type="button"
          onClick={saveSettings}
          disabled={isSavingSettings}
          className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          style={{
            background: "linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))",
            color: "#041329",
          }}
        >
          {isSavingSettings ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {saveNotice ? <p className="text-sm text-emerald-300">{saveNotice}</p> : null}
      {saveError ? <p className="text-sm text-red-300">{saveError}</p> : null}

      <p className="text-sm" style={{ color: "var(--brand-text)" }}>
        Active theme: <strong>{theme}</strong> | Device profile: <strong>{device}</strong>
      </p>

      <SectionCard title="Theme and Interface">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Theme"
            value={theme}
            options={THEME_OPTIONS}
            onChange={(value) => updateSetting("theme", value)}
          />

          <SelectField
            label="Language"
            value={language}
            options={["en", "es", "fr"]}
            onChange={(value) => updateSetting("language", value)}
          />

          <ToggleField
            label="Compact mode"
            checked={compactMode}
            onChange={(checked) => updateSetting("compactMode", checked)}
          />

          <ToggleField
            label="Collapse sidebar by default"
            checked={sidebarCollapsed}
            onChange={(checked) => updateSetting("sidebarCollapsed", checked)}
          />
        </div>

        <button
          type="button"
          className="mt-4 px-3 py-2 rounded-lg text-sm border"
          style={{ borderColor: "var(--brand-border)", color: "var(--brand-text)" }}
          onClick={resetTheme}
        >
          Reset theme and interface
        </button>
      </SectionCard>

      <SectionCard title="Accessibility">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleField
            label="High contrast"
            checked={highContrast}
            onChange={(checked) => updateSetting("highContrast", checked)}
          />

          <SelectField
            label="Text size"
            value={textSize}
            options={TEXT_SIZE_OPTIONS}
            onChange={(value) => updateSetting("textSize", value)}
          />

          <SelectField
            label="Color blind mode"
            value={colorBlindMode}
            options={COLOR_BLIND_OPTIONS}
            onChange={(value) => updateSetting("colorBlindMode", value)}
          />

          <ToggleField
            label="Reduced motion"
            checked={reducedMotion}
            onChange={(checked) => updateSetting("reducedMotion", checked)}
          />

          <ToggleField
            label="Disable neon effects"
            checked={disableNeon}
            onChange={(checked) => updateSetting("disableNeon", checked)}
          />

          <ToggleField
            label="Safe mode"
            checked={safeMode}
            onChange={(checked) => updateSetting("safeMode", checked)}
          />
        </div>

        <button
          type="button"
          className="mt-4 px-3 py-2 rounded-lg text-sm border"
          style={{ borderColor: "var(--brand-border)", color: "var(--brand-text)" }}
          onClick={resetAccessibility}
        >
          Reset accessibility settings
        </button>
      </SectionCard>

      <SectionCard title="Dashboard Preferences">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Dashboard layout"
            value={dashboardLayout}
            options={DASHBOARD_LAYOUT_OPTIONS}
            onChange={(value) => updateSetting("dashboardLayout", value)}
          />

          <ToggleField
            label="Show analytics preview"
            checked={showAnalyticsPreview}
            onChange={(checked) => updateSetting("showAnalyticsPreview", checked)}
          />

          <ToggleField
            label="Show creator tools preview"
            checked={showCreatorToolsPreview}
            onChange={(checked) => updateSetting("showCreatorToolsPreview", checked)}
          />
        </div>

        <p className="text-xs mt-3" style={{ color: "var(--brand-text)" }}>
          These preferences now directly control dashboard rendering.
        </p>

        <button
          type="button"
          className="mt-4 px-3 py-2 rounded-lg text-sm border"
          style={{ borderColor: "var(--brand-border)", color: "var(--brand-text)" }}
          onClick={resetDashboard}
        >
          Reset dashboard settings
        </button>
      </SectionCard>

      <SectionCard title="Notifications and Alerts">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleField
            label="Enable notifications"
            checked={notificationsEnabled}
            onChange={(checked) => updateSetting("notificationsEnabled", checked)}
          />

          <ToggleField
            label="Enable sound alerts"
            checked={soundEnabled}
            onChange={(checked) => updateSetting("soundEnabled", checked)}
          />

          <ToggleField
            label="Enable vibration alerts"
            checked={vibrationEnabled}
            onChange={(checked) => updateSetting("vibrationEnabled", checked)}
          />
        </div>

        <button
          type="button"
          className="mt-4 px-3 py-2 rounded-lg text-sm border"
          style={{ borderColor: "var(--brand-border)", color: "var(--brand-text)" }}
          onClick={resetNotifications}
        >
          Reset notification settings
        </button>
      </SectionCard>

      <SectionCard title="AI Behavior">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="AI mode"
            value={aiMode}
            options={AI_MODE_OPTIONS}
            onChange={(value) => updateSetting("aiMode", value)}
          />
        </div>

        <p className="text-xs mt-3" style={{ color: "var(--brand-text)" }}>
          AI mode is active and used by the assistant workflow.
        </p>
      </SectionCard>

      <SectionCard title="Account Region">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Region"
            value={region}
            options={REGION_OPTIONS}
            onChange={(value) => updateSetting("region", value)}
          />
        </div>

        <p className="text-xs mt-3" style={{ color: "var(--brand-text)" }}>
          Region is persisted and available for account/profile context.
        </p>
      </SectionCard>

      <SectionCard title="Integrations">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTEGRATION_PROVIDERS.map((provider) => (
            <IntegrationCard
              key={provider}
              provider={provider}
              label={provider}
              integration={integrationByProvider[provider]}
              onConnect={() => connectProvider(provider)}
              onDisconnect={() => disconnect(provider)}
            />
          ))}
        </div>

        <PlaceholderNote text="Some providers require external credentials/config in their respective platforms before connection can complete." />
      </SectionCard>

      <SectionCard title="Owner Controls">
        {isOwner ? <OwnerAppControlsPanel /> : <PlaceholderNote text="Owner controls are only usable on owner/admin accounts." />}
      </SectionCard>

      <SectionCard title="Global Reset">
        <button
          type="button"
          className="px-3 py-2 rounded-lg text-sm border"
          style={{ borderColor: "var(--brand-border)", color: "var(--brand-text)" }}
          onClick={resetAll}
        >
          Reset all settings
        </button>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: "var(--brand-border)",
        background: "var(--brand-surface-soft)",
      }}
    >
      <h2 className="text-xl font-bold mb-3" style={{ color: "var(--brand-primary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm" style={{ color: "var(--brand-text)" }}>
      <input
        type="checkbox"
        className="toggle-neon"
        checked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-sm mb-1" style={{ color: "var(--brand-text)" }}>
        {label}
      </label>
      <select
        className="rounded-lg px-3 py-2 text-sm w-full"
        style={{
          background: "var(--brand-surface)",
          border: "1px solid var(--brand-border)",
          color: "var(--brand-text)",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function PlaceholderNote({ text }) {
  return (
    <p className="text-xs mt-3" style={{ color: "var(--brand-text)" }}>
      Note: {text}
    </p>
  );
}
