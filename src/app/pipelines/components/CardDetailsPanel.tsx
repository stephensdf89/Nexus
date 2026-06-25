"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import platformFieldTemplates from "../utils/platformFieldTemplates";
import scriptAnalyzer from "../utils/scriptAnalyzer";
import hookGenerator from "../utils/hookGenerator";
import type { PipelineCard } from "../hooks/usePipelineData";

type Props = {
  card: PipelineCard;
  close: () => void;
};

export default function CardDetailsPanel({ card, close }: Props) {
  const [localCard, setLocalCard] = useState<PipelineCard>({
    ...card,
    platforms: card.platforms || [],
    platform_fields: card.platform_fields || {},
    analytics: card.analytics || {},
  });
  const [saving, setSaving] = useState(false);
  const suggestions = scriptAnalyzer.analyze(localCard);
  const hooks = hookGenerator.generate({
    topic: localCard.title,
    niche: localCard.niche || localCard.description || localCard.notes || "",
    platform: localCard.platforms?.[0] || "",
    vibe: "aggressive", // optional
  });

  // -----------------------------
  // AUTO-SAVE
  // -----------------------------
  async function saveCard(updated: Record<string, unknown>) {
    setSaving(true);

    await supabase
      .from("pipeline_cards")
      .update(updated)
      .eq("id", card.id)
      .select()
      .single();

    setSaving(false);
  }

  // -----------------------------
  // GENERAL FIELD UPDATE
  // -----------------------------
  function updateField(field: string, value: string) {
    const updated = { ...localCard, [field]: value };
    setLocalCard(updated);
    saveCard({ [field]: value });
  }

  // -----------------------------
  // PLATFORM FIELD UPDATE
  // -----------------------------
  function updatePlatformField(platform: string, field: string, value: string) {
    const updatedPlatformFields = {
      ...(localCard.platform_fields || {}),
      [platform]: {
        ...((localCard.platform_fields as Record<string, Record<string, string>>)?.[platform] || {}),
        [field]: value
      }
    };

    const updated = {
      ...localCard,
      platform_fields: updatedPlatformFields
    };

    setLocalCard(updated);
    saveCard({ platform_fields: updatedPlatformFields });
  }

  // -----------------------------
  // ADD PLATFORM
  // -----------------------------
  function addPlatform(platform: string) {
    if ((localCard.platforms || []).includes(platform)) return;

    const updatedPlatforms = [...(localCard.platforms || []), platform];

    const updatedPlatformFields = {
      ...(localCard.platform_fields || {}),
      [platform]: platformFieldTemplates[platform] || {}
    };

    const updated = {
      ...localCard,
      platforms: updatedPlatforms,
      platform_fields: updatedPlatformFields
    };

    setLocalCard(updated);
    saveCard({
      platforms: updatedPlatforms,
      platform_fields: updatedPlatformFields
    });
  }

  // -----------------------------
  // REMOVE PLATFORM
  // -----------------------------
  function removePlatform(platform: string) {
    const updatedPlatforms = (localCard.platforms || []).filter((p) => p !== platform);

    const updated = {
      ...localCard,
      platforms: updatedPlatforms
      // NOTE: We do NOT delete platform_fields data.
      // If they re-add the platform, their work is still there.
    };

    setLocalCard(updated);
    saveCard({ platforms: updatedPlatforms });
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        width: 400,
        height: "100vh",
        overflowY: "auto",
        padding: 20,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}
    >
      {/* Close */}
      <button onClick={close}>Close</button>

      {/* Saving indicator */}
      {saving && <div>Saving...</div>}

      {/* GENERAL FIELDS */}
      <div>
        <div>Title</div>
        <input
          value={localCard.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
        />

        <div>Description</div>
        <textarea
          value={localCard.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
        />

        <div>Notes</div>
        <textarea
          value={localCard.notes || ""}
          onChange={(e) => updateField("notes", e.target.value)}
        />

        <div>Deadline</div>
        <input
          type="date"
          value={localCard.deadline || ""}
          onChange={(e) => updateField("deadline", e.target.value)}
        />
      </div>

      {/* PLATFORM MANAGEMENT */}
      <div>
        <div>Platforms</div>

        {/* Current platforms */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(localCard.platforms || []).map((p) => (
            <div key={p} style={{ display: "flex", gap: 4 }}>
              <span>{p}</span>
              <button onClick={() => removePlatform(p)}>x</button>
            </div>
          ))}
        </div>

        {/* Add platform */}
        <div style={{ marginTop: 10 }}>
          <div>Add Platform</div>
          <select
            onChange={(e) => {
              if (e.target.value) addPlatform(e.target.value);
            }}
          >
            <option value="">Select...</option>
            {Object.keys(platformFieldTemplates).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PLATFORM-SPECIFIC FIELDS */}
      {(localCard.platforms || []).map((platform) => {
        const fields = (localCard.platform_fields as Record<string, Record<string, string>>)?.[platform] || {};

        return (
          <div key={platform} style={{ marginTop: 20 }}>
            <div>{platform.toUpperCase()}</div>

            {Object.keys(fields).map((field) => (
              <div key={field} style={{ marginTop: 10 }}>
                <div>{field}</div>
                <textarea
                  value={fields[field] || ""}
                  onChange={(e) =>
                    updatePlatformField(platform, field, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        );
      })}

      {/* ANALYTICS (if posted) */}
      {localCard.stage_id && (
        <div style={{ marginTop: 20 }}>
          <div>Analytics</div>
          <pre>{JSON.stringify(localCard.analytics, null, 2)}</pre>
        </div>
      )}

      <div>
        <div>Script Optimization</div>
        {suggestions.map((s, i) => (
          <div key={i}>{s}</div>
        ))}
      </div>

      <div>
        <div>Hook Ideas</div>
        {hooks.map((h, i) => (
          <div key={i}>{h}</div>
        ))}
      </div>
    </div>
  );
}
