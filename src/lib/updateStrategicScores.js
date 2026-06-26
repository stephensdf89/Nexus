import prisma from "@/src/lib/db";

export async function updateStrategicScores(cardId) {
  const genome = await prisma.contentGenome.findUnique({
    where: { cardId }
  });

  if (!genome) return;

  const {
    engagementScore = 0,
    retentionScore = 0,
    viralityScore = 0
  } = genome;

  const growthPotentialScore =
    (engagementScore * 0.4) +
    (retentionScore * 0.3) +
    (viralityScore * 0.3);

  const seriesPotentialScore =
    (retentionScore * 0.6) +
    (engagementScore * 0.4);

  const clusterExpansionScore =
    (engagementScore * 0.5) +
    (viralityScore * 0.5);

  const repostPotentialScore =
    (engagementScore < 10 ? 80 : 20) +
    (retentionScore < 5 ? 20 : 0);

  const doubleDownPotentialScore =
    (engagementScore > 50 ? 60 : 0) +
    (viralityScore > 20 ? 40 : 0);

  const trendAlignmentScore =
    Math.random() * 100; // placeholder until trend engine is added

  const audienceFitScore =
    (engagementScore * 0.5) +
    (retentionScore * 0.5);

  await prisma.contentGenome.update({
    where: { cardId },
    data: {
      growthPotentialScore,
      seriesPotentialScore,
      clusterExpansionScore,
      repostPotentialScore,
      doubleDownPotentialScore,
      trendAlignmentScore,
      audienceFitScore
    }
  });

  return true;
}
