import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

import { clusterCards, findMissingPieces } from "@/src/lib/themeClusterEngine";

import hookGenerator from "@/src/lib/hookGenerator";
import scriptRewriter from "@/src/lib/scriptRewriter";
import captionGenerator from "@/src/lib/captionGenerator";
import titleGenerator from "@/src/lib/titleGenerator";
import hashtagGenerator from "@/src/lib/hashtagGenerator";
import autoThumbnailGenerator from "@/src/lib/autoThumbnailGenerator";
import viralOptimizer from "@/src/lib/viralOptimizer";
import viralPredictor from "@/src/lib/viralPredictor";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await prisma.card.findMany({
    where: { userId: user.id }
  });

  if (cards.length === 0) {
    return NextResponse.json({ error: "No cards found" }, { status: 400 });
  }

  // 1. Cluster cards by theme/niche
  const clusters = clusterCards(cards);

  const clusterResults = {};

  for (const niche in clusters) {
    const cluster = clusters[niche];

    // 2. Find missing pieces
    const gaps = findMissingPieces(cluster);

    const generated = [];

    for (const gap of gaps) {
      const topic = `${niche}: ${gap}`;

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
          niche,
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

      generated.push({
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

    clusterResults[niche] = {
      existingCards: cluster,
      missingPieces: gaps,
      generatedCards: generated
    };
  }

  return NextResponse.json({ clusters: clusterResults });
}
