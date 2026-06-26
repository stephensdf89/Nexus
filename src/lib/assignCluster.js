import prisma from "@/src/lib/db";
import stringSimilarity from "string-similarity";

export async function assignCluster(card, genome, aiEnabled = false) {
  // 1. Try to match by topic category
  if (genome.topicCategory) {
    const existing = await prisma.contentGenome.findFirst({
      where: {
        topicCategory: genome.topicCategory,
        cardId: { not: card.id }
      }
    });

    if (existing) {
      await prisma.contentGenome.update({
        where: { cardId: card.id },
        data: { clusterId: existing.clusterId || existing.cardId }
      });

      return existing.clusterId || existing.cardId;
    }
  }

  // 2. Try to match by title similarity
  const allCards = await prisma.card.findMany({
    where: { userId: card.userId }
  });

  const titles = allCards.map((c) => c.title);
  const match = stringSimilarity.findBestMatch(card.title, titles);

  if (match.bestMatch.rating > 0.45) {
    const matchedCard = allCards.find((c) => c.title === match.bestMatch.target);

    const matchedGenome = await prisma.contentGenome.findUnique({
      where: { cardId: matchedCard.id }
    });

    if (matchedGenome) {
      await prisma.contentGenome.update({
        where: { cardId: card.id },
        data: { clusterId: matchedGenome.clusterId || matchedCard.id }
      });

      return matchedGenome.clusterId || matchedCard.id;
    }
  }

  // 3. AI fallback (optional)
  if (aiEnabled) {
    const clusterId = `cluster-${genome.topicCategory || card.niche}-${Date.now()}`;

    await prisma.contentGenome.update({
      where: { cardId: card.id },
      data: { clusterId }
    });

    return clusterId;
  }

  // 4. Default: create a new cluster
  const newClusterId = `cluster-${card.id}`;

  await prisma.contentGenome.update({
    where: { cardId: card.id },
    data: { clusterId: newClusterId }
  });

  return newClusterId;
}
