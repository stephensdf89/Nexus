"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import defaultStages from "../utils/defaultStages";

export type PipelineStage = {
  id: string;
  user_id: string;
  name: string;
  order: number;
  is_default?: boolean;
  is_required?: boolean;
  is_hidden: boolean;
};

export type PipelineCard = {
  id: string;
  user_id: string;
  title: string;
  stage_id: string;
  description?: string;
  niche?: string;
  platforms?: string[];
  platform_fields?: Record<string, unknown>;
  notes?: string;
  deadline?: string;
  analytics?: Record<string, unknown>;
};

export default function usePipelineData() {

  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [cards, setCards] = useState<PipelineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<PipelineCard | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  const seedDefaultStages = useCallback(async (userId: string) => {
    const rows = defaultStages.map((s, index) => ({
      user_id: userId,
      name: s.name,
      order: index,
      is_default: true,
      is_required: s.is_required,
      is_hidden: false,
    }));

    await supabase.from("pipeline_stages").insert(rows);
  }, []);

  const loadPipeline = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStages([]);
      setCards([]);
      setLoading(false);
      return;
    }

    // Load stages
    let { data: stageData } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("user_id", user.id);

    // If no stages exist -> seed defaults
    if (!stageData || stageData.length === 0) {
      await seedDefaultStages(user.id);
      const { data: seeded } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("user_id", user.id);
      stageData = seeded;
    }

    // Load cards
    const { data: cardData } = await supabase
      .from("pipeline_cards")
      .select("*")
      .eq("user_id", user.id);

    setStages((stageData || []) as PipelineStage[]);
    setCards((cardData || []) as PipelineCard[]);
    setLoading(false);
  }, [seedDefaultStages]);

  // Load stages + cards
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPipeline();
  }, [loadPipeline]);

  // Add card
  async function addCard(stageId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data } = await supabase
      .from("pipeline_cards")
      .insert({
        user_id: user.id,
        stage_id: stageId,
        title: "New Content",
        description: "",
        platforms: [],
        platform_fields: {},
        notes: "",
        analytics: {},
      })
      .select()
      .single();

    if (data) {
      setCards((prev) => [...prev, data as PipelineCard]);
    }
  }

  // Move card to new stage
  async function updateCardStage(cardId: string, newStageId: string) {
    await supabase
      .from("pipeline_cards")
      .update({ stage_id: newStageId })
      .eq("id", cardId)
      .select()
      .single();

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, stage_id: newStageId } : c))
    );
  }

  // Reorder stages
  async function updateStageOrder(stageId: string, newOrder: number) {
    await supabase
      .from("pipeline_stages")
      .update({ order: newOrder })
      .eq("id", stageId)
      .select()
      .single();

    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, order: newOrder } : s))
    );
  }

  return {
    stages,
    cards,
    loading,
    addCard,
    updateCardStage,
    updateStageOrder,
    selectedCard,
    setSelectedCard,
    selectedStage,
    setSelectedStage,
  };
}
