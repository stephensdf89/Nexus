"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/AuthContext";
import OwnerAppControlsPanel from "@/components/OwnerAppControlsPanel";

const DEFAULT_SETTINGS = {
  theme: "neon",
  language: "en",
  region: "US",
  notifications_enabled: true,
};

function IntegrationCard({ provider, label, onConnect, onDisconnect, integration }) {
  const connected = !!integration;

  return (
    <div className="bg-black/80 border border-red-600 rounded-xl p-5 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
      <h3 className="text-lg font-bold text-red-400">{label}</h3>

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
            className="mt-3 bg-gray-900 border border-red-600 px-3 py-1 rounded-lg text-xs hover:shadow-[0_0_10px_rgba(255,0,0,0.6)]"
          >
            Disconnect
          </button>
        </>
      ) : (
        <>
          <p className="text-red-400 text-sm mt-2">Not Connected</p>

          <button
            onClick={onConnect}
            className="mt-3 bg-red-700 hover:bg-red-800 px-3 py-1 rounded-lg text-xs shadow-[0_0_10px_rgba(255,0,0,0.6)]"
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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
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
          setSettings(DEFAULT_SETTINGS);
        } else if (!data) {
          const defaultRow = { user_id: user.id, ...DEFAULT_SETTINGS };
          const { error: insertError } = await supabase
            .from("user_settings")
            .upsert(defaultRow, { onConflict: "user_id" });

          if (insertError) {
            console.error("Failed to initialize user settings:", insertError);
          }

          setSettings(defaultRow);
        } else {
          setSettings({ ...DEFAULT_SETTINGS, ...data });
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
    setSettings((prev) => ({ ...prev, [field]: value }));

    if (!user) return;

    await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, [field]: value }, { onConflict: "user_id" });
  };

  const disconnect = async (provider) => {
    await supabase
      .from("integrations")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);

    setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
  };

  if (loading)
    return <p className="text-gray-400">Loading settings...</p>;

  return (
    <div className="space-y-6 p-6 bg-black text-white">
      <h1 className="text-3xl font-bold text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.7)]">
        Settings
      </h1>

      {integrations.some(i => i.provider === "youtube") ? (
        <p className="text-green-400 text-sm">Connected</p>
      ) : (
        <p className="text-red-400 text-sm">Not Connected</p>
      )}

      <div>
        <h2 className="text-xl font-bold text-red-400 mb-2">Integrations</h2>

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
        <label className="block text-sm text-gray-400 mb-1">Theme</label>
        <select
          className="bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          value={settings.theme}
          onChange={(e) => updateSetting("theme", e.target.value)}
        >
          <option value="neon">Neon</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      {/* LANGUAGE */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Language</label>
        <select
          className="bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          value={settings.language}
          onChange={(e) => updateSetting("language", e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      {/* REGION */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Region</label>
        <select
          className="bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          value={settings.region}
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
            checked={settings.notifications_enabled}
            onChange={(e) =>
              updateSetting("notifications_enabled", e.target.checked)
            }
          />
          <span className="text-sm text-gray-300">Enable notifications</span>
        </label>
      </div>

      {isOwner && <OwnerAppControlsPanel />}
    </div>
  );
}
