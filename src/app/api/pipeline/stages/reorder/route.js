import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const body = await req.json();

  const { stageId, newOrder } = body;

  const { data } = await supabase
    .from("pipeline_stages")
    .update({ order: newOrder })
    .eq("id", stageId)
    .select()
    .single();

  return Response.json(data);
}
