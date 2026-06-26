"use client";

import { useState } from "react";

export default function BatchGenerateCards() {
  const [topics, setTopics] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({
    demo: true,
    createdCards: [{ card: { title: "Demo Batch Card 1" } }, { card: { title: "Demo Batch Card 2" } }]
  });

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const topicList = topics
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/cards/batch-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: topicList, niche })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to batch generate cards.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error while generating cards.");
    } finally {
      setLoading(false);
    }
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

        <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate Cards"}</button>
      </form>

      {error && <div style={{ marginTop: "10px", color: "#ff9b9b" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated {(result.createdCards || result.calendar || []).length} Cards</h3>
          <ul style={{ display: "grid", gap: "8px", paddingLeft: 0, listStyle: "none" }}>
            {(result?.createdCards || [])
              .slice(0, 5)
              .map((item, idx) => (
                <li key={idx} style={{ border: "1px solid #2b3f66", borderRadius: "8px", padding: "8px", background: "rgba(14,32,66,0.6)" }}>
                  {item?.card?.title || `Card ${idx + 1}`}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
