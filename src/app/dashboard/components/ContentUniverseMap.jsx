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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/cards/content-universe-map");
        const data = await res.json();
        if (res.ok && data) {
          setGraph(data);
        } else if (!res.ok) {
          setError(data?.error || "Unable to load content universe map.");
        }
      } catch {
        // Keep demo graph for public preview when auth-protected APIs fail.
        setError("Unable to reach the map API. Showing demo data.");
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, []);

  if (!graph) return <div>Loading content universe...</div>;

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Content Universe Map</h2>
      {error && <div style={{ marginBottom: "10px", color: "#ff9b9b" }}>{error}</div>}
      {loading && <div>Loading map...</div>}
      <div><strong>Nodes:</strong> {(graph?.nodes || []).length}</div>
      <div><strong>Edges:</strong> {(graph?.edges || []).length}</div>
      <ul style={{ display: "grid", gap: "8px", paddingLeft: 0, listStyle: "none", marginTop: "10px" }}>
        {(graph?.nodes || []).slice(0, 5).map((node) => (
          <li key={node.id} style={{ border: "1px solid #2b3f66", borderRadius: "8px", padding: "8px", background: "rgba(14,32,66,0.6)" }}>
            {node.label || node.id}
          </li>
        ))}
      </ul>
    </div>
  );
}
