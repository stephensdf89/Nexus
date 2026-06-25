"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AccessibilityButton from "@/components/AccessibilityButton";
import HistoryNavigation from "@/components/HistoryNavigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { clearAuthCookies } from "@/lib/auth";

type SessionState = {
  email: string;
  displayName: string;
  initial: string;
  avatarUrl: string;
};

export default function Topbar() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>({
    email: "",
    displayName: "",
    initial: "?",
    avatarUrl: "",
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  const readAccessToken = () => {
    if (typeof document === "undefined") {
      return "";
    }

    const cookie = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("sb-access-token="));

    return cookie ? decodeURIComponent(cookie.split("=")[1] || "") : "";
  };

  useEffect(() => {
    let isMounted = true;
    let supabase;

    try {
      supabase = getSupabaseClient();
    } catch {
      return;
    }

    if (!supabase) {
      return;
    }

    const loadSession = async (forceRefresh = false) => {
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();

      if (!isMounted || !authSession?.user?.email) {
        return;
      }

      const cacheKey = `topbar-display-name-${authSession.user.id}`;
      const cachedRaw =
        typeof window !== "undefined" ? window.sessionStorage.getItem(cacheKey) || "" : "";

      let cachedDisplayName = "";
      let cachedAvatarUrl = "";
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw) as { displayName?: string; avatarUrl?: string };
          cachedDisplayName = String(parsed?.displayName || "");
          cachedAvatarUrl = String(parsed?.avatarUrl || "");
        } catch {
          cachedDisplayName = cachedRaw;
        }
      }

      if (!forceRefresh && (cachedDisplayName || cachedAvatarUrl)) {
        const label = cachedDisplayName || authSession.user.email;
        setSession({
          email: authSession.user.email,
          displayName: cachedDisplayName,
          initial: label.slice(0, 1).toUpperCase(),
          avatarUrl: cachedAvatarUrl,
        });
      }

      let displayName = "";

      const profilePromise = authSession.user.id
        ? supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", authSession.user.id)
            .maybeSingle()
        : Promise.resolve({ data: null as { name?: string; avatar_url?: string } | null });

      const settingsPromise = (async () => {
        try {
          const headers: Record<string, string> = {};
          const accessToken = readAccessToken();
          if (accessToken) {
            headers["x-supabase-auth"] = accessToken;
          }

          const response = await fetch("/api/settings", {
            credentials: "include",
            headers,
          });

          if (!response.ok) {
            return "";
          }

          const payload = await response.json();
          return String(payload?.settings?.displayName || "");
        } catch {
          return "";
        }
      })();

      const [profileResult, settingsDisplayName] = await Promise.all([profilePromise, settingsPromise]);

      displayName = String(profileResult?.data?.name || settingsDisplayName || "");
      const avatarUrl = String(profileResult?.data?.avatar_url || "");

      if (typeof window !== "undefined") {
        if (displayName || avatarUrl) {
          window.sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              displayName,
              avatarUrl,
            })
          );
        } else {
          window.sessionStorage.removeItem(cacheKey);
        }
      }

      const label = displayName || authSession.user.email;

      setSession({
        email: authSession.user.email,
        displayName,
        initial: label.slice(0, 1).toUpperCase(),
        avatarUrl,
      });
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!isMounted) {
        return;
      }

      if (!authSession?.user?.email) {
        setSession({ email: "", displayName: "", initial: "?", avatarUrl: "" });
        return;
      }

      setSession({
        email: authSession.user.email,
        displayName: "",
        initial: authSession.user.email.slice(0, 1).toUpperCase(),
        avatarUrl: "",
      });

      // Refresh profile display label on auth changes.
      void loadSession();
    });

    const handleProfileUpdated = () => {
      void loadSession(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("profile-updated", handleProfileUpdated);
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("profile-updated", handleProfileUpdated);
      }
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return;
      }
      await supabase.auth.signOut();
      clearAuthCookies();
      router.replace("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-y-2 border-b border-cyan-400/30 bg-[rgba(10,20,58,0.86)] px-4 py-2 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 flex-col justify-center">
        <p className="text-sm leading-tight text-cyan-100/75">Creator Dashboard</p>
        <h2 className="text-base font-semibold leading-tight sm:text-lg">Welcome back</h2>
      </div>

      <div className="relative flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
        <Suspense fallback={null}>
          <HistoryNavigation embedded />
        </Suspense>

        <button
          type="button"
          onClick={() => router.push("/notifications")}
          className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-500/20"
        >
          Notifications
        </button>

        <AccessibilityButton />

        <div className="hidden text-right md:block">
          <p className="text-sm">{session.displayName || session.email || "Creator account"}</p>
          <p className="text-xs text-cyan-100/60">Active session</p>
        </div>

        {session.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.avatarUrl}
            alt="Profile"
            className="h-9 w-9 rounded-full border border-cyan-300/50 object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-sm font-bold text-[#05163b]">
            {session.initial}
          </div>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-lg border border-cyan-400/45 bg-violet-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-gradient-to-r hover:from-cyan-500 hover:to-violet-600 hover:text-[#05163b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? "Signing Out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}