export function clusterCards(cards) {
  const clusters = {};

  for (const card of cards) {
    const key = card.niche?.toLowerCase() || "general";

    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(card);
  }

  return clusters;
}

export function findMissingPieces(cluster) {
  const titles = cluster.map((c) => c.title.toLowerCase());

  const gaps = [];

  if (!titles.some((t) => t.includes("mistake"))) {
    gaps.push("Biggest Mistakes People Make");
  }

  if (!titles.some((t) => t.includes("secret"))) {
    gaps.push("The Secret Nobody Talks About");
  }

  if (!titles.some((t) => t.includes("framework"))) {
    gaps.push("The Framework That Actually Works");
  }

  if (!titles.some((t) => t.includes("step"))) {
    gaps.push("Step-By-Step Guide");
  }

  return gaps;
}
