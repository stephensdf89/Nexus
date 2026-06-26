"use client";

import { useEffect, useState } from "react";
import CardViralScore from "./CardViralScore";

export default function CardPoster() {
  const [cards, setCards] = useState([]);
  const [platform, setPlatform] = useState("instagram");

  useEffect(() => {
    async function fetchCards() {
      const res = await fetch("/api/cards"); // you should have this or add it
      const data = await res.json();
      setCards(data || []);
    }
    fetchCards();
  }, []);

  async function handlePost(cardId) {
    const res = await fetch("/api/postpulse/post-from-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, platform })
    });

    const data = await res.json();
    console.log("Posted card:", data);
  }

  async function handleOptimize(cardId) {
    const res = await fetch("/api/cards/auto-optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId })
    });

    const data = await res.json();
    console.log("Optimized card:", data);

    // Refresh cards after optimization
    const refreshed = await fetch("/api/cards");
    setCards(await refreshed.json());
  }

  return (
    <div>
      <h2>Post Cards</h2>

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

      {cards.length === 0 && <div>No cards yet.</div>}

      {cards.map((card) => (
        <div key={card.id} style={{ marginBottom: "20px" }}>
          <strong>{card.title}</strong>

          <CardViralScore card={card} />

          <button onClick={() => handleOptimize(card.id)}>
            Auto‑Optimize
          </button>

          <button onClick={() => handlePost(card.id)}>
            Post this card
          </button>
        </div>
      ))}
    </div>
  );
}
