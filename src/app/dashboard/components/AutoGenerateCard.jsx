"use client";

import { useState } from "react";

export default function AutoGenerateCard() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({
    demo: true,
    card: { title: "Demo Card", niche: "content creation" },
    viral: { score: 72 }
  });

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cards/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, niche })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to generate card right now.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error while generating card.");
    } finally {
      setLoading(false);
    }
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

        <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate Card"}</button>
      </form>

      {error && <div style={{ marginTop: "10px", color: "#ff9b9b" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "20px", border: "1px solid #2b3f66", borderRadius: "10px", padding: "12px", background: "rgba(14,32,66,0.6)" }}>
          <h3>Generated Card</h3>
          <div><strong>Title:</strong> {result?.card?.title || "Placeholder Title"}</div>
          <div><strong>Niche:</strong> {result?.card?.niche || "General"}</div>
          <div><strong>Viral Score:</strong> {result?.viral?.score ?? "N/A"}</div>
        </div>
      )}
    </div>
  );
}
