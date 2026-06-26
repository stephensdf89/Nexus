"use client";

import { useState } from "react";

export default function AutoClusterThemes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cards/auto-cluster-themes", {
        method: "POST"
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to build clusters.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error while building clusters.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Auto‑Cluster Content Themes</h2>

      <button onClick={handleCluster} disabled={loading}>
        {loading ? "Building..." : "Build Content Universe"}
      </button>

      {error && <div style={{ marginTop: "10px", color: "#ff9b9b" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Content Clusters</h3>
          <div>
            <strong>Clusters Found:</strong> {Object.keys(result?.clusters || {}).length}
          </div>
          <ul style={{ display: "grid", gap: "8px", paddingLeft: 0, listStyle: "none" }}>
            {Object.entries(result?.clusters || {}).slice(0, 5).map(([name, cluster]) => (
              <li key={name} style={{ border: "1px solid #2b3f66", borderRadius: "8px", padding: "8px", background: "rgba(14,32,66,0.6)" }}>
                {name}: {(cluster?.missingPieces || []).length} gaps, {(cluster?.generatedCards || []).length} generated cards
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
