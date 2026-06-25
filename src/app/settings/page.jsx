"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/AuthContext";
import OwnerAppControlsPanel from "@/components/OwnerAppControlsPanel";
import { useSettingsStore } from "@/lib/settingsStore";

const DEFAULT_SETTINGS = {
  theme: "neon",
  language: "en",
  region: "US",
  notifications_enabled: true,
};

const THEME_OPTIONS = ["neon", "ocean", "sunset", "graphite"];

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
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const updateAppSetting = useSettingsStore((state) => state.update);

  const [region, setRegion] = useState(DEFAULT_SETTINGS.region);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

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
          setRegion(data.region || DEFAULT_SETTINGS.region);
        }

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

    if (field === "theme") {
      updateAppSetting("theme", value);
    }
    if (field === "language") {
      updateAppSetting("language", value);
    }
    if (field === "notifications_enabled") {
      updateAppSetting("notificationsEnabled", value);
    }
    if (field === "region") {
      setRegion(value);
    }

    await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          theme,
          language,
          region: field === "region" ? value : region,
          notifications_enabled:
            field === "notifications_enabled" ? value : notificationsEnabled,
          [field]: value,
        },
        { onConflict: "user_id" }
      );
  };

  const disconnect = async (provider) => {
    await supabase
      .from("integrations")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);

    setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
  };

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
      <h1 className="text-3xl font-bold" style={{ color: "var(--brand-primary)" }}>
        Settings
      </h1>

      <p className="text-sm" style={{ color: "var(--brand-text)" }}>
        Active theme: <strong>{theme}</strong>
      </p>

      <div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--brand-primary)" }}>Integrations</h2>

        <div className="space-y-3">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              provider={integration.provider}
              label={integration.provider}
              integration={integration}
              onConnect={() => {
                window.location.assign(
                  `/api/integrations/${integration.provider}/auth?uid=${user.id}&email=${user.email}`
                );
              }}
              onDisconnect={() => disconnect(integration.provider)}
            />
          ))}
        </div>
      </div>

      {/* THEME */}
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--brand-text)" }}>Theme</label>
        <select
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: "var(--brand-surface-soft)",
            border: "1px solid var(--brand-border)",
            color: "var(--brand-text)",
          }}
          value={theme}
          onChange={(e) => updateSetting("theme", e.target.value)}
        >
          {THEME_OPTIONS.map((themeOption) => (
            <option key={themeOption} value={themeOption}>
              {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* LANGUAGE */}
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--brand-text)" }}>Language</label>
        <select
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: "var(--brand-surface-soft)",
            border: "1px solid var(--brand-border)",
            color: "var(--brand-text)",
          }}
          value={language}
          onChange={(e) => updateSetting("language", e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      {/* REGION */}
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--brand-text)" }}>Region</label>
        <select
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: "var(--brand-surface-soft)",
            border: "1px solid var(--brand-border)",
            color: "var(--brand-text)",
          }}
          value={region}
          onChange={(e) => updateSetting("region", e.target.value)}
        >
          <option value="US">United States</option>
          <option value="EU">Europe</option>
          <option value="AS">Asia</option>
        </select>
      </div>

      {/* NOTIFICATIONS */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="toggle-neon"
            checked={notificationsEnabled}
            onChange={(e) =>
              updateSetting("notifications_enabled", e.target.checked)
            }
          />
          <span className="text-sm" style={{ color: "var(--brand-text)" }}>Enable notifications</span>
        </label>
      </div>

      {isOwner && <OwnerAppControlsPanel />}
    </div>
  );
}
