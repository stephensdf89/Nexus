"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto mt-10">
      <button
        onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
        className="w-full py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Continue with Facebook
      </button>
    </div>
  );
}