"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../contexts/AuthContext";

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

export default function IntegrationsPage() {
  const { user } = useUser();
  const [integrations, setIntegrations] = useState([]);
  const [provider, setProvider] = useState("youtube");
  const [type, setType] = useState("youtube.new_video");
  const [pipelineId, setPipelineId] = useState("");
  const [config, setConfig] = useState("{}");
  const [savingTrigger, setSavingTrigger] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", user.id);

      setIntegrations(data || []);
      setLoading(false);
    };

    load();
  }, [user]);

  const getIntegration = (provider) =>
    integrations.find((i) => i.provider === provider);

  const disconnect = async (provider) => {
    await supabase
      .from("integrations")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);

    setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
  };

  const connectYouTube = () => {
    window.location.assign(`/api/integrations/youtube/auth?uid=${user.id}&email=${user.email}`);
  };

  const connectGoogleDrive = () => {
    window.location.assign(`/api/integrations/google/auth?uid=${user.id}&email=${user.email}`);
  };

  const connectInstagram = () => {
    window.location.assign(`/api/integrations/instagram/auth?uid=${user.id}&email=${user.email}`);
  };

  const connectTikTok = () => {
    window.location.assign(`/api/integrations/tiktok/auth?uid=${user.id}&email=${user.email}`);
  };

  const connectTwitter = () => {
    window.location.assign(`/api/integrations/twitter/auth?uid=${user.id}&email=${user.email}`);
  };

  const saveTrigger = async () => {
    if (!user) return;

    let parsedConfig = {};

    try {
      parsedConfig = JSON.parse(config || "{}");
    } catch {
      parsedConfig = {};
    }

    setSavingTrigger(true);

    await supabase.from("integration_triggers").insert({
      user_id: user.id,
      provider,
      type,
      pipeline_id: pipelineId || null,
      config: parsedConfig,
    });

    setSavingTrigger(false);
  };

  if (loading) return <p className="text-gray-400">Loading integrations...</p>;

  return (
    <div className="space-y-6 p-6 bg-black text-white">
      <h1 className="text-3xl font-bold text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.7)]">
        Integrations
      </h1>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Provider</label>
        <select
          className="bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
          <option value="gmail">Gmail</option>
          <option value="drive">Google Drive</option>
          <option value="twitter">Twitter</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Trigger Type</label>
        <select
          className="bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
          onChange={(e) => setType(e.target.value)}
          value={type}
        >
          {provider === "youtube" && <option value="youtube.new_video">New Video</option>}
          {provider === "tiktok" && <option value="tiktok.new_comment">New Comment</option>}
          {provider === "instagram" && <option value="instagram.new_dm">New DM</option>}
          {provider === "gmail" && <option value="gmail.new_email">New Email</option>}
          {provider === "drive" && <option value="drive.new_file">New File</option>}
          {provider === "twitter" && <option value="twitter.new_mention">New Mention</option>}
          {provider === "facebook" && <option value="facebook.new_message">New Message</option>}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Pipeline ID</label>
        <input
          className="bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white w-full"
          value={pipelineId}
          onChange={(e) => setPipelineId(e.target.value)}
          placeholder="Enter pipeline UUID"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Trigger Config JSON</label>
        <textarea
          className="bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white w-full min-h-28"
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          placeholder='{}'
        />
      </div>

      <button
        onClick={saveTrigger}
        disabled={savingTrigger}
        className="bg-red-700 hover:bg-red-800 disabled:opacity-60 px-4 py-2 rounded-lg text-sm font-semibold shadow-[0_0_10px_rgba(255,0,0,0.6)]"
      >
        {savingTrigger ? "Saving..." : "Save Trigger"}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntegrationCard
          provider="youtube"
          label="YouTube"
          integration={getIntegration("youtube")}
          onConnect={connectYouTube}
          onDisconnect={() => disconnect("youtube")}
        />

        <IntegrationCard
          provider="google"
          label="Google Drive"
          integration={getIntegration("google")}
          onConnect={connectGoogleDrive}
          onDisconnect={() => disconnect("google")}
        />

        <IntegrationCard
          provider="instagram"
          label="Instagram"
          integration={getIntegration("instagram")}
          onConnect={connectInstagram}
          onDisconnect={() => disconnect("instagram")}
        />

        <IntegrationCard
          provider="tiktok"
          label="TikTok"
          integration={getIntegration("tiktok")}
          onConnect={connectTikTok}
          onDisconnect={() => disconnect("tiktok")}
        />

        <IntegrationCard
          provider="twitter"
          label="X / Twitter"
          integration={getIntegration("twitter")}
          onConnect={connectTwitter}
          onDisconnect={() => disconnect("twitter")}
        />
      </div>
    </div>
  );
}
