"use client";

import { useState, useEffect, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSettingsStore } from "@/lib/settingsStore";

export default function LoginPage() {
  const router = useRouter();
  const a11y = useSettingsStore();
  const [showMenu, setShowMenu] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    a11y.load();

    const savedEmail = localStorage.getItem("loginEmail");
    const savedPassword = localStorage.getItem("loginPassword");
    if (savedEmail) {
      setEmail(savedEmail);
      setPassword(savedPassword || "");
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem("loginEmail", email);
      localStorage.setItem("loginPassword", password);
    } else {
      localStorage.removeItem("loginEmail");
      localStorage.removeItem("loginPassword");
    }

    const result = await signIn("credentials", { redirect: false, email, password });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen fade-in flex flex-col items-center justify-center bg-gradient-to-br from-[#050a1f] via-[#0b1c4d] to-[#2a0d5c] p-6 transition-colors duration-300">
      <a href="#login-form" className="absolute top-2 left-2 bg-cyan-500 text-slate-950 px-3 py-1 rounded focus:outline-white z-40 sr-only focus:not-sr-only" aria-label="Skip to login form">Skip to login form</a>

      <button onClick={() => setShowMenu(!showMenu)} aria-label="Open Accessibility Menu" aria-expanded={showMenu} className="absolute top-4 right-4 px-3 py-2 rounded focus:outline-2 focus:outline-offset-2 bg-cyan-500 text-slate-950 focus:outline-cyan-400">
        A11y
      </button>

      {showMenu && (
        <div className="absolute top-16 right-4 p-4 rounded w-72 z-50 border-2 bg-slate-900/95 border-cyan-400/70 text-white">
          <h2 className="font-bold mb-4 text-lg">Accessibility Options</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Text Size:</span>
              <select value={a11y.textSize} onChange={(e) => a11y.update("textSize", e.target.value)} className="ml-2 px-2 py-1 rounded border bg-slate-950 border-cyan-400/70 text-white">
                <option value="small">Small</option>
                <option value="medium">Default</option>
                <option value="large">Large</option>
              </select>
            </label>
            <label className="flex items-center justify-between">
              <span>Color Blind Mode:</span>
              <select value={a11y.colorBlindMode} onChange={(e) => a11y.update("colorBlindMode", e.target.value)} className="ml-2 px-2 py-1 rounded border bg-slate-950 border-cyan-400/70 text-white">
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              </select>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={a11y.disableNeon} onChange={() => a11y.update("disableNeon", !a11y.disableNeon)} className="mr-2 w-4 h-4 cursor-pointer" />
              <span>Disable Neon Effects</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={a11y.safeMode} onChange={() => a11y.update("safeMode", !a11y.safeMode)} className="mr-2 w-4 h-4 cursor-pointer" />
              <span>Seizure-Safe Mode</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={a11y.reducedMotion} onChange={() => a11y.update("reducedMotion", !a11y.reducedMotion)} className="mr-2 w-4 h-4 cursor-pointer" />
              <span>Reduced Motion</span>
            </label>
          </div>
          <button onClick={() => setShowMenu(false)} className="w-full mt-4 px-3 py-2 rounded border bg-violet-600 text-white border-violet-400/70 hover:bg-violet-700">Close</button>
        </div>
      )}

      <form id="login-form" onSubmit={handleLogin} className={`bg-slate-950/60 text-white border border-cyan-300/35 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md ${!a11y.reducedMotion && !a11y.safeMode ? "slide-up" : ""}`}>
        <img src="/logo.png" alt="Nexus logo" width="88" height="88" className="mx-auto mb-4 h-20 w-20 rounded-md ring-1 ring-cyan-300/40" />
        <h1 className="text-3xl font-bold mb-6">Sign In</h1>
        {error && <p className="text-violet-200 mb-4 p-3 rounded bg-violet-900/35 border border-violet-400/50 error-shake" role="alert">{error}</p>}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 font-semibold">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-required="true" aria-label="Email address" className={`w-full p-3 rounded transition-all duration-200 bg-slate-950/40 border border-cyan-400/60 text-white input-glow ${a11y.textSize === "large" ? "text-lg" : a11y.textSize === "small" ? "text-sm" : ""} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400`} autoComplete="email" />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 font-semibold">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required aria-required="true" aria-label="Password" className={`w-full p-3 rounded transition-all duration-200 bg-slate-950/40 border border-cyan-400/60 text-white input-glow pr-12 ${a11y.textSize === "large" ? "text-lg" : a11y.textSize === "small" ? "text-sm" : ""} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400`} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white">{showPassword ? "hide" : "show"}</button>
            </div>
          </div>
          <div className="flex items-center">
            <input id="rememberMe" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded cursor-pointer" aria-label="Remember me on this device" />
            <label htmlFor="rememberMe" className="ml-2 cursor-pointer text-sm">Remember me</label>
          </div>
          <button type="submit" disabled={isLoading} className={`w-full py-3 rounded font-semibold transition-all duration-200 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 ${!a11y.reducedMotion && !a11y.safeMode ? "btn-pulse" : ""}`} aria-busy={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</button>
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center border-t border-gray-700" />
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-slate-950/60 text-cyan-100/80">or</span>
          </div>
        </div>
        <button type="button" onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })} className="w-full py-3 rounded font-semibold transition-all duration-200 bg-violet-600 hover:bg-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500">Continue with Facebook</button>
        <p className="text-center mt-4 text-sm">Don&apos;t have an account? <Link href="/signup" className="font-semibold underline transition-colors text-cyan-300 hover:text-violet-300">Sign up</Link></p>
      </form>
    </div>
  );
}
