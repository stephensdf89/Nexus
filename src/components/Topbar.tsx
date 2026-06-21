"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type SessionState = {
  email: string;
  initial: string;
};

export default function Topbar() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>({
    email: "",
    initial: "?",
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let supabase;

    try {
      supabase = getSupabaseClient();
    } catch {
      return;
    }

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted || !session?.user.email) {
        return;
      }

      setSessionState({
        email: session.user.email,
        initial: session.user.email.charAt(0).toUpperCase(),
      });
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (!session?.user.email) {
        setSessionState({ email: "", initial: "?" });
        return;
      }

      setSessionState({
        email: session.user.email,
        initial: session.user.email.charAt(0).toUpperCase(),
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      document.cookie = "sb-access-token=; path=/; max-age=0; samesite=lax";
      document.cookie = "sb-refresh-token=; path=/; max-age=0; samesite=lax";
      router.replace("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-[#222] bg-[#0f0f0f] px-6">
      <div>
        <p className="text-sm text-neutral-500">Creator Workspace</p>
        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right md:block">
          <p className="text-sm text-white">
            {sessionState.email || "Signed in creator"}
          </p>
          <p className="text-xs text-neutral-500">Authenticated session</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-bold text-white">
          {sessionState.initial}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-md border border-red-500 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? "Signing Out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
