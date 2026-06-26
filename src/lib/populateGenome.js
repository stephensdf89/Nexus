import prisma from "@/src/lib/db";
import { classifyContent } from "./classifyContent"; // AI optional
import { assignCluster } from "./assignCluster";
import { assignSeries } from "./assignSeries";

export async function populateGenome(card, aiEnabled = false) {
  const base = {
    cardId: card.id,
    formatType: null,
    contentType: null,
    platformSuitability: null,
    lengthCategory: null,
    tone: null,
    ctaType: null,
    topicCategory: null,
    subTopicCategory: null,
    seriesId: null,
    clusterId: null,
    hookType: null,
    openingPattern: null,
    pacingPattern: null,
    valueType: null,
    emotionProfile: null
  };

  let aiData = {};

  if (aiEnabled) {
    try {
      aiData = await classifyContent({
        title: card.title,
        script: card.script,
        caption: card.caption
      });
    } catch (err) {
      console.error("AI classification failed:", err);
    }
  }

  const data = {
    ...base,
    ...aiData
  };

  const genome = await prisma.contentGenome.upsert({
    where: { cardId: card.id },
    update: data,
    create: data
  });

  // NEW: auto-assign cluster
  await assignCluster(card, genome, aiEnabled);

  // NEW: auto-assign series
  await assignSeries(card, genome, aiEnabled);

  return genome;
}
