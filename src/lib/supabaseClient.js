import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createBrowserSupabaseClient() {
  if (typeof window === "undefined" || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!globalThis.__creatorNexusSupabaseClient) {
    globalThis.__creatorNexusSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return globalThis.__creatorNexusSupabaseClient;
}

const supabase = createBrowserSupabaseClient();

export function getSupabaseClient() {
  return createBrowserSupabaseClient();
}

export { supabase };
