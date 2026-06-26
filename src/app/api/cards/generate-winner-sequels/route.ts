import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth-server";

import { isWinner } from "@/src/lib/winnerDetector";
import { generateSeriesTopics } from "@/src/lib/seriesPatternGenerator";
import hookGenerator from "@/src/lib/hookGenerator";
import scriptRewriter from "@/src/lib/scriptRewriter";
import captionGenerator from "@/src/lib/captionGenerator";
import titleGenerator from "@/src/lib/titleGenerator";
import hashtagGenerator from "@/src/lib/hashtagGenerator";
import autoThumbnailGenerator from "@/src/lib/autoThumbnailGenerator";
import viralOptimizer from "@/src/lib/viralOptimizer";
import viralPredictor from "@/src/lib/viralPredictor";

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

  // Find the top winner
  const winners = posts.filter((p: any) => isWinner(p, averages));
  if (winners.length === 0) {
    return NextResponse.json({ message: "No winning posts found" });
  }

  const topWinner = winners[0];

  if (!topWinner.cardId) {
    return NextResponse.json({ error: "Winning post has no linked card" }, { status: 400 });
  }

  // Find original card
  const card = await prisma.card.findFirst({
    where: { id: topWinner.cardId }
  });

  if (!card) {
    return NextResponse.json({ error: "Original card not found" }, { status: 404 });
  }

  // Generate 5-part series topics
  const seriesTopics = generateSeriesTopics(card.title);

  const newCards = [];

  for (const topic of seriesTopics) {
    // Generate components
    const hook = hookGenerator.generate({
      topic,
      niche: card.niche ?? undefined,
      platform: "tiktok",
      vibe: "aggressive"
    })[0];

    const script = scriptRewriter.rewrite({
      script: card.script ?? undefined,
      topic,
      platform: "tiktok",
      niche: card.niche ?? undefined,
      vibe: "aggressive"
    });

    const caption = captionGenerator.generate({
      topic,
      niche: card.niche ?? undefined,
      platform: "instagram",
      vibe: "aggressive"
    });

    const title = titleGenerator.generate({
      topic,
      niche: card.niche ?? undefined,
      platform: "youtube",
      vibe: "aggressive"
    })[0];

    const hashtags = hashtagGenerator.generate({
      topic,
      niche: card.niche ?? undefined,
      platform: "instagram",
      vibe: "aggressive"
    });

    const thumbnails = autoThumbnailGenerator.generate({
      title,
      topic,
      niche: card.niche ?? undefined,
      vibe: "aggressive"
    });

    // Optimize
    const optimized = viralOptimizer.optimize(
      { title, script, caption },
      []
    );

    // Save new card
    const newCard = await prisma.card.create({
      data: {
        userId: user.id,
        title: optimized.title,
        niche: card.niche,
        script: optimized.script,
        caption: optimized.caption,
        mediaUrl: null,
        platforms: ["instagram", "tiktok", "youtube"]
      }
    });

    // Viral score
    const allCards = await prisma.card.findMany({
      where: { userId: user.id }
    });

    const viral = viralPredictor.predict(newCard, allCards);

    newCards.push({
      newCard,
      hook,
      script,
      caption,
      title,
      hashtags,
      thumbnails,
      viral
    });
  }

  return NextResponse.json({
    originalCardId: card.id,
    series: newCards
  });
}



