import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth-server";
import { buildUniverseMap } from "@/src/lib/universe/buildUniverseMap";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const map = await buildUniverseMap(user.id);

  return NextResponse.json(map);
}



