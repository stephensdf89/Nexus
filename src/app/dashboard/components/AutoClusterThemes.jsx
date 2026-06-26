"use client";

import { useState } from "react";

export default function AutoClusterThemes() {
  const [result, setResult] = useState(null);

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
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
