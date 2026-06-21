"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let supabase;

    try {
      supabase = getSupabaseClient();
    } catch (clientError) {
      if (isMounted) {
        setError(
          clientError instanceof Error
            ? clientError.message
            : "Supabase configuration is missing."
        );
        setStatus("error");
      }

      return () => {
        isMounted = false;
      };
    }

    const checkSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        setStatus("error");
        return;
      }

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setStatus("ready");
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      setStatus("ready");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <p className="text-sm text-neutral-400">Checking your session...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-red-900 bg-neutral-900 p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold">Authentication Unavailable</h1>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}