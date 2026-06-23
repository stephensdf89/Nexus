"use client";

import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

export function AuthGuard({ children }: { children: ReactNode }) {
  const authContext = useUser();
  const [supabaseLoaded, setSupabaseLoaded] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  if (!authContext) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Auth context not available</p>
      </div>
    );
  }
  
  const { user, loading } = authContext;
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setSessionChecked(true);
    }
  }, [user]);

  useEffect(() => {
    // Check Supabase session directly as fallback
    const checkSession = async () => {
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setSupabaseLoaded(true);
          }
        } catch (error) {
          console.error("Session check failed:", error);
        } finally {
          setSessionChecked(true);
        }
      }
    };

    if (!user && !loading) {
      checkSession();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && sessionChecked && !user) {
      router.push("/login");
    }
  }, [loading, sessionChecked, user, router]);

  // Show loading screen with timeout
  if ((loading || !sessionChecked) && !supabaseLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}