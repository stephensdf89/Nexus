"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    let supabase;

    try {
      supabase = getSupabaseClient();
    } catch (clientError) {
      setError(
        clientError instanceof Error
          ? clientError.message
          : "Supabase configuration is missing."
      );
      return;
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setMessage("Account created. Check your email to confirm your signup.");
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-xl shadow-xl border border-neutral-700">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded bg-neutral-800 border border-neutral-700 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {message && (
            <p className="text-green-400 text-sm text-center">{message}</p>
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
