"use client";

import { useState } from "react";

export default function AutoRepostUnderperforming() {
  const [platform, setPlatform] = useState("instagram");
  const [result, setResult] = useState(null);

  async function handleRepost(e) {
    e.preventDefault();

    const res = await fetch("/api/cards/auto-repost-underperforming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform })
    });

    const data = await res.json();
    setResult(data);
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

        <button type="submit">Auto‑Repost Underperformers</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Repost Results</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
