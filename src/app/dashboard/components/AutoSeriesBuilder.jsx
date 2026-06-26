"use client";

import { useState } from "react";

export default function AutoSeriesBuilder() {
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({
    demo: true,
    series: [{ newCard: { title: "Demo Series Part 1" } }, { newCard: { title: "Demo Series Part 2" } }]
  });

  async function handleSeries(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cards/auto-series-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to generate series.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error while generating series.");
    } finally {
      setLoading(false);
    }
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

        <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate 5‑Part Series"}</button>
      </form>

      {error && <div style={{ marginTop: "10px", color: "#ff9b9b" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Series</h3>
          <div><strong>Total Parts:</strong> {(result?.series || []).length}</div>
          <ul style={{ display: "grid", gap: "8px", paddingLeft: 0, listStyle: "none" }}>
            {(result?.series || []).slice(0, 5).map((item, idx) => (
              <li key={idx} style={{ border: "1px solid #2b3f66", borderRadius: "8px", padding: "8px", background: "rgba(14,32,66,0.6)" }}>
                {item?.newCard?.title || `Part ${idx + 1}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
