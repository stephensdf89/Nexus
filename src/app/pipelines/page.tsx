"use client";

import { useState } from "react";
import StageColumn from "./components/StageColumn";
import CardDetailsPanel from "./components/CardDetailsPanel";
import StageSettingsModal from "./components/StageSettingsModal";
import usePipelineData from "./hooks/usePipelineData";
import useDragAndDrop from "./hooks/useDragAndDrop";

export default function PipelinePage() {
  const {
    stages,
    cards,
    loading,
    addCard,
    updateCardStage,
    updateStageOrder,
    selectedCard,
    setSelectedCard,
    selectedStage,
    setSelectedStage
  } = usePipelineData();

  const { handleCardDragStart, handleCardDrop, handleStageDrop } =
    useDragAndDrop({
      stages,
      cards,
      updateCardStage,
      updateStageOrder
    });

  if (loading) return <div>Loading pipeline...</div>;

  return (
    <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
      {stages
        .filter((s) => !s.is_hidden)
        .sort((a, b) => a.order - b.order)
        .map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            cards={cards.filter((c) => c.stage_id === stage.id)}
            onAddCard={() => addCard(stage.id)}
            onCardClick={(card) => setSelectedCard(card)}
            onOpenSettings={() => setSelectedStage(stage)}
            onCardDragStart={handleCardDragStart}
            onCardDrop={handleCardDrop}
            onStageDrop={handleStageDrop}
          />
        ))}

      {selectedCard && (
        <CardDetailsPanel
          card={selectedCard}
          close={() => setSelectedCard(null)}
        />
      )}

      {selectedStage && (
        <StageSettingsModal
          stage={selectedStage}
          close={() => setSelectedStage(null)}
        />
      )}
    </div>
  );
}