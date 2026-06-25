"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import platformFieldTemplates from "../utils/platformFieldTemplates";
import scriptAnalyzer from "../utils/scriptAnalyzer";
import hookGenerator from "../utils/hookGenerator";
import scriptRewriter from "../utils/scriptRewriter";
import captionGenerator from "../utils/captionGenerator";
import titleGenerator from "../utils/titleGenerator";
import hashtagGenerator from "../utils/hashtagGenerator";
import contentAngleGenerator from "../utils/contentAngleGenerator";
import contentIdeaGenerator from "../utils/contentIdeaGenerator";
import contentCalendarGenerator from "../utils/contentCalendarGenerator";
import seoKeywordExtractor from "../utils/seoKeywordExtractor";
import trendScanner from "../utils/trendScanner";
import viralPredictor from "../utils/viralPredictor";
import viralOptimizer from "../utils/viralOptimizer";
import multiPlatformRepurposer from "../utils/multiPlatformRepurposer";
import autoThumbnailGenerator from "../utils/autoThumbnailGenerator";
import postingHelper from "../utils/postingHelper";
import type { PipelineCard } from "../hooks/usePipelineData";

type Props = {
  card: PipelineCard;
  allCards: PipelineCard[];
  close: () => void;
};

export default function CardDetailsPanel({ card, allCards, close }: Props) {
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
  const sourceScript =
    localCard.script ||
    (localCard.platform_fields as Record<string, Record<string, string>>)?.youtube?.youtube_script ||
    localCard.description ||
    localCard.notes ||
    "";
  const rewritten = scriptRewriter.rewrite({
    script: card.script || sourceScript,
    topic: card.title,
    platform: card.platforms?.[0] || localCard.platforms?.[0] || "",
    niche: card.niche || localCard.niche || "",
    vibe: "aggressive", // optional
  });
  const caption = captionGenerator.generate({
    topic: card.title,
    niche: card.niche,
    platform: card.platforms?.[0] || "",
    vibe: "soft", // optional
  });
  const titles = titleGenerator.generate({
    topic: card.title,
    niche: card.niche,
    platform: card.platforms?.[0] || "",
    vibe: "aggressive", // optional
  });
  const hashtags = hashtagGenerator.generate({
    topic: card.title,
    niche: card.niche,
    platform: card.platforms?.[0],
    vibe: "aggressive", // optional
  });
  const angles = contentAngleGenerator.generate({
    topic: card.title,
    niche: card.niche,
    platform: card.platforms?.[0],
    vibe: "funny", // optional
  });
  const ideas = contentIdeaGenerator.generate({
    topic: card.title,
    niche: card.niche,
    platform: card.platforms![0],
    vibe: "funny", // optional
  });
  const calendar = contentCalendarGenerator.generate({
    topic: card.title,
    niche: card.niche,
    platforms: card.platforms,
    frequency: 1, // posts per day
    vibe: "aggressive", // optional
  });
  const keywords = seoKeywordExtractor.extract({
    topic: card.title,
    niche: card.niche,
    script: card.script,
    platform: card.platforms![0],
  });
  const trends = trendScanner.scan({
    niche: card.niche,
    platform: card.platforms![0],
  });
  const prediction = viralPredictor.predict(card, allCards);
  const optimized = viralOptimizer.optimize(card, allCards);
  const repurposed = multiPlatformRepurposer.repurpose({
    script: card.script,
    topic: card.title,
    niche: card.niche,
    vibe: "aggressive",
  });
  const thumbnails = autoThumbnailGenerator.generate({
    title: card.title,
    topic: card.topic,
    niche: card.niche,
    vibe: "aggressive",
    bestPatterns: card.bestThumbnailPatterns,
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

      <div>
        <div>Platform Posting Guide</div>
        {(localCard.platforms || []).map((platform) => {
          const key = platform.toLowerCase();
          const helper = (postingHelper as Record<string, { fields?: string[]; limits?: Record<string, number> }>)[key];
          if (!helper) return null;

          return (
            <div key={`guide-${platform}`} style={{ marginTop: 10 }}>
              <div>{platform.toUpperCase()}</div>
              {helper.fields?.length ? (
                <div>Fields: {helper.fields.join(", ")}</div>
              ) : null}
              {helper.limits ? (
                <div>
                  Limits: {Object.entries(helper.limits)
                    .map(([field, limit]) => `${field} ${limit}`)
                    .join(" | ")}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

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

      <div>
        <div>Rewritten Script</div>
        <pre>{rewritten}</pre>
      </div>

      <div>
        <div>Generated Caption</div>
        <pre>{caption}</pre>
      </div>

      <div>
        <div>Generated Titles</div>
        {titles.map((t, i) => (
          <div key={i}>{t}</div>
        ))}
      </div>

      <div>
        <div>Generated Hashtags</div>
        <pre>{hashtags}</pre>
      </div>

      <div>
        <div>Content Angles</div>
        {angles.map((a, i) => (
          <div key={i}>{a}</div>
        ))}
      </div>

      <div>
        <div>Content Ideas</div>
        {ideas.map((i, idx) => (
          <div key={idx}>{i}</div>
        ))}
      </div>

      <div>
        <div>30-Day Content Calendar</div>
        {calendar.map((day) => (
          <div key={day.day}>
            <strong>Day {day.day}</strong>
            {day.ideas.map((idea, idx) => (
              <div key={idx}>{idea}</div>
            ))}
          </div>
        ))}
      </div>

      <div>
        <div>SEO Keywords</div>
        <pre>{JSON.stringify(keywords, null, 2)}</pre>
      </div>

      <div>
        <div>Trend Insights</div>
        <pre>{JSON.stringify(trends, null, 2)}</pre>
      </div>

      <div>
        <div>Viral Prediction</div>
        <pre>{JSON.stringify(prediction, null, 2)}</pre>
      </div>

      <div>
        <div>Viral Optimization</div>

        <h4>Hook</h4>
        <pre>{optimized.hook}</pre>

        <h4>Script</h4>
        <pre>{optimized.script}</pre>

        <h4>Caption</h4>
        <pre>{optimized.caption}</pre>

        <h4>Title</h4>
        <pre>{optimized.title}</pre>

        <h4>Thumbnail Suggestions</h4>
        {optimized.thumbnailSuggestions.map((s, i) => (
          <div key={i}>{s}</div>
        ))}

        <h4>New Viral Score</h4>
        <pre>{JSON.stringify(optimized.viralPrediction, null, 2)}</pre>
      </div>

      <div>
        <div>Multi‑Platform Repurposing</div>
        <pre>{JSON.stringify(repurposed, null, 2)}</pre>
      </div>

      <div>
        <div>Auto Thumbnail Variations</div>
        <pre>{JSON.stringify(thumbnails, null, 2)}</pre>
      </div>
    </div>
  );
}
