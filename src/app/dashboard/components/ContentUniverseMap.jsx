"use client";

import { useEffect, useState } from "react";

export default function ContentUniverseMap() {
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    async function fetchGraph() {
      const res = await fetch("/api/cards/content-universe-map");
      const data = await res.json();
      setGraph(data);
    }
    fetchGraph();
  }, []);

  if (!graph) return <div>Loading content universe...</div>;

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Content Universe Map</h2>

      <pre style={{ maxHeight: "400px", overflow: "auto" }}>
        {JSON.stringify(graph, null, 2)}
      </pre>

      <p>
        (You can replace this JSON with a real force-graph visualization later.)
      </p>
    </div>
  );
}
