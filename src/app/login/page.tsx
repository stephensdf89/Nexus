"use client";

import { useEffect, useMemo, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

const providerLabels: Record<string, string> = {
  facebook: "Continue with Facebook",
  twitter: "Continue with Twitter",
  tiktok: "Continue with TikTok",
  discord: "Continue with Discord",
  twitch: "Continue with Twitch",
  instagram: "Continue with Instagram",
};

export default function LoginPage() {
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadProviders = async () => {
      const nextAuthProviders = await getProviders();
      const configuredProviders = Object.values(nextAuthProviders ?? {}).map((provider) => ({
        id: provider.id,
        name: provider.name,
      }));
      setProviders(configuredProviders);
    };

    void loadProviders();
  }, []);

  const hasProviders = useMemo(() => providers.length > 0, [providers.length]);

  return (
    <div className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-3">
      {hasProviders ? (
        providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => signIn(provider.id)}
            className="w-full rounded-md bg-gray-900 py-3 text-white transition hover:bg-gray-700"
          >
            {providerLabels[provider.id] ?? `Continue with ${provider.name}`}
          </button>
        ))
      ) : (
        <p className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
          No social providers are configured yet. Add OAuth env vars in Vercel and redeploy.
        </p>
      )}
    </div>
  );
}