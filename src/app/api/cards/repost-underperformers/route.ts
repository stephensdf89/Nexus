import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth-server";

import { isUnderperforming } from "@/src/lib/underperformanceDetector";
import multiPlatformRepurposer from "@/src/lib/multiPlatformRepurposer";
import viralOptimizer from "@/src/lib/viralOptimizer";
import { getBestTimeForPlatform } from "@/src/lib/bestTimeEngine";
import { postContent } from "@/src/lib/postpulse";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { platform } = body;

  if (!platform) {
    return NextResponse.json({ error: "Missing platform" }, { status: 400 });
  }

  // Fetch last 30 posts
  const posts = await prisma.postPerformance.findMany({
    where: { userId: user.id, platform },
    orderBy: { postedAt: "desc" },
    take: 30
  });

  if (posts.length === 0) {
    return NextResponse.json({ error: "No posts found" }, { status: 400 });
  }

  // Compute averages
  const averages = {
    likes: posts.reduce((a: number, p: any) => a + (p.likes || 0), 0) / posts.length,
    comments: posts.reduce((a: number, p: any) => a + (p.comments || 0), 0) / posts.length,
    shares: posts.reduce((a: number, p: any) => a + (p.shares || 0), 0) / posts.length,
    views: posts.reduce((a: number, p: any) => a + (p.views || 0), 0) / posts.length,
    watchTime: posts.reduce((a: number, p: any) => a + (p.watchTime || 0), 0) / posts.length
  };

  // Find underperformers
  const underperformers = posts.filter((p: any) => isUnderperforming(p, averages));

  if (underperformers.length === 0) {
    return NextResponse.json({ message: "No underperforming posts" });
  }

  // Get platform token
  const token = await prisma.platformToken.findFirst({
    where: { userId: user.id, platform }
  });

  if (!token) {
    return NextResponse.json({ error: "Platform not connected" }, { status: 400 });
  }

  const reposts = [];

  for (const perf of underperformers) {
    if (!perf.cardId) continue;

    // Find the original card
    const card = await prisma.card.findFirst({
      where: { id: perf.cardId }
    });

    if (!card) continue;

    // Optimize the content
    const optimized = viralOptimizer.optimize(card, []);

    // Repurpose for platform
    const repurposed = multiPlatformRepurposer.repurpose({
      script: optimized.script,
      topic: optimized.title,
      niche: card.niche ?? undefined,
      vibe: "aggressive"
    });

    const version = (repurposed as Record<string, any>)[platform];
    const content = version.caption || optimized.caption || optimized.title;
    const media = card.mediaUrl || null;

    // Best time for repost
    const bestTime = await getBestTimeForPlatform(user.id, platform);

    const now = new Date();
    const [hour, minute] = bestTime.split(":");
    now.setHours(parseInt(hour), parseInt(minute), 0);

    // Schedule repost
    const result = await postContent({
      accessToken: token.accessToken,
      platform,
      content,
      media,
      scheduleFor: now.toISOString()
    });

    reposts.push({
      originalPost: perf.id,
      repostScheduledFor: now.toISOString(),
      postpulseResponse: result
    });
  }

  return NextResponse.json({ reposts });
}



