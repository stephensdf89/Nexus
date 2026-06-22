"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen fade-in flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md border border-cyan-500/30 slide-up">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-white block mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded bg-black/40 border border-red-700 text-white input-glow"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-white block mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded bg-black/40 border border-red-700 text-white input-glow"
            />
          </div>

          {error && <p className="text-red-400 text-sm error-shake">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded font-semibold transition btn-pulse disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-black/60 px-3 text-gray-400">or</span>
          </div>
        </div>

        <button
          onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
          className="w-full py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
        >
          Continue with Facebook
        </button>

        <p className="text-center text-gray-300 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-cyan-400 hover:text-orange-400 transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}