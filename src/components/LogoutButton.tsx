"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="bg-black/80 border border-cyan-400/40 px-4 py-2 rounded-lg text-sm text-cyan-300 hover:shadow-[0_0_10px_rgba(0,229,255,0.3)] hover:border-cyan-400/60 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
