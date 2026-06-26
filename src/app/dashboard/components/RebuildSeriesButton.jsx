"use client";

import { useState } from "react";

export default function RebuildSeriesButton() {
  const [loading, setLoading] = useState(false);

  async function handleRebuild() {
    setLoading(true);
    await fetch("/api/cards/rebuild-series", { method: "POST" });
    setLoading(false);
  }

  return (
    <button onClick={handleRebuild} disabled={loading}>
      {loading ? "Rebuilding Series..." : "Rebuild Series"}
    </button>
  );
}
