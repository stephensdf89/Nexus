import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { cardId, platform, postedAt, likes, comments, shares, views, watchTime } = body;

  const perf = await prisma.postPerformance.create({
    data: {
      userId: user.id,
      cardId,
      platform,
      postedAt: new Date(postedAt),
      likes,
      comments,
      shares,
      views,
      watchTime
    }
  });

  return NextResponse.json({ success: true, perf });
}

