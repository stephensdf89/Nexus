"use client";

import PipelineCard from "./PipelineCard";
import type { PipelineCard as PipelineCardType, PipelineStage } from "../hooks/usePipelineData";

type Props = {
  stage: PipelineStage;
  cards: PipelineCardType[];
  onAddCard: () => void;
  onCardClick: (card: PipelineCardType) => void;
  onOpenSettings: () => void;
  onCardDragStart: (cardId: string) => void;
  onCardDrop: (stageId: string) => void;
  onStageDrop: (targetStageId: string, sourceStageId?: string) => void;
};

export default function StageColumn({
  stage,
  cards,
  onAddCard,
  onCardClick,
  onOpenSettings,
  onCardDragStart,
  onCardDrop,
  onStageDrop,
}: Props) {
  // -----------------------------
  // CARD DROP HANDLER
  // -----------------------------
  function handleCardDropEvent(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    onCardDrop(stage.id);
  }

  // -----------------------------
  // ALLOW DROP
  // -----------------------------
  function allowDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  // -----------------------------
  // STAGE DRAG START
  // -----------------------------
  function handleStageDragStart() {
    onStageDrop(stage.id);
  }

  return (
    <div
      draggable
      onDragStart={handleStageDragStart}
      style={{
        minWidth: 260,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >
      {/* Stage Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>{stage.name}</div>

        <button onClick={onOpenSettings}>
          Settings
        </button>
      </div>

      {/* Cards */}
      <div
        onDragOver={allowDrop}
        onDrop={handleCardDropEvent}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minHeight: 100
        }}
      >
        {cards.map((card) => (
          <PipelineCard
            key={card.id}
            onClick={() => onCardClick(card)}
            onDragStart={onCardDragStart}
            card={card}
          />
        ))}
      </div>

      {/* Add Card */}
      <button onClick={onAddCard}>
        Add Card
      </button>
    </div>
  );
}
