"use client";

import { useState, useEffect } from "react";

export default function AIToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => setEnabled(data.aiEnabled));
  }, []);

  async function toggle() {
    const newVal = !enabled;
    setEnabled(newVal);

    await fetch("/api/user/toggle-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: newVal })
    });
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <label>
        <input type="checkbox" checked={enabled} onChange={toggle} />
        <span style={{ marginLeft: "8px" }}>
          AI Features {enabled ? "Enabled" : "Disabled"}
        </span>
      </label>
    </div>
  );
}
