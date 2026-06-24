import { NextResponse } from "next/server";
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

  const { stageId } = body;

  const { data } = await supabase
    .from("pipeline_cards")
    .insert({
      user_id: user.id,
      stage_id: stageId,
      title: "New Content",
      description: "",
      platforms: [],
      platform_fields: {},
      notes: "",
      analytics: {}
    })
    .select()
    .single();

  return Response.json(data);
}
