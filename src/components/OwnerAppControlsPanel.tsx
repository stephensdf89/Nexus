"use client";

import { useEffect, useState } from "react";

type AppSettings = {
  maintenanceMode: boolean;
  allowSignups: boolean;
  allowPaidModels: boolean;
  defaultAccessLevel: "user" | "pro" | "admin";
  bannerMessage: string;
};

const DEFAULT_SETTINGS: AppSettings = {
  maintenanceMode: false,
  allowSignups: true,
  allowPaidModels: true,
  defaultAccessLevel: "user",
  bannerMessage: "",
};

export default function OwnerAppControlsPanel() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [canAdmin, setCanAdmin] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const accessRes = await fetch("/api/access/me");
        if (!accessRes.ok) {
          setCanAdmin(false);
          return;
        }

        const accessData = await accessRes.json();
        const allowed = Boolean(accessData?.isOwner) || accessData?.accessLevel === "admin";
        if (!allowed) {
          setCanAdmin(false);
          return;
        }

        setCanAdmin(true);

        const res = await fetch("/api/admin/app-settings");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load app settings");
        }

        const nextSettings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
        setSettings(nextSettings);
        setSavedSettings(nextSettings);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load app settings";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const patchSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const save = async () => {
    const turningOnMaintenance = !savedSettings.maintenanceMode && settings.maintenanceMode;
    const disablingSignups = savedSettings.allowSignups && !settings.allowSignups;

    if (turningOnMaintenance) {
      const confirmed = window.confirm(
        "Enable maintenance mode? Non-owner users will be blocked from using the app."
      );
      if (!confirmed) return;
    }

    if (disablingSignups) {
      const confirmed = window.confirm(
        "Disable new signups? New account creation will be blocked."
      );
      if (!confirmed) return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save app settings");
      }

      const nextSettings = { ...DEFAULT_SETTINGS, ...(data.settings || settings) };
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
      setNotice("App settings saved.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save app settings";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-violet-400/35 rounded-xl p-5 shadow-[0_0_18px_rgba(167,139,250,0.15)]">
        <h2 className="text-lg font-bold text-violet-300">App Controls</h2>
        <p className="text-sm text-violet-100/70 mt-2">Loading app controls...</p>
      </div>
    );
  }

  if (!canAdmin) {
    return null;
  }

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  return (
    <div className="bg-slate-900/80 border border-violet-400/35 rounded-xl p-5 shadow-[0_0_18px_rgba(167,139,250,0.15)]">
      <h2 className="text-lg font-bold text-violet-300">App Controls</h2>
      <p className="text-xs text-violet-100/60 mt-1">Global switches for the whole app. Changes are audited.</p>

      {error && <p className="text-sm text-rose-300 mt-3">{error}</p>}
      {notice && <p className="text-sm text-emerald-300 mt-3">{notice}</p>}
      {hasUnsavedChanges && <p className="text-xs text-amber-300 mt-2">You have unsaved changes.</p>}

      <div className="mt-4 space-y-4">
        <ToggleRow
          label="Maintenance mode"
          description="Pause the app for non-owner users."
          checked={settings.maintenanceMode}
          onChange={(checked) => patchSettings({ maintenanceMode: checked })}
        />

        <ToggleRow
          label="Allow new signups"
          description="Let new users create accounts."
          checked={settings.allowSignups}
          onChange={(checked) => patchSettings({ allowSignups: checked })}
        />

        <ToggleRow
          label="Allow paid models"
          description="Enable paid AI/model features for eligible users."
          checked={settings.allowPaidModels}
          onChange={(checked) => patchSettings({ allowPaidModels: checked })}
        />

        <div>
          <label className="block text-sm font-medium text-violet-100 mb-2">Default access level</label>
          <select
            value={settings.defaultAccessLevel}
            onChange={(e) => patchSettings({ defaultAccessLevel: e.target.value as AppSettings["defaultAccessLevel"] })}
            className="w-full rounded-md border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-sm text-violet-100"
          >
            <option value="user">User</option>
            <option value="pro">Pro</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-violet-100 mb-2">Global banner</label>
          <textarea
            value={settings.bannerMessage}
            onChange={(e) => patchSettings({ bannerMessage: e.target.value })}
            rows={3}
            placeholder="Display a message to users across the app"
            className="w-full rounded-md border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-sm text-violet-100 placeholder:text-violet-100/40"
          />
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving || !hasUnsavedChanges}
          className="rounded-md bg-violet-500/80 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-violet-400 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save app settings"}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-lg border border-violet-300/20 bg-violet-500/5 p-3 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-violet-100">{label}</p>
        <p className="text-xs text-violet-100/60 mt-1">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-violet-300/40 bg-slate-950 text-violet-500"
      />
    </label>
  );
}