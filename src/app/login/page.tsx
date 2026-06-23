"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/AuthContext";
import { useSettingsStore } from "@/lib/settingsStore";
import { setAuthCookies } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const authContext = useUser();
  const user = authContext?.user;
  const a11y = useSettingsStore();
  const loadA11y = useSettingsStore((state) => state.load);
  const [showMenu, setShowMenu] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 15000): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error("Sign-in request timed out. Please try again."));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };

  const waitForSession = async (maxAttempts = 10) => {
    if (!supabase) {
      return null;
    }

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const { data } = await withTimeout(supabase.auth.getSession(), 4000);
      if (data.session) {
        return data.session;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return null;
  };

  useEffect(() => {
    loadA11y();
  }, [loadA11y]);

  useEffect(() => {
    // Restore saved credentials if they exist
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("loginEmail");
      const savedPassword = localStorage.getItem("loginPassword");
      if (savedEmail) {
        setEmail(savedEmail);
        setPassword(savedPassword || "");
        setRememberMe(true);
      }

      // Restore pending credentials from signup
      const pendingEmail = sessionStorage.getItem("pendingEmail");
      const pendingPassword = sessionStorage.getItem("pendingPassword");
      if (pendingEmail || pendingPassword) {
        setEmail(pendingEmail || "");
        setPassword(pendingPassword || "");
        sessionStorage.removeItem("pendingEmail");
        sessionStorage.removeItem("pendingPassword");
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!supabase) {
      setError("Supabase is not configured");
      setIsLoading(false);
      return;
    }

    // Save or clear credentials based on remember me
    if (rememberMe) {
      localStorage.setItem("loginEmail", email);
      localStorage.setItem("loginPassword", password);
    } else {
      localStorage.removeItem("loginEmail");
      localStorage.removeItem("loginPassword");
    }

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        15000
      );

      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        return;
      }

      if (data?.session) {
        setAuthCookies(
          {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          },
          rememberMe
        );
        window.location.assign("/dashboard");
        return;
      } else {
        const session = await waitForSession();

        if (session) {
          setAuthCookies(
            {
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
            },
            rememberMe
          );
          window.location.assign("/dashboard");
          return;
        }

        setError("Login succeeded but no session was stored. Please try again.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      console.error("Login exception:", err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const textSizeClass = 
    a11y.textSize === "large" ? "text-lg" : 
    a11y.textSize === "small" ? "text-sm" : 
    "";

  return (
    <div className={`relative min-h-screen fade-in flex flex-col items-center justify-center bg-gradient-to-br from-[#050a1f] via-[#0b1c4d] to-[#2a0d5c] p-6 transition-colors duration-300 ${a11y.textSize === "large" ? "text-base" : a11y.textSize === "small" ? "text-sm" : "text-base"}`}>
      {/* Skip link */}
      <a href="#login-form" className="absolute top-2 left-2 bg-cyan-500 text-slate-950 px-3 py-1 rounded focus:outline-white z-40 sr-only focus:not-sr-only text-xs font-semibold" aria-label="Skip to login form">Skip to login form</a>

      {/* Accessibility button */}
      <button 
        onClick={() => setShowMenu(!showMenu)} 
        aria-label="Open Accessibility Menu" 
        aria-expanded={showMenu} 
        className="absolute top-4 right-4 px-3 py-2 rounded focus:outline-2 focus:outline-offset-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors font-semibold text-sm"
      >
        A11y
      </button>

      {/* Accessibility menu */}
      {showMenu && (
        <div className="absolute top-16 right-4 p-4 rounded w-72 z-50 border-2 bg-slate-900/95 border-cyan-400/70 text-white shadow-lg">
          <h2 className="font-bold mb-4 text-lg">Accessibility Options</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">Text Size:</span>
              <select 
                value={a11y.textSize} 
                onChange={(e) => a11y.update("textSize", e.target.value)} 
                className="ml-2 px-2 py-1 rounded border bg-slate-950 border-cyan-400/70 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Text size selection"
              >
                <option value="small">Small</option>
                <option value="medium">Default</option>
                <option value="large">Large</option>
              </select>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">Color Blind Mode:</span>
              <select 
                value={a11y.colorBlindMode} 
                onChange={(e) => a11y.update("colorBlindMode", e.target.value)} 
                className="ml-2 px-2 py-1 rounded border bg-slate-950 border-cyan-400/70 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Color blind mode selection"
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              </select>
            </label>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={a11y.disableNeon} 
                onChange={() => a11y.update("disableNeon", !a11y.disableNeon)} 
                className="mr-2 w-4 h-4 cursor-pointer focus:ring-2 focus:ring-cyan-400" 
                aria-label="Disable neon effects"
              />
              <span className="text-sm">Disable Neon Effects</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={a11y.safeMode} 
                onChange={() => a11y.update("safeMode", !a11y.safeMode)} 
                className="mr-2 w-4 h-4 cursor-pointer focus:ring-2 focus:ring-cyan-400" 
                aria-label="Seizure-safe mode"
              />
              <span className="text-sm">Seizure-Safe Mode</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={a11y.reducedMotion} 
                onChange={() => a11y.update("reducedMotion", !a11y.reducedMotion)} 
                className="mr-2 w-4 h-4 cursor-pointer focus:ring-2 focus:ring-cyan-400" 
                aria-label="Reduced motion"
              />
              <span className="text-sm">Reduced Motion</span>
            </label>
          </div>
          <button 
            onClick={() => setShowMenu(false)} 
            className="w-full mt-4 px-3 py-2 rounded border bg-violet-600 text-white border-violet-400/70 hover:bg-violet-700 transition-colors text-sm font-semibold"
          >
            Close
          </button>
        </div>
      )}

      {/* Logo */}
      <div className="mb-6">
        <img 
          src="/logo.png" 
          alt="Content Creator Nexus Logo" 
          width={140} 
          height={140} 
          className="rounded-md shadow-lg h-20 w-20"
        />
      </div>

      {/* Login form */}
      <form 
        id="login-form" 
        onSubmit={handleLogin} 
        className={`bg-slate-950/60 text-white border border-cyan-300/35 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md transition-all ${!a11y.reducedMotion && !a11y.safeMode ? "slide-up" : ""}`}
      >
        <h1 className={`font-bold mb-6 text-center ${a11y.textSize === "large" ? "text-3xl" : a11y.textSize === "small" ? "text-2xl" : "text-3xl"}`}>
          Sign In
        </h1>

        {/* Error alert */}
        {error && (
          <div 
            className={`text-violet-200 mb-4 p-3 rounded bg-violet-900/35 border border-violet-400/50 ${!a11y.reducedMotion && !a11y.safeMode ? "error-shake" : ""}`} 
            role="alert"
          >
            <p className={`${textSizeClass}`}>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Email field */}
          <div>
            <label htmlFor="email" className={`block mb-2 font-semibold ${textSizeClass}`}>
              Email
            </label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
              aria-required="true" 
              aria-label="Email address" 
              className={`w-full p-3 rounded transition-all duration-200 bg-slate-950/40 border border-cyan-400/60 text-white input-glow ${textSizeClass} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed`} 
              autoComplete="email" 
            />
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className={`block mb-2 font-semibold ${textSizeClass}`}>
              Password
            </label>
            <div className="relative">
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={isLoading}
                aria-required="true" 
                aria-label="Password" 
                className={`w-full p-3 rounded transition-all duration-200 bg-slate-950/40 border border-cyan-400/60 text-white input-glow pr-12 ${textSizeClass} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed`} 
                autoComplete="current-password" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"} 
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${textSizeClass}`}
              >
                {showPassword ? "hide" : "show"}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center">
            <input 
              id="rememberMe" 
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
              disabled={isLoading}
              className={`w-4 h-4 rounded cursor-pointer accent-cyan-500 focus:ring-2 focus:ring-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed`}
              aria-label="Remember me on this device"
            />
            <label htmlFor="rememberMe" className={`ml-2 cursor-pointer ${textSizeClass} text-gray-300 hover:text-white transition-colors`}>
              Remember me
            </label>
          </div>

          {/* Sign in button */}
          <button 
            type="submit" 
            disabled={isLoading} 
            className={`w-full py-3 rounded font-semibold transition-all duration-200 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 ${textSizeClass} ${!a11y.reducedMotion && !a11y.safeMode ? "btn-pulse" : ""}`} 
            aria-busy={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Sign up link */}
        <p className={`text-center mt-4 ${textSizeClass}`}>
          Don&apos;t have an account?{" "}
          <a 
            href="/signup" 
            className="font-semibold underline transition-colors text-cyan-300 hover:text-violet-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400"
          >
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
