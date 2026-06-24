"use client";

import { useRef } from "react";
import type { PipelineCard, PipelineStage } from "./usePipelineData";

type Args = {
  stages: PipelineStage[];
  cards: PipelineCard[];
  updateCardStage: (cardId: string, stageId: string) => Promise<void>;
  updateStageOrder: (stageId: string, newOrder: number) => Promise<void>;
};

export default function useDragAndDrop({
  stages,
  cards,
  updateCardStage,
  updateStageOrder,
}: Args) {
  // Track what is being dragged
  const draggingCardId = useRef<string | null>(null);
  const draggingStageId = useRef<string | null>(null);

  // -----------------------------
  // CARD DRAG START
  // -----------------------------
  function handleCardDragStart(cardId: string) {
    draggingCardId.current = cardId;
  }

  // -----------------------------
  // CARD DROP
  // -----------------------------
  async function handleCardDrop(targetStageId: string) {
    const cardId = draggingCardId.current;
    if (!cardId) {
      return;
    }

    const card = cards.find((c) => c.id === cardId);
    if (!card) {
      return;
    }

    // If dropped in same stage -> do nothing
    if (card.stage_id === targetStageId) {
      draggingCardId.current = null;
      return;
    }

    // Move card to new stage
    await updateCardStage(cardId, targetStageId);

    draggingCardId.current = null;
  }

  // -----------------------------
  // STAGE DRAG START
  // -----------------------------
  function handleStageDragStart(stageId: string) {
    draggingStageId.current = stageId;
  }

  // -----------------------------
  // STAGE DROP
  // -----------------------------
  async function handleStageDrop(targetStageId: string, sourceStageId?: string) {
    const stageId = sourceStageId || draggingStageId.current;
    if (!stageId) return;

    if (stageId === targetStageId) {
      draggingStageId.current = null;
      return;
    }

    const source = stages.find((s) => s.id === stageId);
    const target = stages.find((s) => s.id === targetStageId);

    if (!source || !target) {
      draggingStageId.current = null;
      return;
    }

    // Swap order positions between source and target stages.
    await updateStageOrder(source.id, target.order);
    await updateStageOrder(target.id, source.order);

    draggingStageId.current = null;
  }

  return {
    handleCardDragStart,
    handleCardDrop,
    handleStageDrop,
    handleStageDragStart,
  };
}
