import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req) {
  const {
    data: { user }
  } = await supabase.auth.getUser(
    req.headers.get("authorization")?.replace("Bearer ", "") ?? ""
  );

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("pipeline_cards")
    .select("*")
    .eq("user_id", user.id);

  return Response.json(data);
}
