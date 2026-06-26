import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { getAnalytics } from "@/lib/postpulse-server";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const platform = searchParams.get("platform");

  if (!postId || !platform) {
    return NextResponse.json({ error: "Missing postId or platform" }, { status: 400 });
  }

  const token = await prisma.platformToken.findFirst({
    where: { userId: user.id, platform },
  });

  if (!token) {
    return NextResponse.json({ error: "Platform not connected" }, { status: 400 });
  }

  const data = await getAnalytics({
    accessToken: token.accessToken,
    postId,
  });

  return NextResponse.json(data);
}


