import { NextRequest, NextResponse } from "next/server";
import { getEffectiveAccess, getUserFromRequest } from "@/lib/serverAccess";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({
        userId: null,
        email: null,
        isOwner: false,
        accessLevel: "user",
      });
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
    return NextResponse.json({
      userId: null,
      email: null,
      isOwner: false,
      accessLevel: "user",
    });
  }
}
