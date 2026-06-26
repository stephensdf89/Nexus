import prisma from "@/src/lib/db";

export async function buildUniverseMap(userId) {
  // Fetch all cards + genomes
  const genomes = await prisma.contentGenome.findMany({
    where: { card: { userId } },
    include: { card: true }
  });

  const nodes = [];
  const edges = [];

  const clusterNodes = new Set();
  const seriesNodes = new Set();

  for (const g of genomes) {
    const cardNode = {
      id: g.cardId,
      type: "card",
      label: g.card.title,
      performance: {
        engagement: g.engagementScore || 0,
        retention: g.retentionScore || 0,
        virality: g.viralityScore || 0
      },
      strategy: {
        growth: g.growthPotentialScore || 0,
        doubleDown: g.doubleDownPotentialScore || 0,
        repost: g.repostPotentialScore || 0
      },
      topic: g.topicCategory,
      subTopic: g.subTopicCategory
    };

    nodes.push(cardNode);

    // Cluster node
    if (g.clusterId) {
      if (!clusterNodes.has(g.clusterId)) {
        clusterNodes.add(g.clusterId);
        nodes.push({
          id: g.clusterId,
          type: "cluster",
          label: `Cluster: ${g.topicCategory || "Untitled"}`,
          topic: g.topicCategory
        });
      }

      edges.push({
        from: g.clusterId,
        to: g.cardId,
        type: "cluster-member"
      });
    }

    // Series node
    if (g.seriesId) {
      if (!seriesNodes.has(g.seriesId)) {
        seriesNodes.add(g.seriesId);
        nodes.push({
          id: g.seriesId,
          type: "series",
          label: `Series ${g.seriesId.slice(0, 6)}`,
          topic: g.topicCategory
        });
      }

      edges.push({
        from: g.seriesId,
        to: g.cardId,
        type: "series-member"
      });
    }
  }

  return { nodes, edges };
}
