import { NextRequest, NextResponse } from "next/server";
import { getEffectiveAccess, getUserFromRequest } from "@/lib/serverAccess";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const effective = await getEffectiveAccess(user);

    return NextResponse.json({
      userId: user.id,
      email: user.email || null,
      isOwner: effective.isOwner,
      accessLevel: effective.accessLevel,
    });
  } catch (error) {
    console.error("Access me route failed:", error);
    return NextResponse.json({ error: "Failed to load access" }, { status: 500 });
  }
}
