"use client";

import { useEffect, useState } from "react";

const SELECT_OPTIONS = {
  formatType: ["tutorial", "story", "rant", "list", "myth-busting"],
  contentType: ["video", "carousel", "short", "long-form", "text"],
  tone: ["educational", "inspirational", "aggressive", "humorous", "emotional"],
  lengthCategory: ["short", "medium", "long"],
  ctaType: ["follow", "comment", "share", "click", "save"],
  hookType: ["curiosity", "shock", "authority", "contrarian", "emotional"],
  openingPattern: ["question", "statement", "story", "statistic"],
  pacingPattern: ["fast", "medium", "slow"],
  valueType: ["insight", "tutorial", "story", "entertainment", "motivation"],
  emotionProfile: ["anger", "excitement", "curiosity", "fear", "joy"]
};

export default function ContentGenomeEditor({ cardId }) {
  const [card, setCard] = useState(null);
  const [genome, setGenome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/cards/${cardId}/genome`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setCard(data.card);
          setGenome(
            data.genome || {
              formatType: "",
              contentType: "",
              platformSuitability: "",
              lengthCategory: "",
              tone: "",
              ctaType: "",
              topicCategory: "",
              subTopicCategory: "",
              seriesId: "",
              clusterId: "",
              hookType: "",
              openingPattern: "",
              pacingPattern: "",
              valueType: "",
              emotionProfile: ""
            }
          );
        }
      } catch (e) {
        setError("Failed to load genome");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [cardId]);

  function updateField(field, value) {
    setGenome((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${cardId}/genome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genome)
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGenome(data.genome);
      }
    } catch (e) {
      setError("Failed to save genome");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading content genome...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!card) return <div>Card not found.</div>;

  return (
    <div style={{ marginTop: "20px", border: "1px solid #333", padding: "16px" }}>
      <h2>Content Genome Editor</h2>
      <p><strong>Card:</strong> {card.title}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
        {/* Structural */}
        <FieldSelect
          label="Format Type"
          field="formatType"
          value={genome.formatType || ""}
          options={SELECT_OPTIONS.formatType}
          onChange={updateField}
        />
        <FieldSelect
          label="Content Type"
          field="contentType"
          value={genome.contentType || ""}
          options={SELECT_OPTIONS.contentType}
          onChange={updateField}
        />
        <FieldInput
          label="Platform Suitability (comma-separated)"
          field="platformSuitability"
          value={genome.platformSuitability || ""}
          onChange={updateField}
        />
        <FieldSelect
          label="Length Category"
          field="lengthCategory"
          value={genome.lengthCategory || ""}
          options={SELECT_OPTIONS.lengthCategory}
          onChange={updateField}
        />
        <FieldSelect
          label="Tone"
          field="tone"
          value={genome.tone || ""}
          options={SELECT_OPTIONS.tone}
          onChange={updateField}
        />
        <FieldSelect
          label="CTA Type"
          field="ctaType"
          value={genome.ctaType || ""}
          options={SELECT_OPTIONS.ctaType}
          onChange={updateField}
        />
        <FieldInput
          label="Topic Category"
          field="topicCategory"
          value={genome.topicCategory || ""}
          onChange={updateField}
        />
        <FieldInput
          label="Sub-Topic Category"
          field="subTopicCategory"
          value={genome.subTopicCategory || ""}
          onChange={updateField}
        />
        <FieldInput
          label="Series ID"
          field="seriesId"
          value={genome.seriesId || ""}
          onChange={updateField}
        />
        <FieldInput
          label="Cluster ID"
          field="clusterId"
          value={genome.clusterId || ""}
          onChange={updateField}
        />

        {/* Behavioral */}
        <FieldSelect
          label="Hook Type"
          field="hookType"
          value={genome.hookType || ""}
          options={SELECT_OPTIONS.hookType}
          onChange={updateField}
        />
        <FieldSelect
          label="Opening Pattern"
          field="openingPattern"
          value={genome.openingPattern || ""}
          options={SELECT_OPTIONS.openingPattern}
          onChange={updateField}
        />
        <FieldSelect
          label="Pacing Pattern"
          field="pacingPattern"
          value={genome.pacingPattern || ""}
          options={SELECT_OPTIONS.pacingPattern}
          onChange={updateField}
        />
        <FieldSelect
          label="Value Type"
          field="valueType"
          value={genome.valueType || ""}
          options={SELECT_OPTIONS.valueType}
          onChange={updateField}
        />
        <FieldSelect
          label="Emotion Profile"
          field="emotionProfile"
          value={genome.emotionProfile || ""}
          options={SELECT_OPTIONS.emotionProfile}
          onChange={updateField}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: "16px" }}
      >
        {saving ? "Saving..." : "Save Genome"}
      </button>
    </div>
  );
}

function FieldSelect({ label, field, value, options, onChange }) {
  return (
    <div>
      <label>
        {label}
        <br />
        <select
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function FieldInput({ label, field, value, onChange }) {
  return (
    <div>
      <label>
        {label}
        <br />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />
      </label>
    </div>
  );
}
