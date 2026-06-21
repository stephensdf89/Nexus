"use client";
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : "https://content-creator-nexus-website-521i3vs3g.vercel.app/login";

  // Autofill from login page if values were passed
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const preEmail = searchParams?.get("email") || "";
  const prePassword = searchParams?.get("password") || "";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(preEmail);
  const [password, setPassword] = useState(prePassword);
  const [confirmPassword, setConfirmPassword] = useState(prePassword);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Supabase configuration is missing.");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          name,
          username,
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/login?verify=true");
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-neutral-900 p-8 rounded-xl shadow-xl border border-neutral-700">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>

        {/* Subscription Tier Breakdown */}
        <div className="mb-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
          <h2 className="text-xl font-semibold mb-2">Choose Your Plan</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="text-red-400 font-semibold">Free Tier:</span>  
              Basic dashboard, limited analytics, 1 pipeline.
            </li>
            <li>
              <span className="text-red-400 font-semibold">Creator Tier:</span>  
              Full analytics, unlimited pipelines, community access.
            </li>
            <li>
              <span className="text-red-400 font-semibold">Pro Tier:</span>  
              Team access, advanced insights, automation tools.
            </li>
          </ul>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Name</label>
            <input
              type="text"
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Username</label>
            <input
              type="text"
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 transition p-3 rounded font-semibold"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-red-400 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
