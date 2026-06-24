"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PipelineSteps({ pipelineId }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("");

  useEffect(() => {
    if (!pipelineId) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("pipeline_steps")
        .select("*")
        .eq("pipeline_id", pipelineId)
        .order("order_index", { ascending: true });

      setSteps(data || []);
      setLoading(false);
    };

    load();
  }, [pipelineId]);

  const addStep = async () => {
    const nextIndex = steps.length;

    const { data } = await supabase
      .from("pipeline_steps")
      .insert({
        pipeline_id: pipelineId,
        type: "action",
        config: {},
        order_index: nextIndex,
      })
      .select()
      .single();

    setSteps((prev) => [...prev, data]);
  };

  const updateStep = async (id, updates) => {
    await supabase.from("pipeline_steps").update(updates).eq("id", id);

    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const saveOrder = async (newSteps) => {
    for (let i = 0; i < newSteps.length; i++) {
      await supabase
        .from("pipeline_steps")
        .update({ order_index: i })
        .eq("id", newSteps[i].id);
    }

    setSteps(newSteps);
  };

  const moveStepUp = async (index) => {
    if (index === 0) return;

    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];

    await saveOrder(newSteps);
  };

  const moveStepDown = async (index) => {
    if (index === steps.length - 1) return;

    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];

    await saveOrder(newSteps);
  };

  const deleteStep = async (id) => {
    await supabase.from("pipeline_steps").delete().eq("id", id);
    const filtered = steps.filter((s) => s.id !== id);
    await saveOrder(filtered);
  };

  if (loading) return <p className="text-gray-400">Loading steps...</p>;

  return (
    <div className="space-y-4">
      <button
        onClick={addStep}
        className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_12px_rgba(255,0,0,0.7)]"
      >
        Add Step
      </button>

      {steps.map((s, index) => (
        <div
          key={s.id}
          className="bg-black/80 border border-red-600 rounded-lg p-4 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
        >
          {editingId === s.id ? (
            <div className="flex gap-2">
              <input
                className="flex-1 bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
              />

              <button
                onClick={() => {
                  updateStep(s.id, { type: editType });
                  setEditingId(null);
                }}
                className="text-xs bg-red-700 px-3 py-1 rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-200 text-sm">
                Step {index + 1}: {s.type}
              </span>

              <div className="flex gap-3">
                <button
                  onClick={() => moveStepUp(index)}
                  className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg"
                >
                  ↑
                </button>

                <button
                  onClick={() => moveStepDown(index)}
                  className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg"
                >
                  ↓
                </button>

                <button
                  onClick={() => {
                    setEditingId(s.id);
                    setEditType(s.type);
                  }}
                  className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteStep(s.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}