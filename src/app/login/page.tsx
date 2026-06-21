"use client";

import { signIn } from "next-auth/react";

const providers = [
  { id: "facebook", label: "Continue with Facebook" },
  { id: "twitter", label: "Continue with Twitter" },
  { id: "tiktok", label: "Continue with TikTok" },
  { id: "discord", label: "Continue with Discord" },
  { id: "twitch", label: "Continue with Twitch" },
  { id: "instagram", label: "Continue with Instagram" },
];

export default function LoginPage() {
  return (
    <div className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-3">
      {providers.map((p) => (
        <button
          key={p.id}
          onClick={() => signIn(p.id)}
          className="w-full rounded-md bg-gray-900 py-3 text-white transition hover:bg-gray-700"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}