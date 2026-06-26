"use client";

import { useState } from "react";

export default function AutoDoubleDownWinners() {
  const [platform, setPlatform] = useState("instagram");
  const [result, setResult] = useState({
    demo: true,
    newCards: [{ newCard: { title: "Demo Winner Follow-Up" } }]
  });

  async function handleDoubleDown(e) {
    e.preventDefault();

    const res = await fetch("/api/cards/auto-double-down-winners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform })
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Auto‑Double‑Down on Winners</h2>

      <form onSubmit={handleDoubleDown}>
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

        <button type="submit">Double‑Down on Winners</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Follow‑Up Cards</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
