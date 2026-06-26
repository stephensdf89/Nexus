import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth-server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enabled } = await req.json();

  return NextResponse.json({ aiEnabled: Boolean(enabled) });
}



