"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { supabase } from "../lib/supabaseClient";
import { getUserPlan } from "@/lib/getUserPlan";
import { useUser } from "../contexts/AuthContext";
import UpgradeRequired from "./UpgradeRequired";
import { SortableStepCard } from "./SortableStepCard";
import TemplateSidebar from "./TemplateSidebar";
import TemplatePreview from "./TemplatePreview";
import ConfirmModal from "./ConfirmModal";

const stepTypes = [
  { type: "integration", label: "Integration", icon: "⚡" },
  { type: "http", label: "HTTP Request", icon: "🌐" },
  { type: "delay", label: "Delay", icon: "⏱️" },
  { type: "transform", label: "Transform", icon: "✨" },
];

export default function PipelineSteps({ pipelineId }) {
  const { user } = useUser();
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("");
  const [pendingDeleteStep, setPendingDeleteStep] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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

  useEffect(() => {
    if (!user?.id) {
      setPlan("free");
      setLoadingPlan(false);
      return;
    }

    const loadPlan = async () => {
      setLoadingPlan(true);
      const nextPlan = await getUserPlan(user.id);
      setPlan(nextPlan);
      setLoadingPlan(false);
    };

    loadPlan();
  }, [user]);

  const createStep = async (type = "action", insertAt = steps.length) => {
    const nextIndex = insertAt;

    const { data } = await supabase
      .from("pipeline_steps")
      .insert({
        pipeline_id: pipelineId,
        type,
        config: {},
        order_index: nextIndex,
      })
      .select()
      .single();

    const nextSteps = [...steps];
    nextSteps.splice(insertAt, 0, data);
    await saveOrder(nextSteps);
  };

  const addStep = async (type = "action") => {
    await createStep(type, steps.length);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  async function applyTemplate(template) {
    const newSteps = [];

    for (let i = 0; i < template.steps.length; i++) {
      const step = template.steps[i];

      const { data } = await supabase
        .from("pipeline_steps")
        .insert({
          pipeline_id: pipelineId,
          type: step.type,
          config: step.config,
          order_index: steps.length + i,
        })
        .select()
        .single();

      newSteps.push(data);
    }

    setSteps((prev) => [...prev, ...newSteps]);
    setSelectedTemplate(null);
  }

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

  const deleteStep = async (id) => {
    await supabase.from("pipeline_steps").delete().eq("id", id);
    const filtered = steps.filter((s) => s.id !== id);
    await saveOrder(filtered);
  };

  const confirmDeleteStep = async () => {
    if (!pendingDeleteStep) return;

    setDeleting(true);
    await deleteStep(pendingDeleteStep.id);
    setDeleting(false);
    setPendingDeleteStep(null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (active.id.startsWith("template-")) {
      const type = active.data.current.template;

      const { data } = await supabase
        .from("pipeline_steps")
        .insert({
          pipeline_id: pipelineId,
          type,
          config: {},
          order_index: steps.length,
        })
        .select()
        .single();

      setSteps((prev) => [...prev, data]);
      return;
    }

    const oldIndex = steps.findIndex((step) => step.id === active.id);
    const newIndex = steps.findIndex((step) => step.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newSteps = arrayMove(steps, oldIndex, newIndex);

    // Update UI instantly
    setSteps(newSteps);

    // Save new order to DB
    for (let i = 0; i < newSteps.length; i++) {
      await supabase
        .from("pipeline_steps")
        .update({ order_index: i })
        .eq("id", newSteps[i].id);
    }
  };

  if (loading || loadingPlan) return <p className="text-gray-400">Loading steps...</p>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-6">
        <TemplateSidebar onSelectTemplate={handleSelectTemplate} />

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            {stepTypes.map((stepType) => (
              <button
                key={stepType.type}
                type="button"
                onClick={() => addStep(stepType.type)}
                className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_12px_rgba(255,0,0,0.7)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,0,0,0.7)] active:scale-[0.98]"
              >
                {stepType.icon} {stepType.label}
              </button>
            ))}
          </div>

          <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id}>
                  {editingId === step.id ? (
                    <div className="bg-black/80 border border-red-600 rounded-lg p-4 shadow-[0_0_10px_rgba(255,0,0,0.4)]">
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-black border border-red-600 rounded-lg px-3 py-2 text-sm text-white"
                          value={editType}
                          onChange={(e) => setEditType(e.target.value)}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            updateStep(step.id, { type: editType });
                            setEditingId(null);
                          }}
                          className="text-xs bg-red-700 px-3 py-1 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,0,0,0.7)] active:scale-[0.98]"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : plan === "free" && step.type === "integration" ? (
                    <UpgradeRequired />
                  ) : (
                    <div>
                      <SortableStepCard step={step} />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(step.id);
                            setEditType(step.type);
                          }}
                          className="text-xs bg-gray-900 border border-red-600 px-3 py-1 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteStep(step)}
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
          </SortableContext>
        </div>
      </div>
      <TemplatePreview
        template={selectedTemplate}
        onApply={() => applyTemplate(selectedTemplate)}
        onClose={() => setSelectedTemplate(null)}
      />
      <ConfirmModal
        open={Boolean(pendingDeleteStep)}
        title="Delete Step"
        message={`Delete step "${pendingDeleteStep?.type || "unknown"}"? This cannot be undone.`}
        onCancel={() => {
          if (deleting) return;
          setPendingDeleteStep(null);
        }}
        onConfirm={confirmDeleteStep}
      />
    </DndContext>
  );
}