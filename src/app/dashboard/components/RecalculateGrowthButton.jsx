"use client";

import { useState } from "react";

export default function RecalculateGrowthButton() {
  const [loading, setLoading] = useState(false);

  async function handleRecalc() {
    setLoading(true);
    await fetch("/api/cards/recalculate-growth", { method: "POST" });
    setLoading(false);
  }

  return (
    <button onClick={handleRecalc} disabled={loading}>
      {loading ? "Recalculating Growth…" : "Recalculate Growth Predictions"}
    </button>
  );
}
