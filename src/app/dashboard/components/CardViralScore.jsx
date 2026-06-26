"use client";

import { useEffect, useState } from "react";

export default function CardViralScore({ card }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    async function fetchScore() {
      const res = await fetch(`/api/cards/viral-score?cardId=${card.id}`);
      const data = await res.json();
      setScore(data);
    }
    fetchScore();
  }, [card.id]);

  if (!score) return <div>Loading viral score...</div>;

  return (
    <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #333" }}>
      <strong>Viral Score: {score.score}/100</strong>

      <div>
        <strong>Strengths:</strong>
        <ul>
          {score.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div>
        <strong>Weaknesses:</strong>
        <ul>
          {score.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>

      <div>
        <strong>Platform Predictions:</strong>
        <ul>
          {Object.entries(score.platformPredictions).map(([platform, data]) => (
            <li key={platform}>
              {platform}: {data.viralPotential}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
