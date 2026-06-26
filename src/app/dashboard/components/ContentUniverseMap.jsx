"use client";

import { useEffect, useState } from "react";

export default function ContentUniverseMap() {
  const [graph, setGraph] = useState({
    nodes: [
      { id: "demo-1", label: "Demo Hook Card", group: "general" },
      { id: "demo-2", label: "Demo Framework Card", group: "general" }
    ],
    edges: [{ from: "demo-1", to: "demo-2", type: "theme" }],
    demo: true
  });

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch("/api/cards/content-universe-map");
        const data = await res.json();
        if (res.ok && data) {
          setGraph(data);
        }
      } catch {
        // Keep demo graph for public preview when auth-protected APIs fail.
      }
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
