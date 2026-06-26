"use client";

import { useState } from "react";

export default function Generate30DayCalendar() {
  const [niche, setNiche] = useState("");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({
    demo: true,
    calendar: [{ day: 1, title: "Demo Day 1" }, { day: 2, title: "Demo Day 2" }]
  });

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cards/generate-30-day-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, theme })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to generate calendar.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error while generating calendar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Generate 30‑Day Content Calendar</h2>

      <form onSubmit={handleGenerate}>
        <div>
          <label>Niche</label>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. content creation"
          />
        </div>

        <div>
          <label>Theme (optional)</label>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. growth, storytelling, tutorials"
          />
        </div>

        <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate 30 Days"}</button>
      </form>

      {error && <div style={{ marginTop: "10px", color: "#ff9b9b" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated 30‑Day Calendar</h3>
          <ul style={{ display: "grid", gap: "8px", paddingLeft: 0, listStyle: "none" }}>
            {(result?.calendar || []).slice(0, 7).map((entry, idx) => (
              <li key={idx} style={{ border: "1px solid #2b3f66", borderRadius: "8px", padding: "8px", background: "rgba(14,32,66,0.6)" }}>
                Day {entry?.day ?? idx + 1}: {entry?.title || "Untitled"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
