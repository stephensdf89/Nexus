"use client";

import { useEffect, useState } from "react";

export default function PlatformStatus() {
  const [status, setStatus] = useState([]);

  useEffect(() => {
    // Replace with real API call to your DB-backed status endpoint if needed
    async function fetchStatus() {
      // placeholder
      setStatus([]);
    }
    fetchStatus();
  }, []);

  return (
    <div>
      <h2>Platform Status</h2>
      {status.length === 0 && <div>No platforms connected yet.</div>}
      {status.map((s) => (
        <div key={s.platform}>
          {s.platform}: {s.connected ? "Connected" : "Not connected"}
        </div>
      ))}
    </div>
  );
}
