"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Supabase configuration is missing.");
      setIsLoading(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : "https://content-creator-nexus-website-521i3vs3g.vercel.app/login";

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { name, username },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setMessage("Account created. Check your email to verify your account before signing in.");
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-6 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-bold">Create Account</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Start building your creator workflow</p>

        <form onSubmit={handleSignup} className="mt-7 space-y-4">
          <div>
            <label className="mb-1 block text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm outline-none transition focus:border-[#ff0033]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm outline-none transition focus:border-[#ff0033]"
              required
            />
          </div>

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
              minLength={6}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm outline-none transition focus:border-[#ff0033]"
              required
              minLength={6}
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#ff0033] p-3 font-semibold transition hover:brightness-110 disabled:opacity-60"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-400">
          Already have an account? <a href="/login" className="text-[#ff6680] hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}