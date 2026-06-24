"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import defaultStages from "../utils/defaultStages";
import type { PipelineStage } from "../hooks/usePipelineData";

type Props = {
  stage: PipelineStage;
  close: () => void;
};

export default function StageSettingsModal({ stage, close }: Props) {
  const [name, setName] = useState(stage.name);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // RENAME STAGE
  // -----------------------------
  async function renameStage() {
    setLoading(true);

    await supabase
      .from("pipeline_stages")
      .update({ name })
      .eq("id", stage.id);

    setLoading(false);
    close();
  }

  // -----------------------------
  // TOGGLE HIDDEN
  // -----------------------------
  async function toggleHidden() {
    setLoading(true);

    await supabase
      .from("pipeline_stages")
      .update({ is_hidden: !stage.is_hidden })
      .eq("id", stage.id);

    setLoading(false);
    close();
  }

  // -----------------------------
  // ADD NEW STAGE
  // -----------------------------
  async function addStage() {
    const newName = prompt("New stage name:");
    if (!newName) return;

    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Find highest order
    const { data: stages } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("user_id", user.id);

    const maxOrder = Math.max(...((stages || []).map((s) => s.order)), 0);

    await supabase.from("pipeline_stages").insert({
      user_id: user.id,
      name: newName,
      order: maxOrder + 1,
      is_default: false,
      is_required: false,
      is_hidden: false
    });

    setLoading(false);
    close();
  }

  // -----------------------------
  // MOVE STAGE LEFT
  // -----------------------------
  async function moveLeft() {
    setLoading(true);

    const { data: stages } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("user_id", stage.user_id);

    const sorted = [...(stages || [])].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === stage.id);

    if (index === 0) {
      setLoading(false);
      return;
    }

    const leftStage = sorted[index - 1];

    await supabase
      .from("pipeline_stages")
      .update({ order: leftStage.order })
      .eq("id", stage.id);

    await supabase
      .from("pipeline_stages")
      .update({ order: stage.order })
      .eq("id", leftStage.id);

    setLoading(false);
    close();
  }

  // -----------------------------
  // MOVE STAGE RIGHT
  // -----------------------------
  async function moveRight() {
    setLoading(true);

    const { data: stages } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("user_id", stage.user_id);

    const sorted = [...(stages || [])].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === stage.id);

    if (index === sorted.length - 1) {
      setLoading(false);
      return;
    }

    const rightStage = sorted[index + 1];

    await supabase
      .from("pipeline_stages")
      .update({ order: rightStage.order })
      .eq("id", stage.id);

    await supabase
      .from("pipeline_stages")
      .update({ order: stage.order })
      .eq("id", rightStage.id);

    setLoading(false);
    close();
  }

  // -----------------------------
  // RESET TO DEFAULT WORKFLOW
  // -----------------------------
  async function resetStages() {
    const confirmReset = confirm(
      "Reset all stages to the default YouTube workflow?"
    );
    if (!confirmReset) return;

    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Delete all existing stages
    await supabase
      .from("pipeline_stages")
      .delete()
      .eq("user_id", user.id);

    // Insert defaults
    const rows = defaultStages.map((s, index) => ({
      user_id: user.id,
      name: s.name,
      order: index,
      is_default: true,
      is_required: s.is_required,
      is_hidden: false
    }));

    await supabase.from("pipeline_stages").insert(rows);

    setLoading(false);
    close();
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.6)",
          padding: 20,
          borderRadius: 8,
          width: 350,
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}
      >
        <div>Stage Settings</div>

        {/* Rename */}
        <div>
          <div>Rename Stage</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={renameStage} disabled={loading}>
            Save Name
          </button>
        </div>

        {/* Hide */}
        {!stage.is_required && (
          <button onClick={toggleHidden} disabled={loading}>
            {stage.is_hidden ? "Unhide Stage" : "Hide Stage"}
          </button>
        )}

        {/* Move Left / Right */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={moveLeft} disabled={loading}>
            Move Left
          </button>
          <button onClick={moveRight} disabled={loading}>
            Move Right
          </button>
        </div>

        {/* Add Stage */}
        <button onClick={addStage} disabled={loading}>
          Add New Stage
        </button>

        {/* Reset */}
        <button onClick={resetStages} disabled={loading}>
          Reset to Default Workflow
        </button>

        {/* Close */}
        <button onClick={close}>Close</button>
      </div>
    </div>
  );
}
