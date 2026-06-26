"use client";

import StageColumn from "./components/StageColumn";
import CardDetailsPanel from "./components/CardDetailsPanel";
import StageSettingsModal from "./components/StageSettingsModal";
import usePipelineData from "./hooks/usePipelineData";
import useDragAndDrop from "./hooks/useDragAndDrop";
import Link from "next/link";

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

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-8 text-white">
        <section className="mx-auto w-full max-w-6xl rounded-2xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-8 shadow-[0_20px_60px_rgba(0,194,255,0.22)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Creator OS</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Pipelines</h1>
          <p className="mt-3 text-cyan-100/85">Loading pipeline...</p>
        </section>
      </main>
    );
  }

  const hasVisibleStages = stages.some((s) => !s.is_hidden);
  const isEmpty = !hasVisibleStages && cards.length === 0;

  return (
    <main className="min-h-screen px-6 py-8 text-white">
      <section className="mx-auto w-full max-w-6xl rounded-2xl border border-cyan-400/40 bg-[rgba(9,25,66,0.82)] p-8 shadow-[0_20px_60px_rgba(0,194,255,0.22)] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Creator OS</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Pipelines</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
            <Link href="/dashboard" className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-3 py-1 transition hover:bg-cyan-400/20">Dashboard</Link>
            <Link href="/settings" className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-3 py-1 transition hover:bg-cyan-400/20">Settings</Link>
          </div>
        </div>
      </section>

      {isEmpty ? (
        <section className="mx-auto mt-6 w-full max-w-6xl rounded-2xl border border-cyan-400/25 bg-[rgba(4,14,38,0.8)] p-6 text-cyan-100/85 shadow-[0_20px_60px_rgba(0,194,255,0.12)]">
          No pipeline data is available in this session yet. You can still access Settings and Dashboard from the links above.
        </section>
      ) : (
        <section className="mx-auto mt-6 w-full max-w-6xl overflow-x-auto" style={{ display: "flex", gap: 16 }}>
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
              key={selectedCard.id}
              card={selectedCard}
              allCards={cards}
              close={() => setSelectedCard(null)}
            />
          )}

          {selectedStage && (
            <StageSettingsModal
              stage={selectedStage}
              close={() => setSelectedStage(null)}
            />
          )}
        </section>
      )}
    </main>
  );
}