"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setSettings(data);

      const { data: integrations } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", user.id);

      setIntegrations(integrations || []);
      setLoading(false);
    };

    load();
  }, [user]);

  const updateSetting = async (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));

    await supabase
      .from("user_settings")
      .update({ [field]: value })
      .eq("user_id", user.id);
  };

  const disconnect = async (provider) => {
    await supabase
      .from("integrations")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);
  };

  if (loading || !settings)
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
            <div key={integration.id} className="rounded-lg border border-red-600 bg-black/80 p-3">
              <p className="text-sm font-semibold text-red-400 capitalize">{integration.provider}</p>
              <p className="text-xs text-gray-500">
                Last updated: {new Date(integration.updated_at).toLocaleString()}
              </p>

              {integration.refresh_token === null && (
                <button
                  onClick={() => {
                    window.location.assign(
                      `/api/integrations/${integration.provider}/auth?uid=${user.id}&email=${user.email}`
                    );
                  }}
                  className="mt-3 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Reconnect
                </button>
              )}
            </div>
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
    </div>
  );
}
