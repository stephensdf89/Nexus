import { supabase } from "@/lib/supabase";
import defaultStages from "@/app/pipelines/utils/defaultStages";

export async function POST(req) {
  const {
    data: { user }
  } = await supabase.auth.getUser(
    req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
  );

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete all stages
  await supabase
    .from("pipeline_stages")
    .delete()
    .eq("user_id", user.id);

  // Insert defaults
  const rows = defaultStages.map((s, index) => ({
    user_id: user.id,
    name: s.name,
    order: index,
    is_default: true,
    is_required: s.is_required,
    is_hidden: false
  }));

  await supabase.from("pipeline_stages").insert(rows);

  return Response.json({ success: true });
}
