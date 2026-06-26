"use client";

import { useState } from "react";

export default function BatchGenerateCards() {
  const [topics, setTopics] = useState("");
  const [niche, setNiche] = useState("");
  const [result, setResult] = useState({
    demo: true,
    createdCards: [{ card: { title: "Demo Batch Card 1" } }, { card: { title: "Demo Batch Card 2" } }]
  });

  async function handleGenerate(e) {
    e.preventDefault();

    const topicList = topics
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/cards/batch-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topics: topicList, niche })
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Batch Generate Cards</h2>

      <form onSubmit={handleGenerate}>
        <div>
          <label>Topics (one per line)</label>
          <textarea
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder={`How to grow on TikTok\nWhy your content isn't working\nThe best hook formula`}
            rows={6}
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

        <button type="submit">Generate Cards</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated {(result.createdCards || result.calendar || []).length} Cards</h3>
          <ul>
            {(result?.createdCards || [])
              .slice(0, 5)
              .map((item, idx) => <li key={idx}>{item?.card?.title || `Card ${idx + 1}`}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
