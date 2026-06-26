"use client";

import { useState } from "react";

export default function AutoClusterThemes() {
  const [result, setResult] = useState({
    demo: true,
    clusters: {
      general: {
        missingPieces: ["Biggest Mistakes People Make"],
        generatedCards: [{ newCard: { title: "Demo Cluster Gap Card" } }]
      }
    }
  });

  async function handleCluster(e) {
    e.preventDefault();

    const res = await fetch("/api/cards/auto-cluster-themes", {
      method: "POST"
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Auto‑Cluster Content Themes</h2>

      <button onClick={handleCluster}>
        Build Content Universe
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Content Clusters</h3>
          <div>
            <strong>Clusters Found:</strong> {Object.keys(result?.clusters || {}).length}
          </div>
          <ul>
            {Object.entries(result?.clusters || {}).slice(0, 5).map(([name, cluster]) => (
              <li key={name}>
                {name}: {(cluster?.missingPieces || []).length} gaps, {(cluster?.generatedCards || []).length} generated cards
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
