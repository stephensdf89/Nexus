import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const body = await req.json();

  const { stageId, updates } = body;

  const { data } = await supabase
    .from("pipeline_stages")
    .update(updates)
    .eq("id", stageId)
    .select()
    .single();

  return Response.json(data);
}
