import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

import hookGenerator from "@/src/lib/hookGenerator";
import scriptRewriter from "@/src/lib/scriptRewriter";
import captionGenerator from "@/src/lib/captionGenerator";
import titleGenerator from "@/src/lib/titleGenerator";
import hashtagGenerator from "@/src/lib/hashtagGenerator";
import autoThumbnailGenerator from "@/src/lib/autoThumbnailGenerator";
import viralPredictor from "@/src/lib/viralPredictor";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { niche = "", theme = "" } = body;

  // 1. Generate 30 topics
  const topics = Array.from({ length: 30 }).map((_, i) => {
    return `${theme || niche || "content"} idea ${i + 1}`;
  });

  const createdCards = [];

  for (const topic of topics) {
    // Generate components
    const hook = hookGenerator.generate({
      topic,
      niche,
      platform: "tiktok",
      vibe: "aggressive"
    })[0];

    const script = scriptRewriter.rewrite({
      script: "",
      topic,
      platform: "tiktok",
      niche,
      vibe: "aggressive"
    });

    const caption = captionGenerator.generate({
      topic,
      niche,
      platform: "instagram",
      vibe: "aggressive"
    });

    const title = titleGenerator.generate({
      topic,
      niche,
      platform: "youtube",
      vibe: "aggressive"
    })[0];

    const hashtags = hashtagGenerator.generate({
      topic,
      niche,
      platform: "instagram",
      vibe: "aggressive"
    });

    const thumbnails = autoThumbnailGenerator.generate({
      title,
      topic,
      niche,
      vibe: "aggressive"
    });

    // Save card
    const card = await prisma.card.create({
      data: {
        userId: user.id,
        title,
        niche,
        script,
        caption,
        mediaUrl: null,
        platforms: ["instagram", "tiktok", "youtube"]
      }
    });

    // Viral score
    const allCards = await prisma.card.findMany({
      where: { userId: user.id }
    });

    const viral = viralPredictor.predict(card, allCards);

    createdCards.push({
      card,
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
    calendar: createdCards
  });
}
