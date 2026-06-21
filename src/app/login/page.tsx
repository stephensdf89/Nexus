"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-3">
      <button
        onClick={() => signIn("facebook")}
        className="w-full rounded-md bg-gray-900 py-3 text-white transition hover:bg-gray-700"
      >
        Continue with Facebook
      </button>
    </div>
  );
}