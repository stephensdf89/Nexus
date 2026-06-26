"use client";

import { useState } from "react";

export default function AutoSchedule30Day() {
  const [platform, setPlatform] = useState("instagram");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({
    demo: true,
    schedule: [{ day: 1, date: "2026-01-01T12:00:00.000Z", bestTime: "12:00" }]
  });

  async function handleSchedule(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cards/auto-schedule-30-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, startDate })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to schedule posts.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error while scheduling posts.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Auto‑Schedule 30‑Day Calendar</h2>

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

        <button type="submit" disabled={loading}>{loading ? "Scheduling..." : "Auto‑Schedule 30 Days"}</button>
      </form>

      {error && <div style={{ marginTop: "10px", color: "#ff9b9b" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Scheduled Posts</h3>
          <div><strong>Total Scheduled:</strong> {(result?.schedule || []).length}</div>
          <ul style={{ display: "grid", gap: "8px", paddingLeft: 0, listStyle: "none" }}>
            {(result?.schedule || []).slice(0, 5).map((item, idx) => (
              <li key={idx} style={{ border: "1px solid #2b3f66", borderRadius: "8px", padding: "8px", background: "rgba(14,32,66,0.6)" }}>
                Day {item?.day ?? idx + 1} at {item?.bestTime || "--:--"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
