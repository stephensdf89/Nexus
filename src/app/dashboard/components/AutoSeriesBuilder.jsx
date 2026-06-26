"use client";

import { useState } from "react";

export default function AutoSeriesBuilder() {
  const [platform, setPlatform] = useState("instagram");
  const [result, setResult] = useState({
    demo: true,
    series: [{ newCard: { title: "Demo Series Part 1" } }, { newCard: { title: "Demo Series Part 2" } }]
  });

  async function handleSeries(e) {
    e.preventDefault();

    const res = await fetch("/api/cards/auto-series-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform })
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Auto‑Series Builder</h2>

      <form onSubmit={handleSeries}>
        <div>
          <label>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X</option>
          </select>
        </div>

        <button type="submit">Generate 5‑Part Series</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Series</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
