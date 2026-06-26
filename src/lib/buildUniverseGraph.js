export function buildUniverseGraph(cards) {
  const nodes = [];
  const edges = [];

  // Create nodes for each card
  for (const card of cards) {
    nodes.push({
      id: card.id,
      label: card.title,
      group: card.niche || "general"
    });
  }

  // Connect cards with similar niches
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i].niche === cards[j].niche) {
        edges.push({
          from: cards[i].id,
          to: cards[j].id,
          type: "theme"
        });
      }
    }
  }

  // Connect sequels (Part 1 → Part 2 → Part 3)
  for (const card of cards) {
    const match = card.title.match(/(.+?) — Part (\d+)/);
    if (match) {
      const base = match[1];
      const part = parseInt(match[2]);

      const next = cards.find((c) =>
        c.title.startsWith(`${base} — Part ${part + 1}`)
      );

      if (next) {
        edges.push({
          from: card.id,
          to: next.id,
          type: "series"
        });
      }
    }
  }

  return { nodes, edges };
}
