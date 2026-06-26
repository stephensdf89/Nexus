import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import {
  getEffectiveAccess,
  getEffectiveAccessByEmail,
  getUserFromRequest,
} from "@/lib/serverAccess";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (user) {
      const effective = await getEffectiveAccess(user);

      return NextResponse.json({
        userId: user.id,
        email: user.email || null,
        isOwner: effective.isOwner,
        accessLevel: effective.accessLevel,
      });
    }

    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email || null;

    if (sessionEmail) {
      const effective = await getEffectiveAccessByEmail(sessionEmail);
      return NextResponse.json({
        userId: null,
        email: sessionEmail,
        isOwner: effective.isOwner,
        accessLevel: effective.accessLevel,
      });
    }

    return NextResponse.json({
      userId: null,
      email: null,
      isOwner: false,
      accessLevel: "user",
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


