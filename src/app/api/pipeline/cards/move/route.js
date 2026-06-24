import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Body: { cardId, stageId }
export async function PATCH(req) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(
    req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
  );

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.cardId || !body?.stageId) {
    return NextResponse.json({ error: "cardId and stageId are required" }, { status: 400 });
  }

  const { cardId, stageId } = body;

  const { data, error } = await supabase
    .from("pipeline_cards")
    .update({ stage_id: stageId })
    .eq("id", cardId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ card: data });
}
