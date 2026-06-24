"use client";

import type { PipelineCard } from "../hooks/usePipelineData";

type Props = {
  card: PipelineCard;
  onClick: () => void;
  onDragStart: (cardId: string) => void;
};

export default function PipelineCard({ card, onClick, onDragStart }: Props) {
  // -----------------------------
  // DRAG START
  // -----------------------------
  function handleDragStart() {
    onDragStart(card.id);
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      style={{
        padding: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 6
      }}
    >
      {/* Title */}
      <div>{card.title || "Untitled"}</div>

      {/* Platforms */}
      {card.platforms && card.platforms.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {card.platforms.map((p) => (
            <div key={String(p)} style={{ fontSize: 12 }}>
              {String(p)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
