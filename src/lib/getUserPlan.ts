import { supabase } from "@/lib/supabaseClient";

export async function getUserPlan(userId: string) {
  if (!supabase) return "free";

  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .single();

  if (!data) return "free";
  if (data.status === "active" || data.status === "trialing") return "pro";
  return "free";
}
