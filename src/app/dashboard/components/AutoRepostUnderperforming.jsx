"use client";

import { useState } from "react";

export default function AutoRepostUnderperforming() {
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({
    demo: true,
    reposts: [{ originalPost: "demo-post", repostScheduledFor: "2026-01-01T12:00:00.000Z" }]
  });

  async function handleRepost(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cards/auto-repost-underperforming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to find repost opportunities.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error while searching repost opportunities.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Auto‑Repost Underperforming Content</h2>

      <form onSubmit={handleRepost}>
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

        <button type="submit" disabled={loading}>{loading ? "Analyzing..." : "Auto‑Repost Underperformers"}</button>
      </form>

      {error && <div style={{ marginTop: "10px", color: "#ff9b9b" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Repost Results</h3>
          <div><strong>Total Reposts:</strong> {(result?.reposts || []).length}</div>
          <ul style={{ display: "grid", gap: "8px", paddingLeft: 0, listStyle: "none" }}>
            {(result?.reposts || []).slice(0, 5).map((item, idx) => (
              <li key={idx} style={{ border: "1px solid #2b3f66", borderRadius: "8px", padding: "8px", background: "rgba(14,32,66,0.6)" }}>
                Post {item?.originalPost || `#${idx + 1}`} scheduled for {item?.repostScheduledFor || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
