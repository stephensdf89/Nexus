import prisma from "@/src/lib/db";
import stringSimilarity from "string-similarity";

export async function assignSeries(card, genome, aiEnabled = false) {
  const title = card.title;

  // 1. Detect "Part X" pattern
  const partMatch = title.match(/(.+?)\s*[-\u2013\u2014]?\s*Part\s*(\d+)/i);

  if (partMatch) {
    const baseTitle = partMatch[1].trim();

    // Find other cards with same base title
    const allCards = await prisma.card.findMany({
      where: { userId: card.userId }
    });

    const matching = allCards.filter((c) =>
      c.title.toLowerCase().startsWith(baseTitle.toLowerCase())
    );

    // Use the first card as the series root
    const root = matching[0];

    await prisma.contentGenome.update({
      where: { cardId: card.id },
      data: { seriesId: root.id }
    });

    return root.id;
  }

  // 2. Detect similarity-based series (non-AI)
  const allCards = await prisma.card.findMany({
    where: { userId: card.userId }
  });

  const titles = allCards.map((c) => c.title);
  const match = stringSimilarity.findBestMatch(title, titles);

  if (match.bestMatch.rating > 0.55) {
    const matchedCard = allCards.find((c) => c.title === match.bestMatch.target);

    const matchedGenome = await prisma.contentGenome.findUnique({
      where: { cardId: matchedCard.id }
    });

    if (matchedGenome?.seriesId) {
      await prisma.contentGenome.update({
        where: { cardId: card.id },
        data: { seriesId: matchedGenome.seriesId }
      });

      return matchedGenome.seriesId;
    }

    // If matched card has no series, create one
    const newSeriesId = `series-${matchedCard.id}`;

    await prisma.contentGenome.update({
      where: { cardId: matchedCard.id },
      data: { seriesId: newSeriesId }
    });

    await prisma.contentGenome.update({
      where: { cardId: card.id },
      data: { seriesId: newSeriesId }
    });

    return newSeriesId;
  }

  // 3. AI fallback (optional)
  if (aiEnabled) {
    const newSeriesId = `series-${Date.now()}`;

    await prisma.contentGenome.update({
      where: { cardId: card.id },
      data: { seriesId: newSeriesId }
    });

    return newSeriesId;
  }

  // 4. No series detected
  return null;
}
