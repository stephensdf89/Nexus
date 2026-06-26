import { supabase } from "@/lib/supabaseClient";

export async function getClientSession() {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

export async function getAuthHeaders() {
  const session = await getClientSession();
  if (!session) return {};

  return {
    "x-user-id": session.user?.id || "",
    "x-user-email": session.user?.email || "",
    "x-supabase-auth": session.access_token || "",
  };
}

export async function getCurrentUser() {
  if (typeof window !== "undefined") {
    return null;
  }

  const { getCurrentUser: getServerCurrentUser } = await import("@/src/lib/auth-server");
  return getServerCurrentUser();
}
