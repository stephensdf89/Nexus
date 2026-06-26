"use client";

import { useState } from "react";

export default function ReclusterButton() {
  const [loading, setLoading] = useState(false);

  async function handleRecluster() {
    setLoading(true);
    await fetch("/api/cards/recluster", { method: "POST" });
    setLoading(false);
  }

  return (
    <button onClick={handleRecluster} disabled={loading}>
      {loading ? "Rebuilding Clusters..." : "Rebuild Content Clusters"}
    </button>
  );
}
