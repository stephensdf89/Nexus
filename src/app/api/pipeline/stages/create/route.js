import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const body = await req.json();

  const {
    data: { user }
  } = await supabase.auth.getUser(
    req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
  );

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = body;

  // Get max order
  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("user_id", user.id);

  const maxOrder = Math.max(...stages.map((s) => s.order));

  const { data } = await supabase
    .from("pipeline_stages")
    .insert({
      user_id: user.id,
      name,
      order: maxOrder + 1,
      is_default: false,
      is_required: false,
      is_hidden: false
    })
    .select()
    .single();

  return Response.json(data);
}
