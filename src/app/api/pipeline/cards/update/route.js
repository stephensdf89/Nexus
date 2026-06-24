import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const body = await req.json();

  const { cardId, updates } = body;

  const { data } = await supabase
    .from("pipeline_cards")
    .update(updates)
    .eq("id", cardId)
    .select()
    .single();

  return Response.json(data);
}
