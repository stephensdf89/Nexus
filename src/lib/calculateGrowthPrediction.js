import prisma from "@/src/lib/db";

export async function calculateGrowthPrediction(cardId) {
  const genome = await prisma.contentGenome.findUnique({
    where: { cardId }
  });

  if (!genome) return null;

  const {
    engagementScore = 0,
    retentionScore = 0,
    viralityScore = 0,
    platformPerformance = {},
    clusterId,
    seriesId
  } = genome;

  // 1. Cluster momentum
  let clusterMomentum = 0;
  if (clusterId) {
    const clusterCards = await prisma.contentGenome.findMany({
      where: { clusterId }
    });

    const clusterEngagement = clusterCards.map((c) => c.engagementScore || 0);
    clusterMomentum = clusterEngagement.reduce((a, b) => a + b, 0) / clusterEngagement.length;
  }

  // 2. Series momentum
  let seriesMomentum = 0;
  if (seriesId) {
    const seriesCards = await prisma.contentGenome.findMany({
      where: { seriesId }
    });

    const seriesEngagement = seriesCards.map((c) => c.engagementScore || 0);
    seriesMomentum = seriesEngagement.reduce((a, b) => a + b, 0) / seriesEngagement.length;
  }

  // 3. Platform momentum
  const platformValues = Object.values(platformPerformance || {});
  const platformMomentum = platformValues.length
    ? platformValues.reduce((a, b) => a + b, 0) / platformValues.length
    : 0;

  // 4. Weighted prediction model
  const growthPredictionScore =
    engagementScore * 0.35 +
    retentionScore * 0.25 +
    viralityScore * 0.15 +
    clusterMomentum * 0.10 +
    seriesMomentum * 0.10 +
    platformMomentum * 0.05;

  // Save prediction
  await prisma.contentGenome.update({
    where: { cardId },
    data: { growthPotentialScore: growthPredictionScore }
  });

  return growthPredictionScore;
}
