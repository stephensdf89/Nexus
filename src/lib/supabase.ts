import { getSupabaseClient as getSharedSupabaseClient } from "@/lib/supabaseClient";

export function getSupabaseClient() {
  const client = getSharedSupabaseClient();
  if (!client) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return client;
}
