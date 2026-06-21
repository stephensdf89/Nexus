"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { setAuthCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const redirectedFrom =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirectedFrom") || "/dashboard"
        : "/dashboard";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Supabase configuration is missing.");
      setIsLoading(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: remember },
    });

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsLoading(false);
      return;
    }

    if (data.session) {
      setAuthCookies(
        {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        },
        remember
      );
    }

    router.push(redirectedFrom);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-bold">Sign In</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Access your creator dashboard</p>

        <form onSubmit={handleLogin} className="mt-7 space-y-4">
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm outline-none transition focus:border-[#ff0033]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm outline-none transition focus:border-[#ff0033]"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={() => setRemember((prev) => !prev)}
              className="h-4 w-4"
            />
            <label htmlFor="remember" className="text-sm text-zinc-300">
              Remember me
            </label>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#ff0033] p-3 font-semibold transition hover:brightness-110 disabled:opacity-60"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-400">
          Need an account? <a href="/signup" className="text-[#ff6680] hover:underline">Create one</a>
        </p>
      </div>
    </div>
  );
}