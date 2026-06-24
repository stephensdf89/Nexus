"use client";

import { useEffect, useState } from "react";

type PublicAppSettings = {
  maintenanceMode: boolean;
  allowSignups: boolean;
  allowPaidModels: boolean;
  defaultAccessLevel: "user" | "pro" | "admin";
  bannerMessage: string;
};

const DEFAULT_SETTINGS: PublicAppSettings = {
  maintenanceMode: false,
  allowSignups: true,
  allowPaidModels: true,
  defaultAccessLevel: "user",
  bannerMessage: "",
};

export default function AppStatusBanner() {
  const [settings, setSettings] = useState<PublicAppSettings>(DEFAULT_SETTINGS);
  const [isOwner, setIsOwner] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [accessRes, settingsRes] = await Promise.all([
          fetch("/api/access/me"),
          fetch("/api/public/app-settings"),
        ]);

        if (accessRes.ok) {
          const accessData = await accessRes.json();
          setIsOwner(Boolean(accessData?.isOwner));
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || {}) });
        }
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  if (!loaded) return null;

  return (
    <>
      {settings.bannerMessage ? (
        <div className="sticky top-0 z-50 border-b border-violet-400/30 bg-violet-950/95 px-4 py-2 text-center text-sm text-violet-100 shadow-[0_0_18px_rgba(167,139,250,0.15)]">
          {settings.bannerMessage}
        </div>
      ) : null}

      {settings.maintenanceMode && !isOwner ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 px-6 text-center">
          <div className="max-w-lg rounded-2xl border border-violet-400/30 bg-slate-900/95 p-8 shadow-[0_0_30px_rgba(167,139,250,0.25)]">
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Maintenance Mode</p>
            <h1 className="mt-3 text-3xl font-bold text-white">The app is temporarily restricted</h1>
            <p className="mt-3 text-sm text-violet-100/70">
              The owner has enabled maintenance mode. Please check back later.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}