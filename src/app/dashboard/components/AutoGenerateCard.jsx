"use client";

import { useState } from "react";

export default function AutoGenerateCard() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [result, setResult] = useState({
    demo: true,
    card: { title: "Demo Card", niche: "content creation" },
    viral: { score: 72 }
  });

  async function handleGenerate(e) {
    e.preventDefault();

    const res = await fetch("/api/cards/auto-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, niche })
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Auto‑Generate Card</h2>

      <form onSubmit={handleGenerate}>
        <div>
          <label>Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. How to grow on TikTok"
          />
        </div>

        <div>
          <label>Niche (optional)</label>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. content creation"
          />
        </div>

        <button type="submit">Generate Card</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Card</h3>
          <div><strong>Title:</strong> {result?.card?.title || "Untitled"}</div>
          <div><strong>Niche:</strong> {result?.card?.niche || "General"}</div>
          <div><strong>Viral Score:</strong> {result?.viral?.score ?? "N/A"}</div>
        </div>
      )}
    </div>
  );
}
