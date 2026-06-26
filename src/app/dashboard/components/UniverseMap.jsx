"use client";

import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";

export default function UniverseMap() {
  const containerRef = useRef(null);
  const [mapData, setMapData] = useState({
    nodes: [
      { id: "demo-1", label: "Demo Content Node", type: "card" },
      { id: "demo-cluster", label: "Demo Cluster", type: "cluster" }
    ],
    edges: [{ from: "demo-cluster", to: "demo-1", type: "cluster-member" }]
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/universe/map");
        const data = await res.json();
        const safeNodes = Array.isArray(data?.nodes) ? data.nodes : [];
        const safeEdges = Array.isArray(data?.edges) ? data.edges : [];

        if (res.ok && (safeNodes.length > 0 || safeEdges.length > 0)) {
          setMapData({ nodes: safeNodes, edges: safeEdges });
        }
      } catch {
        // Keep demo graph for auth-protected or unavailable API cases.
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!mapData || !containerRef.current) return;

    const safeNodes = Array.isArray(mapData?.nodes) ? mapData.nodes : [];
    const safeEdges = Array.isArray(mapData?.edges) ? mapData.edges : [];

    const nodes = safeNodes.map((n) => ({
      id: n.id,
      label: n.label,
      shape: n.type === "card" ? "box" : "ellipse",
      color:
        n.type === "cluster"
          ? "#ff4d4d"
          : n.type === "series"
            ? "#4d79ff"
            : "#333",
      font: { color: "#fff" }
    }));

    const edges = safeEdges.map((e) => ({
      from: e.from,
      to: e.to,
      color: e.type === "cluster-member" ? "#ff4d4d" : "#4d79ff"
    }));

    new Network(
      containerRef.current,
      { nodes, edges },
      {
        nodes: {
          borderWidth: 1,
          shape: "box",
          color: "#222"
        },
        edges: {
          smooth: true
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -30000,
            springLength: 150
          }
        }
      }
    );
  }, [mapData]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "600px",
        background: "#111",
        border: "1px solid #333",
        borderRadius: "8px"
      }}
    />
  );
}
