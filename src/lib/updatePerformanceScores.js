import prisma from "@/src/lib/db";

export async function updatePerformanceScores(cardId) {
  const performances = await prisma.postPerformance.findMany({
    where: { cardId }
  });

  if (!performances.length) return;

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const engagementScore = avg(performances.map((p) => (p.likes + p.comments + p.shares)));
  const retentionScore = avg(performances.map((p) => p.watchTime || 0));
  const viralityScore = avg(performances.map((p) => p.shares || 0));

  const platformPerformance = {};
  for (const p of performances) {
    if (!platformPerformance[p.platform]) platformPerformance[p.platform] = [];
    platformPerformance[p.platform].push(p.likes + p.comments + p.shares);
  }

  for (const key in platformPerformance) {
    platformPerformance[key] = avg(platformPerformance[key]);
  }

  await prisma.contentGenome.update({
    where: { cardId },
    data: {
      engagementScore,
      retentionScore,
      viralityScore,
      platformPerformance
    }
  });

  return true;
}
