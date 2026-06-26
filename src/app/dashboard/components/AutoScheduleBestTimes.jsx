"use client";

import { useState } from "react";

export default function AutoScheduleBestTimes() {
  const [platform, setPlatform] = useState("instagram");
  const [startDate, setStartDate] = useState("");
  const [result, setResult] = useState({
    demo: true,
    schedule: [{ day: 1, date: "2026-01-01T15:00:00.000Z", bestTime: "15:00" }]
  });

  async function handleSchedule(e) {
    e.preventDefault();

    const res = await fetch("/api/cards/auto-schedule-best-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, startDate })
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Auto‑Schedule at Best Times</h2>

      <form onSubmit={handleSchedule}>
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

        <div>
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <button type="submit">Auto‑Schedule Best Times</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Scheduled Posts</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
